"use client";

import { useEffect, useRef, useState } from "react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: TurnstileOptions) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileOptions {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  "refresh-expired"?: "auto" | "manual" | "never";
}

/**
 * Cloudflare Turnstile widget component (invisible mode by default).
 * Loads the Turnstile script dynamically and renders the widget.
 */
export default function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
  className = "",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Turnstile script if not already loaded
    if (document.getElementById("cf-turnstile-script")) {
      if (window.turnstile && containerRef.current) {
        renderWidget();
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "cf-turnstile-script";
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsLoaded(true);
      if (window.turnstile && containerRef.current) {
        renderWidget();
      }
    };
    document.body.appendChild(script);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const renderWidget = () => {
    if (!window.turnstile || !containerRef.current) return;

    // Remove existing widget if any
    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current);
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
      callback: (token: string) => {
        onVerify(token);
      },
      "expired-callback": () => {
        widgetIdRef.current = null;
        onExpire?.();
      },
      "error-callback": () => {
        onError?.();
      },
      theme: "dark",
      "refresh-expired": "auto",
    });
  };

  // Re-render when container is ready after script loads
  useEffect(() => {
    if (isLoaded && window.turnstile && containerRef.current && !widgetIdRef.current) {
      renderWidget();
    }
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className={`cf-turnstile-widget ${className}`}
      style={{ minHeight: "65px" }}
    />
  );
}

/**
 * Reset the Turnstile widget (call after successful form submission).
 */
export function resetTurnstile() {
  // Turnstile auto-refreshes tokens on each challenge
  // We just need to clear any stored token references
}
