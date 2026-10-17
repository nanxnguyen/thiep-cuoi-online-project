import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { organization } from "@/lib/jsonld";
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE, SITE_URL, SOCIAL_URLS } from "@/lib/site";
import { templates } from "@/lib/templates";
import { JsonLd } from "@/components/marketing/JsonLd";
import { CtaBand, MarketingLayout, PageHero } from "@/components/marketing/MarketingLayout";

export const metadata: Metadata = pageMetadata("/ve-moc");

// No design/ mockup (logged in DESIGN.md): shared marketing primitives only. Copy states what the product does today;
// no founding date, team names or numbers that the owner has not supplied. Contact block hides until a channel is set.
export default function AboutPage() {
  const hasContact = CONTACT_EMAIL || CONTACT_PHONE || CONTACT_ADDRESS || SOCIAL_URLS.length > 0;
  return (
    <MarketingLayout path="/ve-moc" name="Về MỘC">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          ...organization(SITE_URL, { email: CONTACT_EMAIL, phone: CONTACT_PHONE, address: CONTACT_ADDRESS, sameAs: SOCIAL_URLS }),
        }}
      />
      <PageHero
        crumbs={[{ label: "Về MỘC" }]}
        eyebrow="VỀ MỘC"
        title={<>Thiệp cưới online, làm cho các cặp đôi Việt Nam.</>}
        lede="MỘC giúp hai bạn làm một tấm thiệp cưới online đẹp, gửi link cho khách qua Zalo, rồi nhận xác nhận tham dự, lời chúc và tiền mừng ngay trên thiệp."
      />
      <article className="mk-prose">
        <h2>MỘC làm gì</h2>
        <p>
          Hai bạn chọn một trong {templates.length} <Link href="/templates">mẫu thiệp</Link>, điền tên, ngày cưới, địa điểm, thêm ảnh, nhạc và câu
          chuyện của mình. Bản xem trước thay đổi ngay khi gõ, nên hai bạn thấy đúng tấm thiệp khách sẽ nhận. Xong thì xuất bản thành một đường link
          để gửi qua Zalo, Messenger hoặc in thành mã QR lên thiệp giấy.
        </p>
        <p>
          Khách mở link trên điện thoại, không cần tải app hay đăng ký. Trên thiệp có bản đồ đường tới tiệc, đếm ngược, nút thêm vào lịch, ô xác nhận
          tham dự, sổ lưu bút và <Link href="/qr-tien-mung">mã QR mừng cưới</Link> theo số tài khoản hai bạn nhập. Mỗi khách có thể nhận một link
          riêng mang tên mình, và thiệp đọc được bằng tiếng Việt lẫn tiếng Anh.
        </p>
        <h2>Cách MỘC giữ thiệp của hai bạn</h2>
        <p>
          Tạo thiệp không cần tài khoản: quyền sửa nằm ở link chỉnh sửa riêng mà chỉ hai bạn giữ. Nếu muốn mở lại thiệp trên máy khác, hai bạn có
          thể đăng nhập bằng Google và nhận thiệp vào tài khoản. Trang thiệp được đặt để công cụ tìm kiếm không lập chỉ mục, chỉ người có link mới mở được. Chi tiết
          MỘC lưu dữ liệu gì và ai xem được nằm ở trang <Link href="/quyen-rieng-tu">Quyền riêng tư</Link>.
        </p>
        <h2>Ngoài thiệp</h2>
        <p>
          MỘC có thêm <Link href="/cong-cu-dam-cuoi">công cụ đám cưới</Link> chạy ngay trên trình duyệt (tạo mã QR, nén ảnh và video, soạn tin
          nhắn mời, lập danh sách khách, ảnh save the date) và <Link href="/blog">blog cưới</Link> với hướng dẫn chuẩn bị đám cưới. Câu hỏi
          thường gặp được gom ở trang <Link href="/tro-giup">Trợ giúp</Link>; chi phí ở trang <Link href="/bang-gia">Bảng giá</Link>. Nếu
          thấy MỘC có ích, hai bạn có thể <Link href="/ung-ho">ủng hộ dự án</Link>.
        </p>
        {hasContact && (
          <>
            <h2>Liên hệ</h2>
            <ul>
              {CONTACT_EMAIL && (
                <li>
                  Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </li>
              )}
              {CONTACT_PHONE && (
                <li>
                  Điện thoại: <a href={`tel:${CONTACT_PHONE}`}>{CONTACT_PHONE}</a>
                </li>
              )}
              {CONTACT_ADDRESS && <li>Địa chỉ: {CONTACT_ADDRESS}</li>}
              {SOCIAL_URLS.map((url) => (
                <li key={url}>
                  <a href={url} rel="me noopener" target="_blank">
                    {url.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </article>
      <CtaBand title={<>Làm thiệp cưới online của hai bạn, <em>miễn phí.</em></>} />
    </MarketingLayout>
  );
}
