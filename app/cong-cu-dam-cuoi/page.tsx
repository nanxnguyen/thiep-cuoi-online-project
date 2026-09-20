import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo/SeoLandingPage";
export const metadata: Metadata = { title: "Công cụ đám cưới online", description: "Khám phá công cụ hỗ trợ chuẩn bị đám cưới: thiệp online, RSVP, lịch trình, bản đồ và sổ lưu bút.", alternates: { canonical: "/cong-cu-dam-cuoi" } };
export default function Page() { return <SeoLandingPage eyebrow="WEDDING TOOLS" title={<>Chuẩn bị ngày vui<br /><em>nhẹ nhàng hơn.</em></>} description="MỘC gom những phần quan trọng của một lời mời cưới vào một trải nghiệm đơn giản, đẹp và dễ chia sẻ." points={["Theo dõi xác nhận tham dự của khách mời rõ ràng hơn.", "Gửi lịch trình, địa điểm và hướng dẫn đến từng người.", "Lưu lại những lời chúc đáng nhớ trong sổ lưu bút online."]} related={[]} />; }
