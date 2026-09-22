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
    <ToolPage
      eyebrow="Công cụ miễn phí"
      title={
        <>
          Tạo mã QR
          <br />
          <em>cho đường link thiệp.</em>
        </>
      }
      description="Dán đường link thiệp (hoặc bất kỳ link nào) để lấy mã QR in lên thiệp giấy, standee hay banner ngày cưới."
      related={[
        { href: "/studio", label: "Mở Studio", description: "Tạo thiệp và lấy link chia sẻ." },
        { href: "/cong-cu/tin-nhan-moi", label: "Tin nhắn mời", description: "Soạn sẵn lời nhắn kèm link thiệp." },
      ]}
    >
      <QrTool />
    </ToolPage>
  );
}
