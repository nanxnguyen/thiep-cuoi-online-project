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
    <ToolPage name="Nén ảnh" title="Nén ảnh cưới" description="Giảm ảnh về tối đa 1600px, chất lượng vẫn đẹp trên điện thoại. Xử lý ngay trên máy của bạn, không tải lên đâu cả." width={900} ledeWidth={560}>
      <ImageCompressTool />
    </ToolPage>
  );
}
