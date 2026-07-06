import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sendPushToUser } from "@/lib/push";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getAuthUser() {
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
    return user;
  } catch {
    return null;
  }
}

// GET /api/confessions/[id]/hr-reply - Get HR reply (only for confession owner or admin)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin === true;

  // Check if user is confession owner
  const { data: confession } = await supabase
    .from("confessions")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!confession) {
    return NextResponse.json({ error: "Confession not found" }, { status: 404 });
  }

  const isOwner = confession.user_id === user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("hr_replies")
    .select("*")
    .eq("confession_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

// POST /api/confessions/[id]/hr-reply - Create HR reply (admin only)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profile?.is_admin !== true) {
    return NextResponse.json({ error: "Only admin can reply" }, { status: 403 });
  }

  const body = await request.json();
  const { content } = body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  if (content.trim().length > 2000) {
    return NextResponse.json({ error: "Reply too long (max 2000 characters)" }, { status: 400 });
  }

  // Get confession info for notification
  const { data: confession } = await supabase
    .from("confessions")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!confession) {
    return NextResponse.json({ error: "Confession not found" }, { status: 404 });
  }

  // Cannot reply to anonymous confessions (user_id is null)
  if (!confession.user_id) {
    return NextResponse.json(
      { error: "Tidak dapat membalas confession dari pengguna anonim" },
      { status: 400 }
    );
  }

  // Insert HR reply
  const { data, error } = await supabase
    .from("hr_replies")
    .insert({
      confession_id: id,
      content: content.trim(),
      admin_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Create notification for confession owner (if exists and not anonymous)
  if (confession.user_id) {
    await supabase.from("notifications").insert({
      user_id: confession.user_id,
      confession_id: id,
      type: "hr_reply",
      content: "HR telah membalas confession Anda. Klik untuk melihat balasan.",
    });

    // Send push notification to confession owner
    await sendPushToUser(
      confession.user_id,
      "Balasan HR",
      "HR telah membalas confession Anda.",
      "/"
    );
  }

  return NextResponse.json({ data, success: true }, { status: 201 });
}