import type { Metadata } from "next";
import { CardsClient } from "@/components/admin/CardsClient";

export const metadata: Metadata = {
  title: "Thiệp cưới · Quản trị",
  robots: { index: false, follow: false },
};

export default function AdminCardsPage() {
  return <CardsClient />;
}
