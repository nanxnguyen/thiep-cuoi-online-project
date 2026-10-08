"use client";

import { useEffect } from "react";

export type AdminToast = {
  id: number;
  message: string;
  /** Present only for reversible toggles — real deletes use ConfirmDialog instead. */
  onUndo?: () => void;
};

export type ToastProps = {
  toast: AdminToast | null;
  onClose: () => void;
};

// Bottom toast: auto-dismisses after 4.5s, offers "Hoàn tác" when reversible.
export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 4500);
    return () => clearTimeout(timer);
  }, [toast?.id, onClose]);

  if (!toast) return null;
  return (
    <div className="adm-toast-zone" aria-live="polite">
      <div className="adm-toast" role="status">
        <span className="adm-toast-msg">{toast.message}</span>
        {toast.onUndo ? (
          <button type="button" className="adm-toast-undo" onClick={() => { toast.onUndo?.(); onClose(); }}>
            Hoàn tác
          </button>
        ) : null}
        <button type="button" className="adm-toast-close" aria-label="Đóng thông báo" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
