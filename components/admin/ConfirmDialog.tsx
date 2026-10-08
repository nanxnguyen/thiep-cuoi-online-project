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
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

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
          <button type="button" className="adm-btn adm-btn-ghost" disabled={busy} onClick={onCancel}>
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
