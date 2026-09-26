import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { SeatingTool } from "@/components/tools/SeatingTool";

export const metadata: Metadata = {
  title: "Sơ đồ chỗ ngồi đám cưới, xếp bàn kéo-thả",
  description: "Xếp khách vào từng bàn tiệc cưới bằng cách kéo-thả hoặc chạm để chọn. Lưu ngay trên trình duyệt, xuất CSV danh sách theo bàn.",
  alternates: { canonical: "/cong-cu/so-do-cho-ngoi" },
};

export default function Page() {
  return (
    <ToolPage name="Sơ đồ chỗ ngồi" title="Sơ đồ chỗ ngồi" width={1100} gap={24}>
      <p className="tool-meta tool-meta--14">Chạm hoặc nhấn giữ để chọn khách, rồi bấm vào bàn để xếp chỗ.</p>
      <SeatingTool />
    </ToolPage>
  );
}
