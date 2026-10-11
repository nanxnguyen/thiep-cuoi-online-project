import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tài liệu API",
  robots: { index: false, follow: false },
  alternates: { canonical: "/docs" },
};

export default function DocsLayout({ children }: { children: ReactNode }) {
  return children;
}
