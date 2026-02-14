"use client";

/**
 * Toast component for success/error notifications
 */
import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, type, onDismiss, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  const bgColor =
    type === "success"
      ? "bg-amber-600 dark:bg-amber-500"
      : type === "error"
        ? "bg-red-600 dark:bg-red-500"
        : "bg-stone-700 dark:bg-stone-600";

  return (
    <div
      role="alert"
      className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 text-white ${bgColor} transition-colors`}
    >
      <p className="font-medium">{message}</p>
    </div>
  );
}
