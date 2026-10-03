import type { Metadata } from "next";
import Link from "next/link";
import { DesignRequestForm } from "@/components/marketing/DesignRequestForm";
import { FaqList } from "@/components/marketing/FaqList";
import { MarketingLayout, PageHero } from "@/components/marketing/MarketingLayout";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { CONTACT_ZALO } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import "./custom.css";

export const metadata: Metadata = pageMetadata("/thiet-ke-thiep-rieng");

const offers = [
  { title: "Thiết kế độc bản", text: "Bố cục, màu sắc, họa tiết và font chữ dựng riêng theo ý tưởng và ảnh của hai bạn, không trùng với mẫu có sẵn." },
  { title: "Đầy đủ tính năng của MỘC", text: "Phong bì mở thiệp, bản đồ, đếm ngược, xác nhận tham dự, lời chúc, mừng cưới QR và link riêng cho từng khách." },
  { title: "Chỉnh sửa cùng bạn", text: "Bạn xem phác thảo, góp ý và chỉnh đến khi ưng ý trước khi bàn giao link thiệp." },
];

const steps = [
  "Gửi yêu cầu: kể cho Mộc ý tưởng, ngày cưới và vài thiệp bạn thích.",
  "Mộc liên hệ tư vấn và báo giá theo mức độ tuỳ chỉnh bạn cần.",
  "Bạn duyệt phác thảo, góp ý chỉnh sửa.",
  "Bàn giao link thiệp, bạn tiếp tục tự chỉnh nội dung trong Studio.",
];

const faqs = [
  { q: "Thiết kế riêng có mất phí không?", a: "Có. Các mẫu có sẵn trên MỘC vẫn miễn phí. Thiết kế riêng được báo giá theo mức độ tuỳ chỉnh, bạn chỉ trả khi đã đồng ý với báo giá." },
  { q: "Mất bao lâu để nhận thiệp?", a: "Phụ thuộc độ phức tạp và số lần chỉnh sửa. Mộc sẽ báo thời gian dự kiến khi tư vấn, hãy gửi yêu cầu sớm nếu ngày cưới đã gần." },
  { q: "Sau khi nhận thiệp tôi có tự sửa được không?", a: "Được. Nội dung như tên, ngày giờ, địa điểm, ảnh và nhạc vẫn chỉnh được trong Studio như mọi thiệp khác." },
  { q: "Tôi chưa có ý tưởng rõ ràng thì sao?", a: "Không sao. Bạn chỉ cần gửi vài thiệp hoặc ảnh bạn thích, Mộc sẽ tư vấn phong cách phù hợp." },
];

export default function CustomDesignPage() {
  return (
    <MarketingLayout path="/thiet-ke-thiep-rieng" name="Thiết kế thiệp riêng">
      <ScrollReveal />
      <PageHero
        crumbs={[{ label: "Thiết kế thiệp riêng" }]}
        eyebrow="THIẾT KẾ THEO YÊU CẦU"
        title="Một tấm thiệp độc bản, chỉ dành cho hai bạn"
        lede="Chưa tìm được mẫu ưng ý? Kể cho Mộc ý tưởng của bạn, Mộc sẽ thiết kế riêng một tấm thiệp cưới online theo đúng phong cách của hai bạn."
      >
        <div className="actions">
          <a className="button-primary" href="#yeu-cau">
            Gửi yêu cầu
          </a>
          <Link className="button-ghost" href="/templates">
            Xem mẫu có sẵn
          </Link>
        </div>
      </PageHero>

      <section className="mk-section" data-reveal="1">
        <h2>Bạn nhận được gì</h2>
        <ul className="mk-grid">
          {offers.map((o) => (
            <li key={o.title}>
              <div className="mk-card">
                <h3>{o.title}</h3>
                <p>{o.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mk-section mk-narrow" data-reveal="1">
        <h2>Quy trình</h2>
        <ol className="mk-steps">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      <section className="mk-section mk-narrow" id="yeu-cau" data-reveal="1">
        <h2>Gửi yêu cầu thiết kế</h2>
        <p className="lede">Mộc sẽ liên hệ báo giá sau khi nhận được thông tin của bạn.</p>
        <DesignRequestForm />
        {CONTACT_ZALO && (
          <p className="custom-zalo">
            Muốn nhắn trực tiếp?{" "}
            <a href={`https://zalo.me/${CONTACT_ZALO}`} target="_blank" rel="noopener noreferrer">
              Chat Zalo với Mộc
            </a>
          </p>
        )}
      </section>

      <section className="mk-section mk-narrow" data-reveal="1">
        <h2>Câu hỏi thường gặp</h2>
        <FaqList items={faqs} schema />
      </section>
    </MarketingLayout>
  );
}
