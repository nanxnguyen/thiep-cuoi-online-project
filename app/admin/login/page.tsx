import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/server/auth";
import { createRequestClient } from "@/lib/server/supabase";
import { AdminLoginForm } from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const client = createRequestClient({
    getAll: () => cookieStore.getAll(),
    setAll: () => {},
  });
  try {
    await requireAdmin(client);
  } catch {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: "var(--paper)",
          color: "var(--ink)",
          boxSizing: "border-box",
        }}
      >
        <AdminLoginForm />
      </main>
    );
  }
  redirect("/admin");
}
