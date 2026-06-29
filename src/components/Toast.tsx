"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  isVisible,
  onClose,
  duration = 4000,
}: ToastProps) {
  const [rendered, setRendered] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setRendered(true);
      setAnimatingOut(false);

      const timer = setTimeout(() => {
        setAnimatingOut(true);
        setTimeout(onClose, 250);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setAnimatingOut(true);
      const timer = setTimeout(() => {
        setRendered(false);
        setAnimatingOut(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!rendered) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] pointer-events-none">
      <div
        className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg border backdrop-blur-sm transition-all duration-250 ${
          animatingOut
            ? "opacity-0 scale-95 -translate-y-2"
            : "opacity-100 scale-100 translate-y-0"
        } ${
          type === "success"
            ? "bg-secondary-container/95 text-on-secondary-container border-secondary/20"
            : "bg-error-container/95 text-on-error-container border-error/20"
        }`}
      >
        <span className="material-symbols-outlined text-sm shrink-0">
          {type === "success" ? "check_circle" : "error"}
        </span>
        <span className="font-label-sm text-label-sm">{message}</span>
        <button
          onClick={() => {
            setAnimatingOut(true);
            setTimeout(onClose, 250);
          }}
          className="p-1 rounded-full hover:opacity-70 transition-opacity shrink-0 ml-1"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
}
