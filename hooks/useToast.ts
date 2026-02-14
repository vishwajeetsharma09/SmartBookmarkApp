"use client";

/**
 * Toast hook for managing toast state
 */
import React, { useCallback, useState } from "react";
import { Toast, type ToastType } from "@/components/Toast";

interface ToastState {
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const ToastComponent = toast
    ? React.createElement(Toast, {
        message: toast.message,
        type: toast.type,
        onDismiss: dismissToast,
      })
    : null;

  return { showToast, ToastComponent };
}
