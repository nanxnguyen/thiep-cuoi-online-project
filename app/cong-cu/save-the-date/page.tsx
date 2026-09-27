import type { Metadata } from "next";
import Link from "next/link";
import { ToolPage } from "@/components/tools/ToolPage";
import { SaveTheDateTool } from "@/components/tools/SaveTheDateTool";

export const metadata: Metadata = {
  title: "Tạo ảnh Save The Date miễn phí",
  description: "Tạo ảnh báo ngày cưới (save-the-date) ngay trên trình duyệt: tên, ngày cưới, ảnh nền tuỳ chọn. Tải về để đăng Zalo, Facebook hoặc Instagram.",
  alternates: { canonical: "/cong-cu/save-the-date" },
};

export default function Page() {
  return (
    <ToolPage name="Save the date" title="Ảnh báo ngày cưới" width={1000}
      guide={<><h2>Ảnh save the date là gì, dùng khi nào</h2><p>Ảnh save the date là tấm ảnh báo trước ngày cưới, gửi cho khách từ sớm để họ giữ lịch — thường đăng Zalo, Facebook, Instagram kèm một dòng ngắn. Nhập tên hai bạn, ngày cưới, địa điểm, chọn ảnh nền rồi tải file PNG về là xong, không cần biết thiết kế.</p><p>Tới ngày gần cưới, <Link href="/templates">chọn mẫu thiệp cưới online</Link> đầy đủ thông tin để gửi lời mời chính thức.</p></>}
    >
      <SaveTheDateTool />
    </ToolPage>
  );
}
