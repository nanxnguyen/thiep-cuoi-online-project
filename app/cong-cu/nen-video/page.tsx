import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { VideoCompressTool } from "@/components/tools/VideoCompressTool";

export const metadata: Metadata = {
  title: "Nén video miễn phí, ngay trên trình duyệt",
  description: "Nén video cưới ngay trên trình duyệt để dễ gửi qua Zalo hoặc email — video xử lý trên máy bạn, không tải lên máy chủ nào.",
  alternates: { canonical: "/cong-cu/nen-video" },
};

export default function Page() {
  return (
    <ToolPage name="Nén video" title="Nén video cưới" description="Thu nhỏ video phóng sự cưới trước khi đưa vào thiệp. Video được xử lý ngay trên máy bạn, không tải lên máy chủ nào; video dài có thể mất vài phút." width={900}>
      <VideoCompressTool />
    </ToolPage>
  );
}
