import type { Metadata } from "next";
import { UsersClient } from "@/components/admin/UsersClient";

export const metadata: Metadata = {
  title: "Người dùng · Quản trị MỘC",
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  return <UsersClient />;
}
