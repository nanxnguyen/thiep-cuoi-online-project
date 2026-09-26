import type { Metadata } from "next";
import Link from "next/link";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
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
      <section className="pricing-hero"><span className="pricing-kicker">BẢNG GIÁ</span><div className="pricing-hero__zero" aria-label="0 đồng">0<span>đ</span></div><h1>Miễn phí cho mọi cặp đôi, <em>mọi tính năng.</em></h1><p>Không có gói trả phí, không giới hạn số khách, không cần thẻ ngân hàng. MỘC được duy trì nhờ sự ủng hộ tự nguyện.</p></section>
      <section className="pricing-grid" aria-label="Tính năng miễn phí và kế hoạch"><div className="pricing-included"><div className="pricing-card-head"><div><h2>Đã có</h2><p>Dùng ngay hôm nay</p></div><span>{included.length} MỤC</span></div><ul>{included.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul><Link className="button-primary" href="/studio">Tạo thiệp miễn phí</Link></div><div className="pricing-side"><div className="pricing-planned"><h2>Đang làm</h2><p>Sẽ có trong các bản cập nhật tới</p>{planned.map((item) => <span key={item}><i aria-hidden="true" />{item}</span>)}</div><div className="pricing-donate"><span aria-hidden="true">♥</span><h2>Thấy MỘC có ích?</h2><p>Một khoản ủng hộ nhỏ giúp trả tiền máy chủ và làm thêm mẫu mới.</p><Link href="/ung-ho">Ủng hộ dự án</Link></div></div></section>
    </MarketingLayout>
  );
}
