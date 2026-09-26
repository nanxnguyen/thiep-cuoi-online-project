import type { Metadata } from "next";
import { AccountClient } from "@/components/account/AccountClient";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
export const metadata: Metadata = { title: "Tài khoản", robots: { index: false, follow: false } };
export default function AccountPage() { return <><SiteHeader /><AccountClient /><SiteFooter cta={false} /></>; }
