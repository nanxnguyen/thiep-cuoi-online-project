import type { Metadata } from "next";
import { LpQuotes, SeoLandingPage } from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = { title: "Tin nhắn mời cưới hay và ý nghĩa", description: "Gợi ý tin nhắn mời cưới ngắn gọn, tự nhiên và dễ gửi qua Zalo, Messenger hoặc SMS.", alternates: { canonical: "/tin-nhan-moi-cuoi" } };

// Layout and copy follow the design source; the long-form sections and related links below the design are kept for SEO.
const SECTIONS = [{ title: "Một lời nhắn ngắn có thể gồm gì?", paragraphs: ["Bắt đầu bằng lời chào quen thuộc, cho biết ai đang mời và ngày tổ chức. Sau đó gửi đường link thiệp để người nhận tự xem chi tiết về địa điểm và lịch trình.", "Nếu cần khách xác nhận tham dự, hãy nói rõ họ có thể phản hồi ngay trên thiệp và cho biết thời hạn mà gia đình mong muốn. Thời hạn này là lời nhắc hiển thị; hệ thống không tự khoá RSVP khi đến ngày đó."] }, { title: "Viết theo cách hai bạn thường nói", paragraphs: ["Một tin nhắn cho người thân có thể gần gũi; tin nhắn cho đồng nghiệp có thể ngắn gọn và trang trọng hơn. Đọc lại tên người nhận, ngày giờ và đường link trước khi gửi.", "Chưa biết bắt đầu từ đâu? Công cụ tạo tin nhắn mời của MỘC điền sẵn tên, ngày và link thiệp, gợi ý 2 phương án (gần gũi/trang trọng) để bạn sao chép và gửi ngay."] }];
const RELATED = [{ href: "/cong-cu/tin-nhan-moi", label: "Công cụ tạo tin nhắn mời", description: "Điền vài thông tin, nhận ngay 2 phương án để sao chép." }, { href: "/tinh-nang/xac-nhan-tham-du", label: "Xác nhận tham dự", description: "Tìm hiểu cách khách phản hồi ngay trên thiệp." }];

export default function Page() {
  return (
    <SeoLandingPage
      eyebrow="Tin nhắn mời cưới"
      title={<>Kèm link thiệp vào một dòng <em>tin nhắn thật hay</em></>}
      description="Vài mẫu câu để gửi kèm link thiệp qua Zalo, Messenger hoặc SMS."
      cta={{ href: "/cong-cu/tin-nhan-moi", label: "Dùng công cụ sinh tin nhắn →" }}
      sections={SECTIONS}
      related={RELATED}
    >
      <LpQuotes items={[
        { tag: "Trang trọng", text: "Kính mời anh/chị đến chung vui trong ngày trọng đại của chúng tôi. Mọi thông tin chi tiết, chúng tôi đã gửi trong thiệp mời: [link thiệp]." },
        { tag: "Thân mật", text: "Ê, tụi mình cưới rồi nè! Ghé xem thiệp mời đi, nhớ xác nhận tham dự giúp bọn mình nha: [link thiệp] 🥂" },
        { tag: "Gửi họ hàng", text: "Con/cháu xin kính báo ngày vui của con/cháu. Kính mong ông bà, chú bác đến chung vui, thông tin chi tiết trong link sau: [link thiệp]." },
        { tag: "Nhắc lại", text: "Chỉ còn vài ngày nữa là đến ngày cưới của tụi mình rồi! Mong mọi người xác nhận tham dự nếu chưa xác nhận nhé: [link thiệp]" },
      ]} />
    </SeoLandingPage>
  );
}
