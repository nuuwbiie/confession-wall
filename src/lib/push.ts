import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@confessionwall.app";

// Initialize web-push with VAPID keys (lazy — only called when needed)
function ensureVapidConfigured(): boolean {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return false;
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  return true;
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Send a push notification to all subscribed devices for a given user.
 * Returns { sent, failed } counts.
 * This is non-blocking — errors are logged but not thrown.
 */
export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  url?: string
): Promise<{ sent: number; failed: number }> {
  if (!ensureVapidConfigured()) {
    return { sent: 0, failed: 0 };
  }

  const supabase = getAdminClient();
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("id, subscription")
    .eq("user_id", userId);

  if (error || !subscriptions || subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const payload = JSON.stringify({
    title,
    body,
    url: url || "/",
  });

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub.subscription as any, payload);
      sent++;
    } catch (err: any) {
      // If subscription is expired/invalid, delete it
      if (
        err.statusCode === 410 ||
        err.statusCode === 404 ||
        err.message?.includes("expired") ||
        err.message?.includes("unsubscribed")
      ) {
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      }
      failed++;
    }
  }

  return { sent, failed };
}
