import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/confessions/[id]/comments - Fetch comments for a confession
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("confession_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

// POST /api/confessions/[id]/comments - Add a comment to a confession
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getAdminClient();

  // Check confession exists and allows replies
  const { data: confession, error: fetchError } = await supabase
    .from("confessions")
    .select("id, allow_replies, status")
    .eq("id", id)
    .single();

  if (fetchError || !confession) {
    return NextResponse.json({ error: "Confession not found" }, { status: 404 });
  }

  if (!confession.allow_replies) {
    return NextResponse.json({ error: "This confession does not allow replies" }, { status: 403 });
  }

  const body = await request.json();
  const { content } = body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  if (content.trim().length > 500) {
    return NextResponse.json({ error: "Comment too long (max 500 characters)" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      confession_id: id,
      content: content.trim(),
      user_id: null, // anonymous for now
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, success: true }, { status: 201 });
}