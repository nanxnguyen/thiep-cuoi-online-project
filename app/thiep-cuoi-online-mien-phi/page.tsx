import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo/SeoLandingPage";

export const metadata: Metadata = { title: "Thiệp cưới online miễn phí", description: "Tạo thiệp cưới online miễn phí với mẫu đẹp, RSVP, bản đồ, QR tiền mừng và nhạc nền trên MỘC Wedding.", alternates: { canonical: "/thiep-cuoi-online-mien-phi" } };
export default function Page() { return <SeoLandingPage eyebrow="Thiệp cưới online miễn phí" title={<>Tạo thiệp cưới<br /><em>theo cách riêng.</em></>} description="Chọn mẫu, nhập thông tin, thêm ảnh và gửi lời mời đến những người bạn yêu quý. MỘC giúp bạn bắt đầu miễn phí trong vài phút." points={["Nhiều phong cách thiết kế hiện đại, tối giản và dễ cá nhân hóa.", "Thiệp hiển thị đẹp trên điện thoại, có thể chia sẻ bằng một đường link.", "Thêm RSVP, lịch trình, bản đồ, sổ lưu bút và nhạc nền khi cần."]} related={[]} />; }
