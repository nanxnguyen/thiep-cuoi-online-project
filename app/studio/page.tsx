import type { Metadata } from "next";
import { StudioShell } from "@/components/studio/StudioShell";

export const metadata: Metadata = { title: "Tạo thiệp cưới", robots: { index: false, follow: false } };
export default function StudioPage() { return <StudioShell />; }
