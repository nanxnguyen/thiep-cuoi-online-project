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
    <ToolPage name="Tin nhắn mời" title="Sinh tin nhắn mời cưới" width={820}>
      <InviteMessageTool />
    </ToolPage>
  );
}
