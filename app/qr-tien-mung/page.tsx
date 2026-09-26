import type { Metadata } from "next";
import { QrCode } from "lucide-react";
import { LpSteps, SeoLandingPage } from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = { title: "QR tiền mừng cưới và bản đồ", description: "Thêm QR tiền mừng, địa điểm và bản đồ vào thiệp cưới online.", alternates: { canonical: "/qr-tien-mung" } };

// Layout and copy follow the design source; the long-form sections and related links below the design are kept for SEO.
const SECTIONS = [{ title: "Chỉ đường đến từng sự kiện", paragraphs: ["Trong Studio, nhập địa chỉ và liên kết bản đồ cho địa điểm tương ứng. Khách có thể chạm để mở Google Maps; bản đồ nhúng chỉ tải khi khách chủ động mở.", "Hãy kiểm tra tên địa điểm, địa chỉ và liên kết bản đồ trước khi xuất bản để khách nhận đúng thông tin."] }, { title: "QR mừng cưới trên thiệp", paragraphs: ["Bạn có thể điền thông tin tài khoản cho cô dâu và chú rể để tạo mã VietQR. Khách quét mã bằng ứng dụng ngân hàng hỗ trợ và tự xác nhận nội dung chuyển khoản trước khi gửi.", "Mã QR chỉ hỗ trợ thao tác chuyển khoản; MỘC không nhận hoặc xử lý khoản tiền mừng."] }];
const RELATED = [{ href: "/tinh-nang/mung-cuoi-qr", label: "Tính năng mừng cưới QR", description: "Cách thêm mã QR và lưu ý khi sử dụng." }];

export default function Page() {
  return (
    <SeoLandingPage
      eyebrow="QR tiền mừng cưới"
      title={<>Khách ở xa vẫn <em>gửi mừng được</em></>}
      description="Đặt mã QR chuyển khoản ngay trong thiệp cưới online. Khách chỉ cần mở thiệp, quét mã và chuyển khoản trong vài giây."
      cta={{ href: "/studio", label: "Tạo thiệp có QR mừng cưới" }}
      art={
        <div className="lp-qr" aria-hidden="true">
          <div className="lp-qr__code"><QrCode strokeWidth={1.2} /><i className="lp-qr__scan" /></div>
          <strong>Hạ Vy &amp; Minh Khôi</strong>
          <small>Quét để gửi lời chúc mừng</small>
        </div>
      }
      sections={SECTIONS}
      related={RELATED}
    >
      <LpSteps ruled title="Ba bước đặt QR mừng cưới" steps={[
        { n: "01", t: "Vào phần Mừng cưới trong trình chỉnh sửa" },
        { n: "02", t: "Chọn ngân hàng và nhập số tài khoản, MỘC tự tạo mã VietQR" },
        { n: "03", t: "Lưu lại, mã QR hiện ngay trên thiệp của khách" },
      ]} />
    </SeoLandingPage>
  );
}
