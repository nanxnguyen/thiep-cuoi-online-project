import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { product } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";
import Link from "next/link";
import { JsonLd } from "@/components/marketing/JsonLd";
import { FaqList, type Faq } from "@/components/marketing/FaqList";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { templates } from "@/lib/templates";
import { helpItem } from "@/lib/marketing/help";
import "./pricing.css";

export const metadata: Metadata = pageMetadata("/bang-gia");

// design/Bang Gia.dc.html wording; every item is live today (template count comes from the registry).
const included = [
  `${templates.length} mẫu thiệp, đổi mẫu không mất nội dung`,
  "Xác nhận tham dự và sổ lưu bút",
  "Mừng cưới QR",
  "Bản đồ, đếm ngược, thêm vào lịch",
  "Album ảnh và nhạc nền",
  "Link riêng cho từng khách",
  "Tài khoản lưu và quản lý thiệp",
  "Thiệp song ngữ Việt · Anh",
  "6 công cụ đám cưới miễn phí",
];

const planned = ["Video trong thiệp"];

// Answers come from /tro-giup word for word (lib/marketing/help.ts), so pricing never says something help does not.
// No FAQPage schema here: /tro-giup already marks these up, and Google wants one marked-up instance per site.
const PRICE_FAQ: Faq[] = [
  "Dùng MỘC có mất phí không?",
  "Thiệp cưới online có miễn phí thật không?",
  "Tôi có cần đăng ký tài khoản không?",
  "MỘC là gì?",
  "Tôi có đổi mẫu thiệp sau khi đã nhập nội dung được không?",
  "Tôi thêm được bao nhiêu ảnh?",
  "Cách gửi thiệp cưới qua Zalo cho nhiều khách?",
].map(helpItem);

export default function PricingPage() {
  return (
    <MarketingLayout path="/bang-gia" name="Bảng giá">
      <ScrollReveal />
      <section className="pricing-hero">
        <div className="pricing-kicker">BẢNG GIÁ</div>
        <div className="pricing-zero" aria-label="0 đồng">
          <span className="pricing-zero__num">0</span>
          <span className="pricing-zero__unit">đ</span>
        </div>
        <h1>
          Bảng giá thiệp cưới online: <em>miễn phí toàn bộ.</em>
        </h1>
        <p>Không có gói trả phí, không giới hạn số khách, không cần thẻ ngân hàng. Mộc được duy trì nhờ sự ủng hộ tự nguyện.</p>
      </section>
      <section className="pricing-grid" aria-label="Tính năng miễn phí và kế hoạch">
        <div className="pricing-included" data-reveal="1">
          <div className="pricing-card-head">
            <div className="pricing-card-title">
              <h2>Đã có</h2>
              <span>Dùng ngay hôm nay</span>
            </div>
            <span className="pricing-count">{included.length} MỤC</span>
          </div>
          <ul>
            {included.map((item) => (
              <li key={item}>
                <span aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <Link className="pricing-cta" href="/studio">
            Tạo thiệp miễn phí
          </Link>
        </div>
        <div className="pricing-side">
          <div className="pricing-planned" data-reveal="1" data-delay="120">
            <div className="pricing-card-title">
              <h2>Đang làm</h2>
              <span>Sẽ có trong các bản cập nhật tới</span>
            </div>
            {planned.map((item) => (
              <div className="pricing-planned__item" key={item}>
                <i aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
          <div className="pricing-donate" data-reveal="1" data-delay="220">
            <span className="pricing-donate__heart" aria-hidden="true">
              ♥
            </span>
            <h2>Thấy Mộc có ích?</h2>
            <p>Một khoản ủng hộ nhỏ giúp trả tiền máy chủ và làm thêm mẫu mới.</p>
          </div>
        </div>
      </section>
      <section className="pricing-faq" aria-label="Hỏi đáp về giá">
        <h2>Thắc mắc về giá?</h2>
        <FaqList items={PRICE_FAQ} />
        <p>
          Xem thêm <Link href="/tro-giup">31 câu hỏi thường gặp</Link> và <Link href="/templates">50 mẫu thiệp</Link>.
        </p>
      </section>
      <JsonLd
        data={product(SITE_URL, {
          name: "Thiệp cưới online MỘC",
          description: "Tạo thiệp cưới online: chọn mẫu, thêm ảnh và câu chuyện, gửi qua Zalo; khách xác nhận tham dự và mừng cưới ngay trên thiệp.",
          image: "/og.png",
          url: "/bang-gia",
        })}
      />
    </MarketingLayout>
  );
}
