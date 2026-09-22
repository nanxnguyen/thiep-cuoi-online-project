import type { Metadata } from "next";
import { LegalBody, type LegalSection } from "@/components/marketing/LegalBody";
import { MarketingLayout, PageHero } from "@/components/marketing/MarketingLayout";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng",
  description: "Điều khoản khi dùng MỘC để tạo thiệp cưới online: nội dung của bạn, link chỉnh sửa, mừng cưới bằng QR, nội dung bị cấm và giới hạn trách nhiệm.",
  alternates: { canonical: "/dieu-khoan" },
};

const contact = CONTACT_EMAIL
  ? `Thắc mắc về điều khoản này, xin gửi tới ${CONTACT_EMAIL}.`
  : "Kênh liên hệ về điều khoản sẽ được công bố tại trang này khi MỘC chính thức ra mắt.";

const sections: LegalSection[] = [
  {
    title: "Chấp nhận điều khoản",
    body: ["Khi tạo, chỉnh sửa, xuất bản hoặc mở một thiệp trên MỘC, bạn đồng ý với các điều khoản này. Nếu không đồng ý, xin đừng sử dụng dịch vụ."],
  },
  {
    title: "Dịch vụ MỘC cung cấp",
    body: [
      "MỘC cho phép bạn làm một thiệp cưới online, xuất bản thành một đường link, và nhận xác nhận tham dự, lời chúc của khách. Hiện dịch vụ miễn phí.",
      "MỘC có thể thay đổi, tạm ngừng hoặc ngừng một phần dịch vụ. Với thay đổi lớn, chúng mình sẽ thông báo trên trang web.",
    ],
  },
  {
    title: "Link chỉnh sửa",
    body: [
      "MỘC chưa có tài khoản. Quyền sửa thiệp nằm ở link chỉnh sửa. Ai giữ link đó được coi là chủ thiệp và sửa được nội dung, xuất bản, gỡ xuất bản, xem phản hồi và ẩn lời chúc.",
      "Bạn tự chịu trách nhiệm giữ kín link chỉnh sửa. MỘC không thể khôi phục link đã mất và không chịu trách nhiệm về việc người khác dùng link mà bạn để lộ.",
    ],
  },
  {
    title: "Nội dung của bạn",
    body: [
      "Nội dung bạn đưa lên (chữ, ảnh, nhạc, thông tin tài khoản) vẫn thuộc về bạn. Bạn cho phép MỘC lưu trữ, xử lý và hiển thị nội dung đó cho mục đích duy nhất là vận hành thiệp của bạn.",
      "Bạn cam kết có quyền sử dụng nội dung mình đưa lên, gồm bản quyền của ảnh và bản nhạc, và sự đồng ý của những người xuất hiện trong ảnh khi cần.",
    ],
  },
  {
    title: "Nội dung không được phép",
    body: [
      "Không dùng MỘC cho các nội dung sau:",
      [
        "Vi phạm pháp luật, hoặc xâm phạm bản quyền, quyền hình ảnh, quyền riêng tư của người khác.",
        "Lừa đảo hoặc gây hiểu nhầm, đặc biệt là đưa thông tin tài khoản nhận tiền không phải của bạn hoặc của người bạn được uỷ quyền.",
        "Nội dung độc hại, xúc phạm, kích động hoặc không phù hợp với thuần phong mỹ tục.",
        "Spam, tự động hoá việc gửi biểu mẫu hoặc cố tình làm gián đoạn dịch vụ.",
      ],
      "MỘC có thể gỡ nội dung hoặc thiệp vi phạm, kể cả không báo trước trong trường hợp nghiêm trọng.",
    ],
  },
  {
    title: "Mừng cưới bằng QR",
    body: [
      "MỘC chỉ hiển thị mã QR được tạo từ thông tin ngân hàng bạn nhập. MỘC không tham gia, không lưu giữ và không chịu trách nhiệm về giao dịch giữa khách và tài khoản của bạn.",
      "Bạn chịu trách nhiệm về độ chính xác của số tài khoản và tên chủ tài khoản. Hãy tự quét thử mã trước khi gửi thiệp.",
    ],
  },
  {
    title: "Nội dung do khách gửi",
    body: [
      "Lời chúc và câu trả lời do khách mời gửi thuộc trách nhiệm của người gửi. MỘC không kiểm duyệt trước. Chủ thiệp có thể ẩn lời chúc khỏi trang khách bất cứ lúc nào.",
    ],
  },
  {
    title: "Giới hạn trách nhiệm",
    body: [
      "Dịch vụ được cung cấp trên cơ sở \"như hiện có\". MỘC cố gắng để dịch vụ chạy ổn định nhưng không cam kết hoạt động liên tục hay không có lỗi, và không chịu trách nhiệm về thiệt hại gián tiếp phát sinh từ việc sử dụng hoặc không sử dụng được dịch vụ.",
      "Hãy giữ một bản sao ảnh, nhạc và nội dung gốc của hai bạn ở nơi khác.",
    ],
  },
  {
    title: "Thay đổi điều khoản",
    body: ["Khi điều khoản thay đổi, chúng mình cập nhật trang này và đổi ngày cập nhật. Việc tiếp tục dùng dịch vụ sau đó nghĩa là bạn chấp nhận bản mới."],
  },
  { title: "Luật áp dụng", body: ["Các điều khoản này được điều chỉnh theo pháp luật Việt Nam."] },
  { title: "Liên hệ", body: [contact] },
];

export default function TermsPage() {
  return (
    <MarketingLayout>
      <PageHero crumbs={[{ label: "Điều khoản sử dụng" }]} eyebrow="Điều khoản" title={<>Điều khoản <em>sử dụng.</em></>} lede="Những quy ước đơn giản khi làm và chia sẻ thiệp cưới trên MỘC." />
      <LegalBody sections={sections} updated="21 tháng 9, 2026" />
    </MarketingLayout>
  );
}
