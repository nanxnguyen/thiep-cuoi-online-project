import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/server/auth";
import { createRequestClient } from "@/lib/server/supabase";
import "@/components/admin/admin.css";
import { AdminFrame } from "@/components/admin/AdminFrame";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Route group keeps URLs clean (/admin, not /admin/(panel)). Single guard for
// the whole panel: the admin name is fetched once here and passed down, so
// individual pages never re-query it.
export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const client = createRequestClient({
    getAll: () => cookieStore.getAll(),
    setAll: () => {},
  });
  let adminName = "Quản trị viên";
  try {
    const admin = await requireAdmin(client);
    adminName = admin.name || admin.email;
  } catch {
    redirect("/admin/login");
  }
  return <AdminFrame adminName={adminName}>{children}</AdminFrame>;
}
