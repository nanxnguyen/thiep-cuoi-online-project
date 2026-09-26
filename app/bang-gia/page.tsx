import type { Metadata } from "next";
import Link from "next/link";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { templates } from "@/lib/templates";
import "./pricing.css";

export const metadata: Metadata = {
  title: "Bảng giá",
  description: "MỘC hiện miễn phí trong giai đoạn ra mắt: không cần tài khoản, không cần thẻ. Xem những gì có sẵn và những gì đang được lên kế hoạch.",
  alternates: { canonical: "/bang-gia" },
};

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
  "7 công cụ đám cưới miễn phí",
];

const planned = ["Video trong thiệp"];

export default function PricingPage() {
  return (
    <MarketingLayout>
      <ScrollReveal />
      <section className="pricing-hero">
        <div className="pricing-kicker">BẢNG GIÁ</div>
        <div className="pricing-zero" aria-label="0 đồng">
          <span className="pricing-zero__num">0</span>
          <span className="pricing-zero__unit">đ</span>
        </div>
        <h1>
          Miễn phí cho mọi cặp đôi, <em>mọi tính năng.</em>
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
            <Link href="/ung-ho">Ủng hộ dự án</Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
