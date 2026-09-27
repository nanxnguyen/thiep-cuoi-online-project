"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AuthForm } from "@/components/account/AuthForm";
import "@/components/account/account.css";

type Props = { open: boolean; onClose: () => void };

// design/Site Header.dc.html's login popup: native <dialog> gives focus-trap/Esc/backdrop-click for free. Google
// is a full-page redirect, so there's no in-page "success" to hand back — the header re-checks the session itself
// once the browser returns.
export function LoginModal({ open, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog className="login-dlg" ref={dialog} onClose={onClose} aria-label="Đăng nhập">
      <div className="login-dlg__body">
        <button type="button" className="login-dlg__close" aria-label="Đóng" onClick={onClose}>
          ×
        </button>
        <span className="login-dlg__mark" aria-hidden="true">
          M
        </span>
        <AuthForm variant="modal" googleNext={pathname} />
      </div>
    </dialog>
  );
}
