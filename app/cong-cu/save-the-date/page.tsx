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
    <ToolPage name="Save the date" title="Ảnh báo ngày cưới" width={1000}>
      <SaveTheDateTool />
    </ToolPage>
  );
}
