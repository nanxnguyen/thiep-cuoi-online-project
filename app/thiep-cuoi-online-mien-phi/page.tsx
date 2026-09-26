import type { Metadata } from "next";
import { LpChecklist, SeoLandingPage } from "@/components/seo/SeoLandingPage";
import { templates } from "@/lib/templates";

export const metadata: Metadata = { title: "Thiệp cưới online miễn phí", description: "Tạo thiệp cưới online miễn phí với mẫu đẹp, RSVP, bản đồ, QR tiền mừng và nhạc nền trên MỘC Wedding.", alternates: { canonical: "/thiep-cuoi-online-mien-phi" } };

// Layout and copy follow the design source; the long-form sections and related links below the design are kept for SEO.
const SECTIONS = [{ title: "MỘC hiện miễn phí trong giai đoạn phát triển", paragraphs: ["Bạn có thể tạo và xuất bản thiệp mà không cần nhập thông tin thanh toán. Các gói trả phí chưa được công bố; hãy xem trang bảng giá để biết thông tin hiện tại.", "MỘC không yêu cầu khách mời tạo tài khoản để mở thiệp hoặc gửi phản hồi. Chủ thiệp dùng đường dẫn chỉnh sửa riêng để quay lại Studio."] }, { title: "Bắt đầu từ những phần thiết thực", paragraphs: ["Một lời mời có thể tập trung vào thông tin ngày cưới, địa điểm và cách phản hồi. Khi cần, bạn có thể thêm album ảnh, lịch trình, bản đồ, nhạc, sổ lưu bút hoặc QR mừng cưới.", "Các giới hạn hiện tại được mô tả trên từng trang tính năng và trong trợ giúp để bạn dễ kiểm tra trước khi chuẩn bị nội dung."] }];
const RELATED = [{ href: "/bang-gia", label: "Bảng giá", description: "Thông tin giai đoạn miễn phí hiện tại của MỘC." }, { href: "/tro-giup", label: "Trợ giúp", description: "Giải đáp về tạo, sửa và chia sẻ thiệp." }, { href: "/templates", label: "Mẫu thiệp", description: "Chọn phong cách phù hợp với hai bạn." }];

export default function Page() {
  return (
    <SeoLandingPage
      eyebrow="Thiệp cưới online miễn phí"
      title={<>Không mất một đồng nào, <em>không giới hạn</em> tính năng</>}
      description="Trong khi nhiều nền tảng khác thu phí theo lượt xem hay tính năng, Mộc để mọi thứ miễn phí ngay từ đầu."
      cta={{ href: "/studio", label: "Bắt đầu miễn phí" }}
      sections={SECTIONS}
      related={RELATED}
    >
      <LpChecklist items={[
        `${templates.length} mẫu thiệp, mọi phong cách`,
        "Đổi mẫu không mất nội dung",
        "Xác nhận tham dự không giới hạn khách",
        "Sổ lưu bút và mừng cưới QR",
        "Bản đồ, đếm ngược, album, nhạc nền",
        "Link riêng cho từng khách, không tính phí thêm",
        "Tài khoản lưu nhiều thiệp",
        "7 công cụ đám cưới chạy trên trình duyệt",
      ]} />
    </SeoLandingPage>
  );
}
