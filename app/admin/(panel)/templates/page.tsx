import type { Metadata } from "next";
import { TemplatesClient } from "@/components/admin/TemplatesClient";

export const metadata: Metadata = {
  title: "Mẫu thiệp · Quản trị",
  robots: { index: false, follow: false },
};

export default function AdminTemplatesPage() {
  return <TemplatesClient />;
}
