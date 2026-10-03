// Single source for the title/description/lastmod of every indexable static page. Pages call pageMetadata(path),
// sitemap.ts reads SEO_PAGES, tests/seo.test.ts guards length and uniqueness. One primary keyword per page
// (plan: docs/superpowers/plans/2026-10-01-seo-pages-plan.md). Root layout appends " | MỘC Wedding" to titles,
// so TITLE_MAX counts that suffix.
export const TITLE_SUFFIX = " | MỘC Wedding";
export const TITLE_MAX = 60;
export const DESCRIPTION_MIN = 70;
export const DESCRIPTION_MAX = 160;

export type SeoPage = { title: string; description: string; lastModified: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" };

const page = (title: string, description: string, priority: number, changeFrequency: SeoPage["changeFrequency"], lastModified = "2026-10-01"): SeoPage => ({ title, description, priority, changeFrequency, lastModified });

// "/" uses the root layout's title.default, so its title here is the full title with no suffix.
export const HOME_TITLE = "MỘC: Tạo thiệp cưới online đẹp, miễn phí";

export const SEO_PAGES: Record<string, SeoPage> = {
  "/": page(HOME_TITLE, "Tạo thiệp cưới online sang trọng: chọn mẫu, thêm ảnh và câu chuyện, gửi qua Zalo. Khách xác nhận tham dự, gửi lời chúc và mừng cưới ngay trên thiệp.", 1, "weekly"),
  "/templates": page("Mẫu thiệp cưới online đẹp, nhiều phong cách", "Hơn 20 mẫu thiệp cưới online: tối giản, cổ điển, vườn xanh, đỏ son, thủy mặc, phong cách Hàn. Xem thử từng mẫu và chọn màu rồi tạo thiệp miễn phí.", 0.9, "weekly"),
  "/demo": page("Xem thử thiệp cưới online MỘC", "Xem thử các kiểu bìa và trải nghiệm thiệp cưới online MỘC: phong bì mở thiệp, đếm ngược ngày cưới, lời chúc và mừng cưới bằng QR trên điện thoại.", 0.8, "weekly"),
  "/bang-gia": page("Giá thiệp cưới online: miễn phí ra mắt", "MỘC miễn phí trong giai đoạn ra mắt: không cần tài khoản, không cần thẻ. Xem những gì có sẵn và những tính năng đang được lên kế hoạch.", 0.8, "weekly"),
  "/thiet-ke-thiep-rieng": page("Thiết kế thiệp cưới riêng theo yêu cầu", "Muốn một tấm thiệp cưới online độc bản? MỘC nhận thiết kế riêng theo ý tưởng, màu sắc và ảnh của hai bạn. Gửi yêu cầu để được tư vấn và báo giá.", 0.6, "monthly", "2026-10-03"),
  "/blog": page("Blog cưới: hướng dẫn chuẩn bị đám cưới", "Hướng dẫn thực tế để chuẩn bị đám cưới: cách làm thiệp cưới online, viết lời mời, mừng cưới bằng QR, lập danh sách khách và lịch gửi thiệp.", 0.8, "weekly", "2026-10-04"),
  "/tro-giup": page("Hướng dẫn làm thiệp cưới online", "Giải đáp về link chỉnh sửa, xuất bản, ảnh và nhạc, xác nhận tham dự, lời chúc và quyền riêng tư khi làm thiệp cưới online với MỘC.", 0.8, "weekly"),
  "/thiep-cuoi-online-mien-phi": page("Thiệp cưới online miễn phí, không cần đăng ký", "Tạo thiệp cưới online miễn phí với mẫu đẹp, xác nhận tham dự (RSVP), bản đồ, QR tiền mừng và nhạc nền. Không cần tài khoản, gửi link qua Zalo trong vài phút.", 0.9, "weekly"),
  "/tao-thiep-cuoi": page("Cách tạo thiệp cưới online trong vài phút", "Hướng dẫn tạo thiệp cưới online từng bước: chọn mẫu, nhập thông tin, thêm ảnh và nhạc, xem trước trực tiếp rồi gửi link thiệp cho khách mời qua Zalo.", 0.9, "weekly"),
  "/qr-tien-mung": page("QR mừng cưới: thêm vào thiệp online", "Thêm mã QR nhận tiền mừng cưới, địa điểm và bản đồ vào thiệp cưới online. Khách quét QR ngân hàng để mừng, không cần hỏi số tài khoản.", 0.8, "weekly"),
  "/tin-nhan-moi-cuoi": page("Lời mời cưới hay: tin nhắn gửi Zalo, SMS", "Gợi ý tin nhắn mời cưới ngắn gọn, tự nhiên và lịch sự để gửi qua Zalo, Messenger hoặc SMS cho bạn bè, đồng nghiệp và người lớn tuổi.", 0.8, "weekly"),
  "/cong-cu-dam-cuoi": page("Công cụ đám cưới miễn phí: QR, ảnh, khách mời", "Công cụ miễn phí cho đám cưới: tạo mã QR, nén ảnh, nén video, soạn tin nhắn mời, lập danh sách khách và ảnh save the date. Chạy ngay trên trình duyệt.", 0.8, "weekly"),
  "/ung-ho": page("Ủng hộ dự án MỘC", "MỘC miễn phí và không có quảng cáo. Nếu thiệp giúp ích cho ngày cưới của hai bạn, có thể ủng hộ dự án qua chuyển khoản trực tiếp.", 0.3, "yearly"),
  "/cong-cu/tao-qr": page("Tạo mã QR cho link thiệp cưới", "Dán link thiệp cưới online, lấy ngay mã QR để in lên thiệp giấy, standee hoặc banner ngày cưới. Miễn phí, không cần đăng nhập.", 0.7, "monthly"),
  "/cong-cu/nen-anh": page("Nén ảnh cưới miễn phí, ngay trên trình duyệt", "Thu nhỏ ảnh cưới còn tối đa 1600px và 2MB ngay trên trình duyệt, không tải ảnh lên máy chủ nào. Miễn phí, không giới hạn số ảnh.", 0.7, "monthly"),
  "/cong-cu/nen-video": page("Nén video cưới miễn phí trên trình duyệt", "Nén video cưới ngay trên trình duyệt để dễ gửi qua Zalo hoặc email. Video được xử lý trên máy bạn, không tải lên máy chủ nào.", 0.7, "monthly"),
  "/cong-cu/tin-nhan-moi": page("Tạo tin nhắn mời cưới, gửi Zalo hoặc SMS", "Điền tên cô dâu chú rể, ngày cưới và link thiệp, nhận ngay 2 gợi ý tin nhắn mời, gần gũi và trang trọng, để sao chép và gửi.", 0.7, "monthly"),
  "/cong-cu/danh-sach-khach": page("Lập danh sách khách mời cưới miễn phí (CSV)", "Lập danh sách khách mời theo hộ hoặc nhóm, xuất file CSV để lưu hoặc nhập vào sổ khách mời trong Studio khi bạn đã tạo thiệp.", 0.7, "monthly"),
  "/cong-cu/save-the-date": page("Tạo ảnh Save The Date miễn phí", "Tạo ảnh báo ngày cưới (save the date) ngay trên trình duyệt: tên, ngày cưới, ảnh nền tuỳ chọn. Tải về để đăng Zalo, Facebook hoặc Instagram.", 0.7, "monthly"),
  "/dieu-khoan": page("Điều khoản sử dụng", "Điều khoản khi dùng MỘC để tạo thiệp cưới online: nội dung của bạn, link chỉnh sửa, mừng cưới bằng QR, nội dung bị cấm và giới hạn trách nhiệm.", 0.3, "yearly"),
  "/quyen-rieng-tu": page("Quyền riêng tư", "MỘC lưu những dữ liệu nào khi bạn làm thiệp cưới online, ai xem được, dùng dịch vụ bên ngoài nào và bạn có những quyền gì.", 0.3, "yearly"),
};

type TemplateSeoInput = { id: string; name: string; seo: string };

// "/templates/[id]": title carries the template name, description is the registry's own copy.
export function templateSeo(t: TemplateSeoInput): { title: string; description: string } {
  return { title: `Mẫu thiệp cưới ${t.name}`, description: t.seo };
}

export function pageMetadata(path: string) {
  const p = SEO_PAGES[path];
  if (!p) throw new Error(`No SEO entry for ${path}`);
  return metadataFor(path, p.title, p.description, path === "/");
}

export function metadataFor(path: string, title: string, description: string, absoluteTitle = false) {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website" as const,
      locale: "vi_VN",
      siteName: "MỘC Wedding",
      url: path,
      title,
      description,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "MỘC Wedding — thiệp cưới online" }],
    },
  };
}
