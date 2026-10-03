import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ToolPage } from "@/components/tools/ToolPage";
import { GuestListTool } from "@/components/tools/GuestListTool";

export const metadata: Metadata = pageMetadata("/cong-cu/danh-sach-khach");

export default function Page() {
  return (
    <ToolPage path="/cong-cu/danh-sach-khach" name="Danh sách khách" width={1000} gap={24}
      guide={<><h2>Cách lập danh sách khách mời cưới</h2><p>Lập danh sách theo hộ thay vì từng người: mỗi hộ một dòng, ghi nhóm (nhà trai, bạn bè), số người dự kiến và bàn. Danh sách gọn giúp bạn tính số mâm, in thiệp giấy và theo dõi ai đã xác nhận. Xuất CSV để lưu, nhập lại bất cứ lúc nào.</p><p>Khi đã <Link href="/studio">tạo thiệp cưới online</Link>, nhập danh sách này vào tab Khách mời để gửi link xác nhận riêng từng hộ.</p></>}
    >
      <p className="tool-note" role="status">Công cụ đang được hoàn thiện thêm — một số tính năng mới sẽ phát triển sau.</p>
      <GuestListTool />
    </ToolPage>
  );
}
