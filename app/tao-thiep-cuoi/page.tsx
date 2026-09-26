import type { Metadata } from "next";
import { LpSteps, LpWhy, SeoLandingPage } from "@/components/seo/SeoLandingPage";
import { templates } from "@/lib/templates";

export const metadata: Metadata = { title: "Tạo thiệp cưới online", description: "Hướng dẫn tạo thiệp cưới online nhanh chóng với ảnh, nhạc và preview realtime.", alternates: { canonical: "/tao-thiep-cuoi" } };

// design/Tao Thiep Cuoi.dc.html; the template count is the real registry size.
export default function Page() {
  return (
    <SeoLandingPage
      eyebrow="TẠO THIỆP CƯỚI ONLINE"
      title={<>Tạo thiệp cưới trong 15 phút, <em>miễn phí hoàn toàn</em></>}
      description="Chọn mẫu, điền tên và ngày cưới, gửi link cho khách. Không cần thiết kế, không cần đăng nhập để bắt đầu."
      cta={{ href: "/studio", label: "Tạo thiệp cưới ngay" }}
    >
      <LpSteps
        steps={[
          { n: "1", t: "Chọn mẫu", d: `${templates.length} mẫu, 6 phong cách khác nhau` },
          { n: "2", t: "Điền nội dung", d: "Tên, ngày, địa điểm, ảnh và nhạc" },
          { n: "3", t: "Gửi link", d: "Chia sẻ qua Zalo, Messenger hay SMS" },
        ]}
      />
      <LpWhy
        title="Vì sao chọn Mộc"
        items={[
          { t: "Không mất tiền", d: "Mọi mẫu và tính năng đều miễn phí, không giới hạn khách." },
          { t: "Tự lưu", d: "Không lo mất dữ liệu, Mộc lưu lại mỗi khi bạn gõ." },
          { t: "Đổi mẫu tự do", d: "Đổi mẫu bất cứ lúc nào, nội dung vẫn còn nguyên." },
          { t: "Link riêng từng khách", d: "Mỗi khách một link mang tên họ." },
        ]}
      />
    </SeoLandingPage>
  );
}
