import type { Metadata } from "next";
import Link from "next/link";
import { ToolPage } from "@/components/tools/ToolPage";
import { QrTool } from "@/components/tools/QrTool";

export const metadata: Metadata = {
  title: "Tạo mã QR cho link thiệp cưới",
  description: "Dán link thiệp cưới online, lấy ngay mã QR để in lên thiệp giấy, standee hoặc banner ngày cưới. Miễn phí, không cần đăng nhập.",
  alternates: { canonical: "/cong-cu/tao-qr" },
};

export default function Page() {
  return (
    <ToolPage name="Tạo mã QR" title="Tạo mã QR từ link thiệp" description="Dán link thiệp hoặc bất kỳ đường link nào, nhận mã QR để in lên thiệp giấy hoặc bảng chào." width={760} gap={32}
      guide={<><h2>Cách dùng mã QR thiệp cưới</h2><p>Mã QR giúp khách mở thiệp cưới online chỉ bằng một lần quét: in lên thiệp giấy, standee cổng rạp hoặc bảng chào. Nên in kích thước tối thiểu 3×3 cm để điện thoại cũ quét được, và luôn quét thử một lần trước khi in hàng loạt.</p><p>Chưa có thiệp online? <Link href="/templates">Chọn một mẫu thiệp</Link> rồi <Link href="/studio">tạo thiệp miễn phí</Link>, sau đó dán link vào công cụ này để lấy mã QR.</p></>}
    >
      <QrTool />
    </ToolPage>
  );
}
