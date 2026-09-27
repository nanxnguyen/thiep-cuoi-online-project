import type { Metadata } from "next";
import Link from "next/link";
import { ToolPage } from "@/components/tools/ToolPage";
import { InviteMessageTool } from "@/components/tools/InviteMessageTool";

export const metadata: Metadata = {
  title: "Tạo tin nhắn mời cưới, gửi qua Zalo hoặc SMS",
  description: "Điền tên cô dâu chú rể, ngày cưới và link thiệp, nhận ngay 2 gợi ý tin nhắn mời — gần gũi và trang trọng — để sao chép và gửi.",
  alternates: { canonical: "/cong-cu/tin-nhan-moi" },
};

export default function Page() {
  return (
    <ToolPage name="Tin nhắn mời" title="Sinh tin nhắn mời cưới" width={820}
      guide={<><h2>Viết tin nhắn mời cưới gửi Zalo, SMS</h2><p>Tin nhắn mời nên ngắn gọn: xưng hô, tên cô dâu chú rể, giờ giấc, địa điểm và link thiệp. Điền thông tin một lần, công cụ gợi ý hai giọng điệu — gần gũi cho bạn bè, trang trọng cho người lớn — để bạn sao chép và gửi ngay. Nhớ thay tên người nhận ở đầu tin nhắn cho mỗi khách.</p><p>Muốn khách bấm vào là thấy thiệp đẹp? <Link href="/templates">Chọn mẫu thiệp cưới</Link> rồi <Link href="/studio">tạo thiệp online miễn phí</Link>.</p></>}
    >
      <InviteMessageTool />
    </ToolPage>
  );
}
