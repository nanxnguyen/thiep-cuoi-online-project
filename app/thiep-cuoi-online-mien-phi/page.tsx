import type { Metadata } from "next";
import { LpChecklist, SeoLandingPage } from "@/components/seo/SeoLandingPage";
import { templates } from "@/lib/templates";

export const metadata: Metadata = { title: "Thiệp cưới online miễn phí", description: "Tạo thiệp cưới online miễn phí với mẫu đẹp, RSVP, bản đồ, QR tiền mừng và nhạc nền trên MỘC Wedding.", alternates: { canonical: "/thiep-cuoi-online-mien-phi" } };

// design/Thiep Cuoi Online Mien Phi.dc.html; the template count is the real registry size.
export default function Page() {
  return (
    <SeoLandingPage
      eyebrow="THIỆP CƯỚI ONLINE MIỄN PHÍ"
      title={<>Không mất một đồng nào, <span className="lp-shimmer">không giới hạn</span> tính năng</>}
      description="Trong khi nhiều nền tảng khác thu phí theo lượt xem hay tính năng, Mộc để mọi thứ miễn phí ngay từ đầu."
      cta={{ href: "/studio", label: "Bắt đầu miễn phí" }}
    >
      <LpChecklist
        items={[
          `${templates.length} mẫu thiệp, mọi phong cách`,
          "Đổi mẫu không mất nội dung",
          "Xác nhận tham dự không giới hạn khách",
          "Sổ lưu bút và mừng cưới QR",
          "Bản đồ, đếm ngược, album, nhạc nền",
          "Link riêng cho từng khách, không tính phí thêm",
          "Tài khoản lưu nhiều thiệp",
          "7 công cụ đám cưới chạy trên trình duyệt",
        ]}
      />
    </SeoLandingPage>
  );
}
