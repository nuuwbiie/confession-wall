import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, getClientIp, rateLimitErrorResponse } from "@/lib/rate-limiter";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/confessions/[id]/like - Check if current user liked & get count
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminClient = getAdminClient();

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
    // Not authenticated - that's fine, userId remains null
  }

  // Get like count from likes table
  const { count: likes } = await adminClient
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("confession_id", id);

  // Check if current user liked
  let liked = false;
  if (userId) {
    const { data: existingLike } = await adminClient
      .from("likes")
      .select("id")
      .eq("confession_id", id)
      .eq("user_id", userId)
      .maybeSingle();
    liked = !!existingLike;
  }

  return NextResponse.json({ liked, likes: likes || 0 });
}

// POST /api/confessions/[id]/like - Toggle like on a confession
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminClient = getAdminClient();

  // Rate limiting
  const ip = getClientIp(request);
  const rateLimitResult = await checkRateLimit(ip, "like");
  if (!rateLimitResult.allowed) {
    return rateLimitErrorResponse(rateLimitResult.retryAfter);
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

  // Check if confession exists
  const { data: confession, error: fetchError } = await adminClient
    .from("confessions")
    .select("id")
    .eq("id", id)
    .single();

  if (fetchError || !confession) {
    return NextResponse.json({ error: "Confession not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "like";

  if (action === "unlike") {
    if (userId) {
      await adminClient
        .from("likes")
        .delete()
        .eq("confession_id", id)
        .eq("user_id", userId);
    }
  } else {
    if (userId) {
      const { error: insertError } = await adminClient
        .from("likes")
        .insert({ confession_id: id, user_id: userId });

      // Unique constraint violation means already liked — that's fine
      if (insertError && !insertError.message.includes("violates unique constraint")) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }
  }

  // Get updated like count
  const { count: likes } = await adminClient
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("confession_id", id);

  return NextResponse.json({
    liked: action === "like",
    likes: likes || 0,
  });
}