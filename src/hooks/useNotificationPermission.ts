"use client";

import { useState, useEffect, useCallback } from "react";

export type NotificationPermissionState =
  | "default"
  | "granted"
  | "denied"
  | "unsupported";

interface UseNotificationPermissionReturn {
  permission: NotificationPermissionState;
  requestPermission: () => Promise<NotificationPermission | null>;
  isSupported: boolean;
}

export function useNotificationPermission(): UseNotificationPermissionReturn {
  const [permission, setPermission] =
    useState<NotificationPermissionState>("default");
  const isSupported =
    typeof window !== "undefined" && "Notification" in window;

  useEffect(() => {
    if (!isSupported) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as NotificationPermissionState);
  }, [isSupported]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return null;
    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermissionState);
      return result;
    } catch {
      return null;
    }
  }, [isSupported]);

  return { permission, requestPermission, isSupported };
}
