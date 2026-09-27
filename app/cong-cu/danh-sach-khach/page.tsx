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
    <ToolPage name="Danh sách khách" width={1000} gap={24}
      guide={<><h2>Cách lập danh sách khách mời cưới</h2><p>Lập danh sách theo hộ thay vì từng người: mỗi hộ một dòng, ghi nhóm (nhà trai, bạn bè), số người dự kiến và bàn. Danh sách gọn giúp bạn tính số mâm, in thiệp giấy và theo dõi ai đã xác nhận. Xuất CSV để lưu, nhập lại bất cứ lúc nào.</p><p>Khi đã <Link href="/studio">tạo thiệp cưới online</Link>, nhập danh sách này vào tab Khách mời để gửi link xác nhận riêng từng hộ.</p></>}
    >
      <GuestListTool />
    </ToolPage>
  );
}
