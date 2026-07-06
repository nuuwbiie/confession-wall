"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface Notification {
  id: string;
  confession_id: string;
  type: string;
  content: string;
  is_read: boolean;
  created_at: string;
  confession_snippet?: string | null;
}

interface UseNotificationPollingOptions {
  userId: string | null;
  permission: string;
  onNewNotification: (notification: Notification, unreadDelta: number) => void;
}

export function useNotificationPolling({
  userId,
  permission,
  onNewNotification,
}: UseNotificationPollingOptions) {
  const shownNotifIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Notification>) => {
          const newNotif = payload.new as Notification;
          if (newNotif && newNotif.id) {
            // Skip duplicates
            if (shownNotifIds.current.has(newNotif.id)) return;
            shownNotifIds.current.add(newNotif.id);

            // Fire browser notification if permitted
            if (permission === "granted" && "Notification" in window) {
              new Notification("Confession Wall", {
                body: newNotif.content,
              });
            }

            // Notify parent to update state
            onNewNotification(newNotif, 1);
          }
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          console.warn("Realtime subscription status:", status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, permission, onNewNotification]);
}
