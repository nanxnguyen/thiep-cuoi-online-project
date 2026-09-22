import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { InviteMessageTool } from "@/components/tools/InviteMessageTool";

export const metadata: Metadata = {
  title: "Tạo tin nhắn mời cưới, gửi qua Zalo hoặc SMS",
  description: "Điền tên cô dâu chú rể, ngày cưới và link thiệp, nhận ngay 2 gợi ý tin nhắn mời — gần gũi và trang trọng — để sao chép và gửi.",
  alternates: { canonical: "/cong-cu/tin-nhan-moi" },
};

export default function Page() {
  return (
    <ToolPage
      eyebrow="Công cụ miễn phí"
      title={
        <>
          Soạn sẵn
          <br />
          <em>tin nhắn mời cưới.</em>
        </>
      }
      description="Điền vài thông tin, nhận ngay 2 phương án tin nhắn để sao chép và gửi qua Zalo, Messenger hoặc SMS."
      related={[
        { href: "/tin-nhan-moi-cuoi", label: "Cách viết lời mời cưới", description: "Gợi ý nội dung và cách chọn giọng điệu." },
        { href: "/cong-cu/tao-qr", label: "Tạo mã QR", description: "Mã QR cho link thiệp, in lên thiệp giấy." },
      ]}
    >
      <InviteMessageTool />
    </ToolPage>
  );
}
