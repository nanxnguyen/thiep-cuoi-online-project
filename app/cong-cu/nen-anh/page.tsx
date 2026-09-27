import type { Metadata } from "next";
import Link from "next/link";
import { ToolPage } from "@/components/tools/ToolPage";
import { ImageCompressTool } from "@/components/tools/ImageCompressTool";

export const metadata: Metadata = {
  title: "Nén ảnh cưới miễn phí, ngay trên trình duyệt",
  description: "Thu nhỏ ảnh cưới còn tối đa 1600px và 2MB ngay trên trình duyệt, không tải ảnh lên máy chủ nào. Miễn phí, không giới hạn số ảnh.",
  alternates: { canonical: "/cong-cu/nen-anh" },
};

export default function Page() {
  return (
    <ToolPage name="Nén ảnh" title="Nén ảnh cưới" description="Giảm ảnh về tối đa 1600px, chất lượng vẫn đẹp trên điện thoại. Xử lý ngay trên máy của bạn, không tải lên đâu cả." width={900} ledeWidth={560}
      guide={<><h2>Vì sao nên nén ảnh cưới trước khi đăng</h2><p>Ảnh gốc từ studio thường nặng 10–30 MB, tải lên chậm và tốn dung lượng thiệp. Công cụ này thu ảnh về cạnh dài tối đa 1600 px (vừa màn hình điện thoại) và dưới 2 MB mà mắt thường khó thấy khác biệt. Mọi thứ xử lý ngay trên trình duyệt của bạn, ảnh không hề rời khỏi máy.</p><p>Ảnh đã gọn thì <Link href="/studio">đưa vào thiệp cưới online</Link> hoặc khoe trước trong <Link href="/templates">mẫu thiệp</Link> bạn thích.</p></>}
    >
      <ImageCompressTool />
    </ToolPage>
  );
}
