import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

// GET /api/notifications - Get notifications for current user
export async function GET(request: Request) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "true";
  const limit = parseInt(searchParams.get("limit") || "50");

  const supabase = getAdminClient();

  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id);

  if (unreadOnly) {
    query = query.eq("is_read", false);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get unread count
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  // Fetch confession snippets for the notifications
  const confessionIds = [...new Set((data || []).map((n) => n.confession_id))];
  const confessionMap: Record<string, string> = {};

  if (confessionIds.length > 0) {
    const { data: confessions } = await supabase
      .from("confessions")
      .select("id, content")
      .in("id", confessionIds);

    if (confessions) {
      for (const c of confessions) {
        confessionMap[c.id] = c.content.slice(0, 80);
      }
    }
  }

  const mappedData = (data || []).map((n) => ({
    ...n,
    confession_snippet: confessionMap[n.confession_id] || null,
  }));

  return NextResponse.json({ data: mappedData, unreadCount: unreadCount || 0 });
}