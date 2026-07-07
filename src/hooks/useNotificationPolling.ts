"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  const channelRef = useRef<any>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  const setupSubscription = useCallback(() => {
    if (!userId) return;

    // Clean up existing channel first
    if (channelRef.current && supabaseRef.current) {
      supabaseRef.current.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const supabase = createClient();
    supabaseRef.current = supabase;

    const channel = supabase
      .channel(`notifications-realtime-${userId}`, {
        config: {
          presence: { key: userId },
        },
      })
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
              try {
                new Notification("Confession Wall", {
                  body: newNotif.content,
                  icon: "/icon-192.png",
                });
              } catch {
                // Notification API may fail if user hasn't granted permission
              }
            }

            // Notify parent to update state
            onNewNotification(newNotif, 1);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[realtime] Subscribed to notifications for user", userId);
        } else if (status === "CLOSED") {
          console.warn("[realtime] Subscription closed, retrying in 3s...", userId);
          // Retry after 3 seconds
          setTimeout(() => {
            if (userId) setupSubscription();
          }, 3000);
        } else {
          console.warn("[realtime] Subscription status:", status);
        }
      });

    channelRef.current = channel;
  }, [userId, permission, onNewNotification]);

  useEffect(() => {
    if (!userId) return;

    // Small delay to ensure auth is loaded before subscribing
    const timer = setTimeout(() => {
      setupSubscription();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (channelRef.current && supabaseRef.current) {
        supabaseRef.current.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [setupSubscription]);
}
