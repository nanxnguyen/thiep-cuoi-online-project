import type { Metadata } from "next";
import Link from "next/link";
import { LpRuledSteps, SeoLandingPage } from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = { title: "QR tiền mừng cưới và bản đồ", description: "Thêm QR tiền mừng, địa điểm và bản đồ vào thiệp cưới online.", alternates: { canonical: "/qr-tien-mung" } };

// design/QR Tien Mung.dc.html. Step 02 says what the product really does (it builds the VietQR from the account number).
export default function Page() {
  return (
    <SeoLandingPage
      hero={
        <section className="lp-qr-hero">
          <div className="lp-qr-hero__copy">
            <span>QR TIỀN MỪNG CƯỚI</span>
            <h1>
              Khách ở xa vẫn <em>gửi mừng được</em>
            </h1>
            <p>Đặt mã QR chuyển khoản ngay trong thiệp cưới online. Khách chỉ cần mở thiệp, quét mã và chuyển khoản trong vài giây.</p>
            <Link href="/studio">Tạo thiệp có QR mừng cưới</Link>
          </div>
          <div className="lp-qr" aria-hidden="true">
            <div className="lp-qr__code">
              <div className="lp-qr__scan" />
              <div className="lp-qr__label">Mã QR ngân hàng</div>
            </div>
            <div className="lp-qr__meta">
              <span>Hạ Vy &amp; Minh Khôi</span>
              <span>Quét để gửi lời chúc mừng</span>
            </div>
          </div>
        </section>
      }
    >
      <LpRuledSteps
        title="Ba bước đặt QR mừng cưới"
        steps={[
          { n: "01", t: "Vào tab Mừng cưới trong trình chỉnh sửa" },
          { n: "02", t: "Chọn ngân hàng và nhập số tài khoản, Mộc tự tạo mã QR" },
          { n: "03", t: "Lưu lại, mã QR hiện ngay trên thiệp của khách" },
        ]}
      />
    </SeoLandingPage>
  );
}
