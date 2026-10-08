import type { Metadata } from "next";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/server/auth";
import { createRequestClient } from "@/lib/server/supabase";
import { DashboardClient } from "@/components/admin/DashboardClient";

export const metadata: Metadata = {
  title: "Tổng quan · Quản trị Mộc",
  robots: { index: false, follow: false },
};

// The (panel)/layout.tsx owns the requireAdmin guard + admin shell chrome;
// this page only re-reads the admin name (one extra getUser call, no DB) and
// passes it down so DashboardClient stays content-only with no /me fetch.
export default async function AdminDashboardPage() {
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
    // Unreachable through the layout guard (it redirects first); keep the
    // fallback so a direct render never crashes on an empty name.
  }
  return <DashboardClient adminName={adminName} />;
}
