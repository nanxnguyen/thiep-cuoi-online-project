import type { Metadata } from "next";
import { LpSteps, LpWhy, SeoLandingPage } from "@/components/seo/SeoLandingPage";
import { templates } from "@/lib/templates";

export const metadata: Metadata = { title: "Tạo thiệp cưới online", description: "Hướng dẫn tạo thiệp cưới online nhanh chóng với ảnh, nhạc và preview realtime.", alternates: { canonical: "/tao-thiep-cuoi" } };

// Layout and copy follow the design source; the long-form sections and related links below the design are kept for SEO.
const SECTIONS = [{ title: "Từ mẫu thiệp đến lời mời của riêng bạn", paragraphs: ["Mở Studio, chọn mẫu phù hợp rồi thêm thông tin về hai bạn và ngày cưới. Bản xem trước cập nhật khi chỉnh sửa để bạn tiện rà lại cách nội dung xuất hiện trên thiệp.", "Khi đã sẵn sàng, xuất bản để tạo đường dẫn chia sẻ. Bạn có thể mở lại Studio bằng đường dẫn chỉnh sửa riêng; hãy lưu đường dẫn đó ở nơi an toàn."] }, { title: "Những gì có thể thêm vào thiệp", paragraphs: ["Tuỳ mẫu và nội dung bạn chọn, thiệp có thể có lịch trình, địa điểm kèm Google Maps, album ảnh, nhạc nền, xác nhận tham dự, lời chúc và QR mừng cưới.", "Bộ sưu tập mẫu và trang tính năng giúp bạn xem trước các lựa chọn trước khi bắt đầu."] }];
const RELATED = [{ href: "/templates", label: "Bộ sưu tập mẫu", description: "Xem các mẫu thiệp theo nhiều phong cách." }, { href: "/tinh-nang", label: "Tính năng của thiệp", description: "Tìm hiểu những phần có thể thêm vào lời mời." }];

export default function Page() {
  return (
    <SeoLandingPage
      eyebrow="Tạo thiệp cưới online"
      title={<>Tạo thiệp cưới trong 15 phút, <em>miễn phí hoàn toàn</em></>}
      description="Chọn mẫu, điền tên và ngày cưới, gửi link cho khách. Không cần thiết kế, không cần đăng nhập để bắt đầu."
      cta={{ href: "/studio", label: "Tạo thiệp cưới ngay" }}
      sections={SECTIONS}
      related={RELATED}
    >
      <LpSteps steps={[
        { n: "1", t: "Chọn mẫu", d: `${templates.length} mẫu, 6 phong cách khác nhau` },
        { n: "2", t: "Điền nội dung", d: "Tên, ngày, địa điểm, ảnh và nhạc" },
        { n: "3", t: "Gửi link", d: "Chia sẻ qua Zalo, Messenger hay SMS" },
      ]} />
      <LpWhy title="Vì sao chọn Mộc" items={[
        { t: "Không mất tiền", d: "Mọi mẫu và tính năng đều miễn phí, không giới hạn khách." },
        { t: "Tự lưu", d: "Không lo mất dữ liệu, Mộc lưu lại mỗi khi bạn gõ." },
        { t: "Đổi mẫu tự do", d: "Đổi mẫu bất cứ lúc nào, nội dung vẫn còn nguyên." },
        { t: "Link riêng từng khách", d: "Mỗi khách một link mang tên họ." },
      ]} />
    </SeoLandingPage>
  );
}
