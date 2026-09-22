import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { ImageCompressTool } from "@/components/tools/ImageCompressTool";

export const metadata: Metadata = {
  title: "Nén ảnh cưới miễn phí, ngay trên trình duyệt",
  description: "Thu nhỏ ảnh cưới còn tối đa 1600px và 2MB ngay trên trình duyệt, không tải ảnh lên máy chủ nào. Miễn phí, không giới hạn số ảnh.",
  alternates: { canonical: "/cong-cu/nen-anh" },
};

export default function Page() {
  return (
    <ToolPage
      eyebrow="Công cụ miễn phí"
      title={
        <>
          Nén ảnh cưới
          <br />
          <em>ngay trên trình duyệt.</em>
        </>
      }
      description="Chọn nhiều ảnh cùng lúc, mỗi ảnh được thu nhỏ và nén ngay trên máy bạn — không có ảnh nào rời khỏi trình duyệt cho tới khi bạn bấm tải."
      related={[
        { href: "/studio", label: "Mở Studio", description: "Album ảnh trong thiệp cũng tự nén như thế này." },
        { href: "/cong-cu/save-the-date", label: "Ảnh save-the-date", description: "Dùng ảnh vừa nén để tạo ảnh báo ngày cưới." },
      ]}
    >
      <ImageCompressTool />
    </ToolPage>
  );
}
