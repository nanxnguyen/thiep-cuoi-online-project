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
    <ToolPage
      eyebrow="Công cụ miễn phí"
      title={
        <>
          Xếp chỗ ngồi
          <br />
          <em>cho từng bàn tiệc.</em>
        </>
      }
      description="Kéo-thả từng hộ khách vào bàn, hoặc chạm để chọn rồi chạm vào bàn nếu bạn không quen kéo-thả. Dùng chung danh sách khách với công cụ Danh sách khách."
      related={[
        { href: "/cong-cu/danh-sach-khach", label: "Danh sách khách", description: "Nhập cả loạt khách bằng CSV." },
        { href: "/cong-cu-dam-cuoi", label: "Công cụ khác", description: "Xem thêm các công cụ miễn phí." },
      ]}
    >
      <SeatingTool />
    </ToolPage>
  );
}
