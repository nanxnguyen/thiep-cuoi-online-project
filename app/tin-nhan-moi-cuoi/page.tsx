import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo/SeoLandingPage";
export const metadata: Metadata = { title: "Tin nhắn mời cưới hay và ý nghĩa", description: "Gợi ý tin nhắn mời cưới ngắn gọn, tự nhiên và dễ gửi qua Zalo, Messenger hoặc SMS.", alternates: { canonical: "/tin-nhan-moi-cuoi" } };
export default function Page() { return <SeoLandingPage eyebrow="WEDDING MESSAGE" title={<>Một lời nhắn<br /><em>thật chân thành.</em></>} description="Lời mời đẹp không chỉ nằm ở thiết kế. Hãy bắt đầu bằng một tin nhắn mang đúng giọng nói của hai bạn." points={["Mẫu lời mời thân mật để gửi cho bạn bè và người thân.", "Dễ copy, chỉnh sửa và chia sẻ cùng link thiệp riêng.", "Kết hợp lời nhắn với RSVP để khách mời phản hồi thuận tiện hơn."]} related={[]} />; }
