import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL("https://moc-wedding.chatgpt.site"),
  title: { default: "MỘC — Thiệp cưới online theo cách riêng", template: "%s | MỘC Wedding" },
  description: "Tạo thiệp cưới online hiện đại, cá nhân hóa với ảnh, nhạc và câu chuyện của hai bạn.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "vi_VN", siteName: "MỘC Wedding", title: "MỘC — Một lời mời thật riêng", description: "Tạo chiếc thiệp cưới online mang dấu ấn của hai bạn." },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body className={`${sans.variable} ${display.variable}`}>{children}</body></html>;
}
