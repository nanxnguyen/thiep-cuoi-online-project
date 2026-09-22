import type { Metadata } from "next";
import Link from "next/link";
import { ToolPage } from "@/components/tools/ToolPage";
import { GuestListTool } from "@/components/tools/GuestListTool";

export const metadata: Metadata = {
  title: "Lập danh sách khách mời cưới miễn phí (CSV)",
  description: "Lập danh sách khách mời theo hộ/nhóm, xuất file CSV để lưu hoặc nhập vào sổ khách mời trong Studio khi bạn đã tạo thiệp.",
  alternates: { canonical: "/cong-cu/danh-sach-khach" },
};

export default function Page() {
  return (
    <ToolPage
      eyebrow="Công cụ miễn phí"
      title={
        <>
          Lập danh sách
          <br />
          <em>khách mời trước.</em>
        </>
      }
      description="Ghi lại từng hộ/nhóm khách trước khi bạn cần đến thiệp — lưu ngay trên trình duyệt này, xuất CSV bất cứ lúc nào."
      related={[
        { href: "/cong-cu/so-do-cho-ngoi", label: "Sơ đồ chỗ ngồi", description: "Xếp bàn cho đúng danh sách này." },
        { href: "/studio", label: "Mở Studio", description: "Tạo thiệp rồi nhập file CSV vào tab Khách mời." },
      ]}
    >
      <p className="pn-hint" style={{ maxWidth: 620 }}>
        Đã có thiệp? Vào <Link href="/studio">Studio</Link> → tab <strong>Khách mời</strong> → <strong>Nhập CSV</strong> và chọn file bạn vừa xuất từ đây để lấy link riêng cho từng khách.
      </p>
      <GuestListTool />
    </ToolPage>
  );
}
