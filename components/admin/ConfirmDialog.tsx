"use client";

import { useEffect, useRef } from "react";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Blocking confirm for destructive actions (real deletes have no undo).
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Xoá",
  danger = true,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  // Parents pass inline callbacks; keep the latest in a ref so the effect below
  // runs once per open (re-running it would steal focus on every re-render).
  const onCancelRef = useRef(onCancel);
  useEffect(() => {
    onCancelRef.current = onCancel;
  });

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    // Destructive dialog: land on the safe choice, not on "delete".
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancelRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      // Two focusable buttons: wrap Tab / Shift+Tab inside the dialog.
      const first = cancelRef.current;
      const last = confirmRef.current;
      if (!first || !last) return;
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (active !== first && active !== last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="adm-modal-scrim" onClick={onCancel}>
      <div
        className="adm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="adm-modal-title">{title}</h2>
        <p className="adm-modal-msg">{message}</p>
        <div className="adm-modal-actions">
          <button ref={cancelRef} type="button" className="adm-btn adm-btn-ghost" disabled={busy} onClick={onCancel}>
            Huỷ bỏ
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={danger ? "adm-btn adm-btn-danger" : "adm-btn adm-btn-primary"}
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "Đang xử lý…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
