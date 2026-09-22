import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/marketing/FaqList";
import { CtaBand, MarketingLayout, PageHero } from "@/components/marketing/MarketingLayout";
import { MAX_ACCOUNTS, MAX_ALBUM, MAX_EVENTS, MAX_QUESTIONS } from "@/lib/content";
import { templates } from "@/lib/templates";

export const metadata: Metadata = {
  title: "Bảng giá",
  description: "MỘC hiện miễn phí trong giai đoạn ra mắt: không cần tài khoản, không cần thẻ. Xem những gì có sẵn và những gì đang được lên kế hoạch.",
  alternates: { canonical: "/bang-gia" },
};

// Everything in "included" is live today, and the numbers come from the same constants the editor enforces.
const included = [
  `${templates.length} mẫu thiệp, đổi mẫu lúc nào cũng được mà nội dung giữ nguyên`,
  "Studio chỉnh sửa có xem trước trực tiếp và tự lưu",
  "Xuất bản với đường dẫn riêng, gỡ xuất bản khi cần",
  `Tối đa ${MAX_EVENTS} sự kiện, mỗi sự kiện có địa chỉ, chỉ đường và bản đồ`,
  "Đếm ngược, thêm vào Google Calendar và tệp lịch .ics",
  `Ảnh bìa và tối đa ${MAX_ALBUM} ảnh album, xem phóng to`,
  "Nhạc nền mp3",
  `Xác nhận tham dự với tối đa ${MAX_QUESTIONS} câu hỏi riêng và bảng tổng kết`,
  "Sổ lưu bút, chủ thiệp ẩn được từng lời chúc",
  `Hộp mừng cưới VietQR, tối đa ${MAX_ACCOUNTS} tài khoản`,
  "Phong bì ghi tên từng khách bằng ?to=",
];

const planned = [
  "Quản lý danh sách khách mời và link riêng cho từng khách",
  "Tài khoản, để không lo mất link chỉnh sửa",
  "Thiệp song ngữ Việt - Anh",
  "Video thiệp",
];

const faq = [
  { q: "Tôi có cần thẻ ngân hàng hay đăng ký để dùng không?", a: "Không. Hai bạn vào Studio, chọn mẫu và làm thiệp ngay, không cần tài khoản hay thẻ." },
  { q: "MỘC có thu phí khi khách mừng cưới bằng QR không?", a: "Không. Tiền đi thẳng từ khách sang tài khoản của hai bạn, MỘC không đứng giữa." },
  { q: "Thiệp có quảng cáo không?", a: "Không có quảng cáo. Ở cuối thiệp có một dòng nhỏ \"Thiệp được tạo bằng MỘC\"." },
  { q: "Khi nào có gói trả phí?", a: "Chưa có kế hoạch và mức giá cụ thể. Nếu có gói trả phí, thông tin sẽ được công bố tại trang này trước khi áp dụng." },
];

export default function PricingPage() {
  return (
    <MarketingLayout>
      <PageHero
        crumbs={[{ label: "Bảng giá" }]}
        eyebrow="Bảng giá"
        title={
          <>
            Hiện tại, MỘC
            <br />
            <em>hoàn toàn miễn phí.</em>
          </>
        }
        lede="Trong giai đoạn ra mắt, hai bạn dùng đầy đủ mọi tính năng mà không cần tài khoản hay thẻ ngân hàng."
      >
        <div className="actions">
          <Link className="button-primary" href="/studio">
            Bắt đầu miễn phí
          </Link>
        </div>
      </PageHero>

      <section className="mk-section" aria-labelledby="plans">
        <h2 className="mk-sr" id="plans">
          Những gì có sẵn và đang lên kế hoạch
        </h2>
        <div className="mk-price">
          <div className="mk-card">
            <p className="eyebrow">Đang có</p>
            <p className="mk-price__big">0đ</p>
            <p>Mọi thứ dưới đây đã dùng được ngay hôm nay.</p>
            <ul className="mk-tick">
              {included.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="mk-card">
            <p className="eyebrow">Đang lên kế hoạch</p>
            <p className="mk-price__big" style={{ fontSize: "clamp(26px, 4vw, 34px)" }}>
              Chưa có giá
            </p>
            <p>Những điều chúng mình muốn làm tiếp. Chưa phải cam kết về thời điểm hay giá.</p>
            <ul className="mk-tick mk-tick--soon">
              {planned.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mk-section mk-narrow" aria-labelledby="faq">
        <h2 id="faq">Câu hỏi về chi phí</h2>
        <FaqList items={faq} schema />
      </section>

      <CtaBand
        title={
          <>
            Bắt đầu <em>không mất gì.</em>
          </>
        }
        label="Bắt đầu miễn phí"
      />
    </MarketingLayout>
  );
}
