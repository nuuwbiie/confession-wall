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

async function getAuthUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );
    const { data: { user } } = await authClient.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// POST /api/push-subscribe — Save a new push subscription
export async function POST(request: Request) {
  const userId = await getAuthUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();

  try {
    const body = await request.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Invalid subscription object" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("push_subscriptions").insert({
      user_id: userId,
      subscription,
    });

    if (error) {
      // If duplicate (same user + same subscription), that's fine
      if (error.message?.includes("duplicate") || error.code === "23505") {
        return NextResponse.json({ success: true, message: "Already subscribed" });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: "Subscribed" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// DELETE /api/push-subscribe — Remove a push subscription
export async function DELETE(request: Request) {
  const userId = await getAuthUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();

  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");

    if (endpoint) {
      // Remove specific subscription by endpoint
      const { data: subscriptions } = await supabase
        .from("push_subscriptions")
        .select("id, subscription")
        .eq("user_id", userId);

      if (subscriptions) {
        for (const sub of subscriptions) {
          const subData = sub.subscription as { endpoint?: string };
          if (subData.endpoint === endpoint) {
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          }
        }
      }
    } else {
      // Remove all subscriptions for this user
      await supabase.from("push_subscriptions").delete().eq("user_id", userId);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}
