import type { Metadata } from "next";
import { AccountClient } from "@/components/account/AccountClient";
export const metadata: Metadata = { title: "Tài khoản", robots: { index: false, follow: false } };
export default function AccountPage() { return <AccountClient />; }
