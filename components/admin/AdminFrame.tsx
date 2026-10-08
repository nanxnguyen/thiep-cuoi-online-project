"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { api } from "@/lib/api";
import { AdminShell } from "./AdminShell.tsx";
import type { AdminNavKey } from "./AdminSidebar.tsx";

function activeFromPathname(pathname: string): AdminNavKey {
  if (pathname.startsWith("/admin/users")) return "users";
  if (pathname.startsWith("/admin/cards")) return "cards";
  if (pathname.startsWith("/admin/templates")) return "templates";
  return "overview";
}

export function AdminFrame({ adminName, children }: { adminName: string; children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  async function handleLogout() {
    try {
      await api.admin.logout();
    } catch {
      // Still leave the panel even if the API call fails.
    }
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <AdminShell active={activeFromPathname(pathname)} adminName={adminName} onLogout={handleLogout}>
      {children}
    </AdminShell>
  );
}
