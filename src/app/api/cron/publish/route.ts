import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/cron/publish - Auto-publish pending confessions older than 3 hours
export async function GET() {
  try {
    const supabase = getAdminClient();

    const threeHoursAgo = new Date(
      Date.now() - 3 * 60 * 60 * 1000
    ).toISOString();

    const { data: pendingConfessions, error: fetchError } = await supabase
      .from("confessions")
      .select("id")
      .eq("status", "pending")
      .lt("created_at", threeHoursAgo);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!pendingConfessions || pendingConfessions.length === 0) {
      return NextResponse.json({
        published: 0,
        message: "No pending confessions to publish",
      });
    }

    const ids = pendingConfessions.map((c) => c.id);
    const { error: updateError } = await supabase
      .from("confessions")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .in("id", ids);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      published: ids.length,
      message: `Successfully published ${ids.length} confession(s)`,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}