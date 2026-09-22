import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { SaveTheDateTool } from "@/components/tools/SaveTheDateTool";

export const metadata: Metadata = {
  title: "Tạo ảnh Save The Date miễn phí",
  description: "Tạo ảnh báo ngày cưới (save-the-date) ngay trên trình duyệt: tên, ngày cưới, ảnh nền tuỳ chọn. Tải về để đăng Zalo, Facebook hoặc Instagram.",
  alternates: { canonical: "/cong-cu/save-the-date" },
};

export default function Page() {
  return (
    <ToolPage
      eyebrow="Công cụ miễn phí"
      title={
        <>
          Tạo ảnh
          <br />
          <em>Save the date.</em>
        </>
      }
      description="Điền tên và ngày cưới, chọn ảnh nền nếu muốn, tải ảnh về để đăng lên mạng xã hội báo tin vui trước khi gửi thiệp."
      related={[
        { href: "/cong-cu/nen-anh", label: "Nén ảnh", description: "Chuẩn bị ảnh nền đẹp và nhẹ." },
        { href: "/studio", label: "Mở Studio", description: "Tạo thiệp đầy đủ để gửi khách." },
      ]}
    >
      <SaveTheDateTool />
    </ToolPage>
  );
}
