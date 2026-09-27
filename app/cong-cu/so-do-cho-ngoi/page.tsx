import type { Metadata } from "next";
import Link from "next/link";
import { ToolPage } from "@/components/tools/ToolPage";
import { SeatingTool } from "@/components/tools/SeatingTool";

export const metadata: Metadata = {
  title: "Sơ đồ chỗ ngồi đám cưới, xếp bàn kéo-thả",
  description: "Xếp khách vào từng bàn tiệc cưới bằng cách kéo-thả hoặc chạm để chọn. Lưu ngay trên trình duyệt, xuất CSV danh sách theo bàn.",
  alternates: { canonical: "/cong-cu/so-do-cho-ngoi" },
};

export default function Page() {
  return (
    <ToolPage name="Sơ đồ chỗ ngồi" title="Sơ đồ chỗ ngồi" width={1100} gap={24}
      guide={<><h2>Cách xếp sơ đồ chỗ ngồi đám cưới</h2><p>Xếp người lớn tuổi và hai họ gần sân khấu, nhóm bạn bè ngồi cùng bàn cho rôm rả. Kéo-thả từng hộ vào bàn, đặt tên bàn theo nhóm (Nhà trai, Bạn đại học...) để hôm cưới không ai phải hỏi chỗ. Sơ đồ lưu ngay trên trình duyệt, xuất CSV để in ra giấy.</p><p>Xếp xong, <Link href="/studio">tạo thiệp cưới online</Link> và dùng tab Khách mời để gửi link xác nhận tham dự, biết trước số mâm cần đặt.</p></>}
    >
      <p className="tool-meta tool-meta--14">Chạm hoặc nhấn giữ để chọn khách, rồi bấm vào bàn để xếp chỗ.</p>
      <SeatingTool />
    </ToolPage>
  );
}
