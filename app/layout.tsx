import type { Metadata } from "next";
import { Be_Vietnam_Pro, Cormorant_Garamond, Great_Vibes, Playfair_Display } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./styles/tokens.css";
import "./globals.css";
import "./styles/motion.css";
import "./seo.css";

// Product voice: a refined high-contrast serif for headlines (roman + italic for the one emphasised phrase)
// and a clean readable sans for everything else. Both carry the Vietnamese subset.
const sans = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], weight: ["300", "400", "500", "600"], variable: "--font-sans" });
const display = Playfair_Display({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-display" });
// Design system roles "script" (quotes, formal names) and "hand" (signatures, large only). Not preloaded:
// a route downloads them only if it renders text in var(--script)/var(--hand).
const script = Cormorant_Garamond({ subsets: ["latin", "vietnamese"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-script", preload: false });
const hand = Great_Vibes({ subsets: ["latin", "vietnamese"], weight: "400", variable: "--font-hand", preload: false });

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
    <html lang="vi" className={`${sans.variable} ${display.variable} ${script.variable} ${hand.variable}`}>
      <body>{children}</body>
    </html>
  );
}
