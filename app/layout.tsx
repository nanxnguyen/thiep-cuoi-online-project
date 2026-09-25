import type { Metadata } from "next";
import { Noto_Serif_Display, Plus_Jakarta_Sans } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";
import "./seo.css";

// Product voice: a refined high-contrast serif for headlines (roman + italic for the one emphasised phrase)
// and a clean readable sans for everything else. Both carry the Vietnamese subset.
const sans = Plus_Jakarta_Sans({ subsets: ["latin", "vietnamese"], variable: "--font-sans" });
const display = Noto_Serif_Display({ subsets: ["latin", "vietnamese"], style: ["normal", "italic"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "MỘC — Thiệp cưới online sang trọng, đậm dấu ấn của hai bạn", template: "%s | MỘC Wedding" },
  description: "Tạo thiệp cưới online hiện đại, sang trọng: chọn mẫu, thêm ảnh và câu chuyện, gửi qua Zalo. Khách xác nhận tham dự, gửi lời chúc và mừng cưới ngay trên thiệp.",
  alternates: { canonical: "/" },
  icons: { icon: "/icon.svg" },
  openGraph: { type: "website", locale: "vi_VN", siteName: "MỘC Wedding", title: "MỘC — Thiệp cưới online sang trọng", description: "Tạo chiếc thiệp cưới online mang dấu ấn của hai bạn.", images: [{ url: "/og.png", width: 1200, height: 630, alt: "MỘC Wedding — thiệp cưới online" }] },
  twitter: { card: "summary_large_image", images: [{ url: "/og.png", alt: "MỘC Wedding — thiệp cưới online" }] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // The font variables must sit on <html>: globals.css derives --display/--sans from them on :root.
    <html lang="vi" className={`${sans.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
