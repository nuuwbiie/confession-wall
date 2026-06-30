import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { moderateContent } from "@/lib/gemini-moderation";
import { containsProfanity } from "@/lib/profanity-filter";
import { checkRateLimit, getClientIp, rateLimitErrorResponse } from "@/lib/rate-limiter";
import { verifyTurnstileToken } from "@/lib/turnstile-verify";
import { sendPushToUser } from "@/lib/push";

// Create admin client with service_role key (bypasses RLS)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Create anonymous client for public reads
function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// GET /api/confessions - Fetch confessions
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status") || "published";
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  // Support comma-separated statuses, e.g. "published,rejected"
  const statuses = statusParam.split(",").filter(Boolean);

  // Use admin client for non-public reads (bypass RLS)
  const needsAdmin = statuses.some((s) => s !== "published");
  const supabase = needsAdmin ? getAdminClient() : getAnonClient();

  let query = supabase
    .from("confessions")
    .select(
      "*, likes(count), comments(count)",
      { count: "exact" }
    );

  if (statuses.length === 1) {
    query = query.eq("status", statuses[0]);
  } else {
    query = query.in("status", statuses);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Collect unique user IDs to fetch profiles
  const userIds = [...new Set((data || []).map((item: any) => item.user_id).filter(Boolean))];

  // Fetch profiles for all relevant users
  const profileMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const adminClient = getAdminClient();
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id, username")
      .in("id", userIds);

    if (profiles) {
      for (const profile of profiles) {
        profileMap[profile.id] = profile.username;
      }
    }
  }

  // Flatten the likes(count) and comments(count) subqueries into plain numbers
  // and set author_username based on is_anonymous flag
  const mappedData = (data || []).map((item: any) => ({
    ...item,
    likes: item.likes?.[0]?.count ?? 0,
    comments: item.comments?.[0]?.count ?? 0,
    author_username:
      item.is_anonymous === false && item.user_id && profileMap[item.user_id]
        ? profileMap[item.user_id]
        : null,
  }));

  return NextResponse.json({
    data: mappedData,
    count: count || 0,
    offset,
    limit,
  });
}

// POST /api/confessions - Submit a new confession (bypasses RLS)
export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rateLimitResult = await checkRateLimit(ip, "create_confession");
    if (!rateLimitResult.allowed) {
      return rateLimitErrorResponse(rateLimitResult.retryAfter);
    }

    const supabase = getAdminClient();
    const body = await request.json();

    const { content, font, is_public, allow_replies, is_anonymous, honeypot, turnstileToken } = body;

    // Honeypot check: if this field is filled, it's a bot
    if (honeypot) {
      console.warn(`Honeypot triggered from IP ${ip} — silently rejecting`);
      // Return fake success to not tip off the bot
      return NextResponse.json({ data: { id: "fake" }, success: true }, { status: 201 });
    }

    // Turnstile verification
    const turnstileResult = await verifyTurnstileToken(turnstileToken);
    if (!turnstileResult.success) {
      return NextResponse.json(
        { error: turnstileResult.error || "Verifikasi keamanan gagal" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    if (content.trim().length < 10) {
      return NextResponse.json({ error: "Content must be at least 10 characters" }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: "Content must be less than 2000 characters" }, { status: 400 });
    }
    // Moderasi konten menggunakan AI Gemini
    // Fallback ke filter lokal jika Gemini gagal (quota exhausted, dll)
    let moderationPassed = true;
    let moderationError = "";

    try {
      const moderationResult = await moderateContent(content);
      if (moderationResult.is_flagged) {
        moderationPassed = false;
        moderationError = `Maaf, cerita Anda tidak dapat dikirim karena mengandung konten yang tidak pantas: ${moderationResult.reason || "Teks tidak sesuai pedoman"}. Silakan edit dan coba lagi.`;
      }
    } catch (modError) {
      // Gemini gagal (quota exhausted / network error) → fallback ke filter lokal
      console.warn("Gemini moderation unavailable, falling back to local filter:", modError);
      if (containsProfanity(content)) {
        moderationPassed = false;
        moderationError = "Maaf, cerita Anda mengandung kata-kata yang tidak pantas. Silakan edit dan coba lagi.";
      }
    }

    if (!moderationPassed) {
      return NextResponse.json(
        { error: moderationError },
        { status: 400 }
      );
    }
    const validFonts = ["sans", "serif", "mono", "handwriting"];
    if (font && !validFonts.includes(font)) {
      return NextResponse.json({ error: "Invalid font" }, { status: 400 });
    }

    // Detect authenticated user from cookie
    let userId: string | null = null;
    try {
      const cookieStore = await cookies();
      const authClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return cookieStore.getAll(); },
            setAll() {},
          },
        }
      );
      const { data: { user } } = await authClient.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      // Not authenticated
    }

    // Try insert with is_anonymous first; fallback if column doesn't exist in schema cache
    let insertPayload: Record<string, any> = {
      content: content.trim(),
      font: font || "sans",
      is_public: is_public !== false,
      allow_replies: allow_replies !== false,
      status: "pending",
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    // Only include is_anonymous if user explicitly set it (the column exists in migration)
    if (is_anonymous !== undefined) {
      insertPayload.is_anonymous = is_anonymous !== false;
    }

    const { data, error } = await supabase
      .from("confessions")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      // If error is about is_anonymous column, retry without it
      if (error.message && error.message.toLowerCase().includes("is_anonymous")) {
        delete insertPayload.is_anonymous;
        const retryResult = await supabase
          .from("confessions")
          .insert(insertPayload)
          .select()
          .single();

        if (retryResult.error) {
          return NextResponse.json({ error: retryResult.error.message }, { status: 500 });
        }

        // Notify admins about new confession (retry path)
        const insertedId = retryResult.data.id;
        try {
          const { data: admins } = await supabase
            .from("profiles")
            .select("id")
            .eq("is_admin", true);
          if (admins && admins.length > 0) {
            await supabase.from("notifications").insert(
              admins.map((admin: { id: string }) => ({
                user_id: admin.id,
                confession_id: insertedId,
                type: "new_confession",
                content: "Confession baru menunggu review.",
              }))
            );
            // Send push to all admins
            for (const admin of admins) {
              await sendPushToUser(
                admin.id,
                "Confession Baru",
                "Confession baru menunggu review.",
                "/dashboard"
              );
            }
          }
        } catch {
          // Non-critical: don't fail the request
        }

        return NextResponse.json({ data: retryResult.data, success: true }, { status: 201 });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Notify admins about new confession
    try {
      const { data: admins } = await supabase
        .from("profiles")
        .select("id")
        .eq("is_admin", true);
      if (admins && admins.length > 0) {
        await supabase.from("notifications").insert(
          admins.map((admin: { id: string }) => ({
            user_id: admin.id,
            confession_id: data.id,
            type: "new_confession",
            content: "Confession baru menunggu review.",
          }))
        );
        // Send push to all admins
        for (const admin of admins) {
          await sendPushToUser(
            admin.id,
            "Confession Baru",
            "Confession baru menunggu review.",
            "/dashboard"
          );
        }
      }
    } catch {
      // Non-critical: don't fail the request
    }

    return NextResponse.json({ data, success: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/confessions error:", err);
    return NextResponse.json(
      { error: "Internal server error: " + (err instanceof Error ? err.message : "Unknown error") },
      { status: 500 }
    );
  }
}