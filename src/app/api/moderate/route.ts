import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// POST /api/moderate - HR moderation actions (approve, delete, reply, approve_all)
export async function POST(request: Request) {
  const supabase = getAdminClient();

  const body = await request.json();
  const { action, confession_id, message } = body;

  switch (action) {
    case "approve_all": {
      const { error } = await supabase
        .from("confessions")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("status", "pending");

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "All pending confessions approved and published" });
    }

    case "approve": {
      if (!confession_id) {
        return NextResponse.json({ error: "confession_id is required for approve" }, { status: 400 });
      }
      const { error } = await supabase
        .from("confessions")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", confession_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "Confession approved and published" });
    }

    case "delete": {
      if (!confession_id) {
        return NextResponse.json({ error: "confession_id is required for delete" }, { status: 400 });
      }
      const { error } = await supabase
        .from("confessions")
        .delete()
        .eq("id", confession_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "Confession deleted" });
    }

    case "reject": {
      if (!confession_id) {
        return NextResponse.json({ error: "confession_id is required for reject" }, { status: 400 });
      }
      const { error } = await supabase
        .from("confessions")
        .update({ status: "rejected" })
        .eq("id", confession_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "Confession rejected" });
    }

    case "reply": {
      if (!confession_id) {
        return NextResponse.json({ error: "confession_id is required for reply" }, { status: 400 });
      }
      if (!message) {
        return NextResponse.json({ error: "Message is required for reply" }, { status: 400 });
      }
      const { error } = await supabase.from("comments").insert({
        confession_id,
        content: message,
        user_id: null,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "Reply sent" });
    }

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}