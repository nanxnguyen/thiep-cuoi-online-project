import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { LpQuotes, SeoLandingPage } from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = { title: "Tin nhắn mời cưới hay và ý nghĩa", description: "Gợi ý tin nhắn mời cưới ngắn gọn, tự nhiên và dễ gửi qua Zalo, Messenger hoặc SMS.", alternates: { canonical: "/tin-nhan-moi-cuoi" } };

// design/Tin Nhan Moi Cuoi.dc.html
export default function Page() {
  return (
    <SeoLandingPage
      eyebrow="TIN NHẮN MỜI CƯỚI"
      title={<>Kèm link thiệp vào một dòng <em>tin nhắn thật hay</em></>}
      description="Vài mẫu câu để gửi kèm link thiệp qua Zalo, Messenger hoặc SMS."
      cta={{ href: "/cong-cu/tin-nhan-moi", label: "Dùng công cụ sinh tin nhắn →" }}
      small
      heroStyle={{ padding: "88px 32px 56px", "--lp-h1": "clamp(36px, 5.2vw, 58px)", "--lp-lh": "1.1", "--lp-lede": "520px" } as CSSProperties}
    >
      <LpQuotes
        items={[
          { tag: "TRANG TRỌNG", text: "Kính mời anh/chị đến chung vui trong ngày trọng đại của chúng tôi. Mọi thông tin chi tiết, chúng tôi đã gửi trong thiệp mời: [link thiệp]." },
          { tag: "THÂN MẬT", text: "Ê, tụi mình cưới rồi nè! Ghé xem thiệp mời đi, nhớ xác nhận tham dự giúp bọn mình nha: [link thiệp] 🥂" },
          { tag: "GỬI HỌ HÀNG", text: "Con/cháu xin kính báo ngày vui của con/cháu. Kính mong ông bà, chú bác đến chung vui, thông tin chi tiết trong link sau: [link thiệp]." },
          { tag: "NHẮC LẠI", text: "Chỉ còn vài ngày nữa là đến ngày cưới của tụi mình rồi! Mong mọi người xác nhận tham dự nếu chưa xác nhận nhé: [link thiệp]" },
        ]}
      />
    </SeoLandingPage>
  );
}
