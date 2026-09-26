import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { GuestListTool } from "@/components/tools/GuestListTool";

export const metadata: Metadata = {
  title: "Lập danh sách khách mời cưới miễn phí (CSV)",
  description: "Lập danh sách khách mời theo hộ/nhóm, xuất file CSV để lưu hoặc nhập vào sổ khách mời trong Studio khi bạn đã tạo thiệp.",
  alternates: { canonical: "/cong-cu/danh-sach-khach" },
};

export default function Page() {
  return (
    <ToolPage name="Danh sách khách" width={1000} gap={24}>
      <GuestListTool />
    </ToolPage>
  );
}
