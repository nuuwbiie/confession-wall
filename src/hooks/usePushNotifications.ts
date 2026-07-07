"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * urlBase64ToUint8Array — Convert a base64url-encoded VAPID public key
 * to a Uint8Array for the PushManager.subscribe() call.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface UsePushNotificationsReturn {
  swReady: boolean;
  isSubscribed: boolean;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<void>;
  error: string | null;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [swReady, setSwReady] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const swRegistration = useRef<ServiceWorkerRegistration | null>(null);

  // Register service worker on mount
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setError("Push notifications not supported in this browser");
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      })
      .then(async (registration) => {
        swRegistration.current = registration;
        setSwReady(true);

        // Force check for new SW version (picks up updated sw.js)
        registration.update();

        // Check if already subscribed
        const sub = await registration.pushManager.getSubscription();
        setIsSubscribed(sub !== null);

        // Listen for messages from SW (e.g., SW_ACTIVATED)
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data?.type === "SW_ACTIVATED") {
            // Re-check subscription status after SW activation
            registration.pushManager.getSubscription().then((s) => {
              setIsSubscribed(s !== null);
            });
          }
          if (event.data?.type === "PUSH_SUBSCRIPTION_EXPIRED") {
            // Re-subscribe
            subscribe();
          }
        });
      })
      .catch((err) => {
        setError("Failed to register service worker: " + err.message);
      });
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!swRegistration.current) {
      setError("Service worker not ready");
      return false;
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      setError("VAPID public key not configured");
      return false;
    }

    try {
      const sub = await swRegistration.current.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any,
      });

      // Save subscription to server
      const serializedSub = JSON.parse(JSON.stringify(sub));
      const res = await fetch("/api/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: serializedSub }),
      });

      if (res.ok) {
        setIsSubscribed(true);
        setError(null);
        return true;
      } else {
        // If save fails, unsubscribe to keep clean state
        await sub.unsubscribe();
        setError("Failed to save subscription on server");
        return false;
      }
    } catch (err: any) {
      setError(err.message || "Failed to subscribe to push");
      return false;
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (!swRegistration.current) return;

    try {
      const sub = await swRegistration.current.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();

        // Remove from server
        const params = new URLSearchParams({ endpoint });
        await fetch(`/api/push-subscribe?${params.toString()}`, {
          method: "DELETE",
        });
      }
    } catch {
      // Ignore unsubscribe errors
    }

    setIsSubscribed(false);
  }, []);

  return { swReady, isSubscribed, subscribe, unsubscribe, error };
}
