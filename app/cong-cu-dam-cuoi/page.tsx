import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = {
  title: "Công cụ đám cưới miễn phí",
  description: "Các công cụ miễn phí cho đám cưới: tạo mã QR, nén ảnh, soạn tin nhắn mời, lập danh sách khách — chạy ngay trên trình duyệt, không cần đăng nhập.",
  alternates: { canonical: "/cong-cu-dam-cuoi" },
};

export default function Page() {
  return (
    <SeoLandingPage
      eyebrow="Công cụ miễn phí"
      title={
        <>
          Vài công cụ nhỏ
          <br />
          <em>cho ngày trọng đại.</em>
        </>
      }
      description="Không cần tài khoản, không cần thiệp — mỗi công cụ chạy ngay trên trình duyệt của bạn và có thể dùng độc lập với Studio."
      points={[
        "Chạy hoàn toàn trên trình duyệt: ảnh và dữ liệu bạn nhập không rời khỏi máy cho tới khi bạn bấm tải xuống.",
        "Dùng thử trước khi tạo thiệp, hoặc dùng song song khi đã có thiệp.",
        "Miễn phí, không giới hạn số lần dùng trong giai đoạn phát triển hiện tại.",
      ]}
      sections={[
        {
          title: "Công cụ đã có",
          paragraphs: [
            "Tạo mã QR: dán link thiệp, lấy mã QR để in lên thiệp giấy, standee hay banner ngày cưới.",
            "Nén ảnh cưới: thu nhỏ nhiều ảnh cùng lúc còn tối đa 1600px và 2MB, ngay trên trình duyệt.",
            "Tạo tin nhắn mời: điền tên, ngày cưới và link thiệp, nhận 2 phương án tin nhắn (gần gũi/trang trọng) để sao chép và gửi.",
            "Lập danh sách khách: ghi lại từng hộ/nhóm khách, lưu trên trình duyệt, xuất CSV để mở lại ở Studio khi đã có thiệp.",
            "Sơ đồ chỗ ngồi: xếp khách vào từng bàn bằng kéo-thả hoặc chạm để chọn, dùng chung danh sách với công cụ Danh sách khách.",
            "Save the date: tạo ảnh báo ngày cưới có tên, ngày và ảnh nền tuỳ chọn, tải về đăng mạng xã hội.",
            "Nén video: nén video cưới ngay trên trình duyệt để dễ gửi qua Zalo hoặc email, video không tải lên máy chủ nào.",
          ],
        },
      ]}
      related={[
        { href: "/cong-cu/tao-qr", label: "Tạo mã QR", description: "Mã QR cho link thiệp, in được ngay." },
        { href: "/cong-cu/nen-anh", label: "Nén ảnh", description: "Thu nhỏ ảnh cưới trên trình duyệt." },
        { href: "/cong-cu/tin-nhan-moi", label: "Tin nhắn mời", description: "2 phương án tin nhắn để sao chép." },
        { href: "/cong-cu/danh-sach-khach", label: "Danh sách khách", description: "Ghi lại khách mời, xuất CSV." },
        { href: "/cong-cu/so-do-cho-ngoi", label: "Sơ đồ chỗ ngồi", description: "Xếp bàn bằng kéo-thả." },
        { href: "/cong-cu/save-the-date", label: "Save the date", description: "Tạo ảnh báo ngày cưới." },
        { href: "/cong-cu/nen-video", label: "Nén video", description: "Nén video ngay trên trình duyệt." },
        { href: "/tinh-nang", label: "Các tính năng của thiệp", description: "Xem nội dung thực tế đang dùng được trên thiệp." },
        { href: "/studio", label: "Mở Studio", description: "Bắt đầu tạo thiệp và xem các tuỳ chọn." },
      ]}
    />
  );
}
