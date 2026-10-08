"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar.tsx";
import type { AdminNavKey } from "./AdminSidebar.tsx";

export type AdminShellProps = {
  active: AdminNavKey;
  adminName: string;
  onLogout: () => void;
  children: ReactNode;
};

// Desktop: sticky 240px sidebar + main. Under 1024px the sidebar becomes a
// topbar + hamburger drawer (Esc/scrim closes, focus moves into the drawer).
export function AdminShell({ active, adminName, onLogout, children }: AdminShellProps) {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    drawerRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <div className="adm-shell">
      <div className="adm-shell-side">
        <AdminSidebar active={active} adminName={adminName} onLogout={onLogout} />
      </div>
      <div className="adm-main-col">
        <header className="adm-topbar">
          <button
            type="button"
            className="adm-burger"
            aria-label="Mở menu quản trị"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
          <span className="adm-topbar-title">MỘC · Quản trị</span>
        </header>
        <div
          className={open ? "adm-scrim adm-scrim-open" : "adm-scrim"}
          aria-hidden={!open}
          onClick={close}
        />
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu quản trị"
          className={open ? "adm-drawer adm-drawer-open" : "adm-drawer"}
        >
          <button type="button" className="adm-drawer-close" aria-label="Đóng menu" onClick={close}>
            ✕
          </button>
          <div onClick={close}>
            <AdminSidebar active={active} adminName={adminName} onLogout={onLogout} />
          </div>
        </div>
        <main className="adm-main">{children}</main>
      </div>
    </div>
  );
}
