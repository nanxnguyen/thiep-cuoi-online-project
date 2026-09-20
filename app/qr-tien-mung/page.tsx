import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo/SeoLandingPage";
export const metadata: Metadata = { title: "QR tiền mừng cưới và bản đồ", description: "Thêm QR tiền mừng, địa điểm và bản đồ vào thiệp cưới online.", alternates: { canonical: "/qr-tien-mung" } };
export default function Page() { return <SeoLandingPage eyebrow="QR & LOCATION" title={<>Mọi thông tin<br /><em>trong một lời mời.</em></>} description="Tích hợp thông tin địa điểm, bản đồ và QR tiền mừng một cách tinh tế trong thiệp cưới online." points={["Khách mời dễ tìm đường đến buổi tiệc bằng bản đồ tích hợp.", "Thêm thông tin mừng cưới khi bạn đã sẵn sàng.", "Thiết kế QR hài hòa với tổng thể, không làm mất đi cảm xúc của thiệp."]} related={[]} />; }
