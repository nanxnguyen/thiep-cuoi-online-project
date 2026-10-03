import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ToolPage } from "@/components/tools/ToolPage";
import { VideoCompressTool } from "@/components/tools/VideoCompressTool";

export const metadata: Metadata = pageMetadata("/cong-cu/nen-video");

export default function Page() {
  return (
    <ToolPage path="/cong-cu/nen-video" name="Nén video" title="Nén video cưới" description="Thu nhỏ video phóng sự cưới trước khi đưa vào thiệp. Video được xử lý ngay trên máy bạn, không tải lên máy chủ nào; video dài có thể mất vài phút." width={900}
      guide={<><h2>Nén video cưới để gửi Zalo, email</h2><p>Video phóng sự cưới thường quá nặng để gửi qua Zalo hoặc đính kèm email. Công cụ này thu nhỏ video ngay trên trình duyệt — không tải lên máy chủ nào nên không lo lộ khoảnh khắc riêng tư. Video dài có thể mất vài phút, bạn cứ để tab chạy.</p><p>Video gọn rồi thì <Link href="/studio">đưa vào thiệp cưới online</Link> để khách xem ngay trên thiệp.</p></>}
    >
      <VideoCompressTool />
    </ToolPage>
  );
}
