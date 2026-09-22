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
    <ToolPage
      eyebrow="Công cụ miễn phí"
      title={
        <>
          Nén video
          <br />
          <em>ngay trên trình duyệt.</em>
        </>
      }
      description="Chọn video, chọn mức nén, video được xử lý trực tiếp trên máy bạn — không tải lên máy chủ nào. Video dài có thể mất vài phút."
      related={[
        { href: "/cong-cu/nen-anh", label: "Nén ảnh", description: "Thu nhỏ ảnh cưới trên trình duyệt." },
        { href: "/studio", label: "Mở Studio", description: "Tạo thiệp đầy đủ để gửi khách." },
      ]}
    >
      <VideoCompressTool />
    </ToolPage>
  );
}
