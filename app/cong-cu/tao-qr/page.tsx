import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { QrTool } from "@/components/tools/QrTool";

export const metadata: Metadata = {
  title: "Tạo mã QR cho link thiệp cưới",
  description: "Dán link thiệp cưới online, lấy ngay mã QR để in lên thiệp giấy, standee hoặc banner ngày cưới. Miễn phí, không cần đăng nhập.",
  alternates: { canonical: "/cong-cu/tao-qr" },
};

export default function Page() {
  return (
    <ToolPage name="Tạo mã QR" title="Tạo mã QR từ link thiệp" description="Dán link thiệp hoặc bất kỳ đường link nào, nhận mã QR để in lên thiệp giấy hoặc bảng chào." width={760} gap={32}>
      <QrTool />
    </ToolPage>
  );
}
