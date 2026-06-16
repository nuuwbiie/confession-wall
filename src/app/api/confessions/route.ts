import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { containsProfanity } from "@/lib/profanity-filter";

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
  const status = searchParams.get("status") || "published";
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  // Use admin client for pending reads (bypass RLS), anon for published
  const supabase = status === "pending" ? getAdminClient() : getAnonClient();

  let query = supabase.from("confessions").select("*", { count: "exact" });

  if (status === "pending") {
    query = query.eq("status", "pending");
  } else {
    query = query.eq("status", "published");
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data || [],
    count: count || 0,
    offset,
    limit,
  });
}

// POST /api/confessions - Submit a new confession (bypasses RLS)
export async function POST(request: Request) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();

    const { content, font, is_public, allow_replies, is_anonymous } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    if (content.trim().length < 10) {
      return NextResponse.json({ error: "Content must be at least 10 characters" }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: "Content must be less than 2000 characters" }, { status: 400 });
    }
    if (containsProfanity(content)) {
      return NextResponse.json(
        { error: "Maaf, cerita Anda mengandung kata-kata yang tidak pantas. Silakan edit dan coba lagi." },
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

    const { data, error } = await supabase
      .from("confessions")
      .insert({
        content: content.trim(),
        font: font || "sans",
        is_public: is_public !== false,
        allow_replies: allow_replies !== false,
        is_anonymous: is_anonymous !== false,
        status: "pending",
        user_id: userId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
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