import type { Metadata } from "next";
import { LegalBody, type LegalSection } from "@/components/marketing/LegalBody";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Quyền riêng tư",
  description: "MỘC lưu những dữ liệu nào khi bạn làm thiệp cưới online, ai xem được, dùng dịch vụ bên ngoài nào và bạn có những quyền gì.",
  alternates: { canonical: "/quyen-rieng-tu" },
};

const contact = CONTACT_EMAIL
  ? `Mọi yêu cầu về dữ liệu, gồm cả yêu cầu xoá thiệp, xin gửi tới ${CONTACT_EMAIL}. Hãy kèm đường dẫn thiệp; không cần gửi link chỉnh sửa. Với yêu cầu xoá hoặc sửa, chúng mình có thể cần bạn chứng minh quyền quản lý thiệp (ví dụ mở được thiệp bằng link chỉnh sửa).`
  : "Kênh nhận yêu cầu về dữ liệu, gồm cả yêu cầu xoá thiệp, sẽ được công bố tại trang này khi MỘC chính thức ra mắt.";

const sections: LegalSection[] = [
  {
    title: "Dữ liệu MỘC lưu",
    body: [
      "MỘC chỉ lưu những gì cần để thiệp hoạt động:",
      [
        "Nội dung thiệp hai bạn nhập: tên, ngày giờ, địa điểm, lời mời, thông tin hai họ, câu hỏi xác nhận tham dự và, nếu bật mừng cưới, ngân hàng, số tài khoản và tên chủ tài khoản.",
        "Ảnh và nhạc hai bạn tải lên.",
        "Từ khách: tên, việc đến hay không, số người đi cùng, ghi chú, câu trả lời cho các câu hỏi riêng, lời chúc, và tên hộ từ danh sách khách (link riêng ?g=) nếu khách mở bằng link đó khi gửi xác nhận.",
        "Một bản băm (SHA-256) của khoá chỉnh sửa. MỘC không lưu chính khoá.",
      ],
      "Trình duyệt của bạn lưu danh sách \"Thiệp của tôi\" cùng khoá chỉnh sửa trong bộ nhớ cục bộ (localStorage). Dữ liệu đó ở trên máy bạn, không phải trên máy chủ MỘC.",
      "MỘC hiện không dùng cookie theo dõi, không cài công cụ phân tích hay quảng cáo của bên thứ ba.",
    ],
  },
  {
    title: "Mục đích sử dụng",
    body: [
      "Dữ liệu được dùng để hiển thị thiệp cho khách, chuyển phản hồi của khách cho chủ thiệp, lưu lại những gì hai bạn đã chỉnh sửa và chống spam. MỘC không bán dữ liệu và không dùng dữ liệu để quảng cáo.",
      "Để chống spam, địa chỉ mạng của người gửi được tạm giữ trong bộ nhớ của máy chủ nhằm giới hạn số lần gửi liên tiếp; địa chỉ này không được ghi vào cơ sở dữ liệu. Nhà cung cấp hạ tầng có thể có nhật ký truy cập riêng theo chính sách của họ.",
    ],
  },
  {
    title: "Ai xem được dữ liệu",
    body: [
      [
        "Nội dung thiệp, ảnh, nhạc, số tài khoản mừng cưới (nếu bật) và các lời chúc chưa bị ẩn: ai có link thiệp đều xem được. Thiệp không được đưa vào công cụ tìm kiếm, nhưng link không có mật khẩu, nên hãy chỉ gửi cho người hai bạn muốn mời.",
        "Ảnh và nhạc nằm trong kho lưu trữ công khai: ai biết địa chỉ tệp đều mở được, dù không qua trang thiệp.",
        "Câu trả lời xác nhận tham dự: chỉ người có link chỉnh sửa xem được. Khách không thấy phản hồi của nhau.",
        "Lời chúc bị chủ thiệp ẩn thì không còn hiện trên trang khách.",
      ],
    ],
  },
  {
    title: "Dịch vụ bên ngoài",
    body: [
      "MỘC chạy trên hạ tầng đám mây (website, cơ sở dữ liệu, kho lưu ảnh và nhạc). Ngoài ra trình duyệt của người dùng gọi trực tiếp tới một số dịch vụ:",
      [
        "img.vietqr.io: tạo hình mã QR mừng cưới. Địa chỉ ảnh chứa ngân hàng, số tài khoản và tên chủ tài khoản bạn nhập nên dịch vụ này nhận được các thông tin đó khi ảnh được tải.",
        "Google Maps: chỉ tải bản đồ nhúng khi khách bấm \"Xem bản đồ\"; nút \"Chỉ đường\" mở Google Maps ở một tab riêng.",
        "api.qrserver.com: tạo mã QR của đường link thiệp trong hộp thoại chia sẻ của Studio và ở công cụ Tạo mã QR, nên dịch vụ này nhận đường link được nhập.",
        "unpkg.com: công cụ Nén video (/cong-cu/nen-video) tải phần mềm xử lý video (ffmpeg) từ đây khi bạn mở trang đó, chỉ để trình duyệt của bạn dùng — video của bạn không được gửi lên unpkg.com hay bất kỳ máy chủ nào, việc nén diễn ra hoàn toàn trên máy bạn.",
      ],
      "Các dịch vụ này có chính sách riêng của họ.",
    ],
  },
  {
    title: "Thời gian lưu",
    body: ["Hiện MỘC chưa đặt thời hạn tự động xoá. Dữ liệu được giữ cho tới khi có yêu cầu xoá hoặc khi MỘC ngừng dịch vụ (khi đó chúng mình sẽ báo trước trên trang này)."],
  },
  {
    title: "Quyền của bạn",
    body: [
      [
        "Xem và sửa nội dung thiệp bất cứ lúc nào trong Studio.",
        "Gỡ xuất bản để ngừng chia sẻ thiệp, ngay trong hộp thoại chia sẻ.",
        "Yêu cầu xoá hẳn thiệp và dữ liệu liên quan, kể cả phản hồi và lời chúc của khách.",
        "Khách mời muốn xoá câu trả lời hoặc lời chúc của mình có thể nhờ chủ thiệp, hoặc gửi yêu cầu theo mục liên hệ bên dưới.",
      ],
      "Vì MỘC chưa có tài khoản, quyền quản lý thiệp gắn với link chỉnh sửa. Ai giữ link đó được coi là chủ thiệp.",
    ],
  },
  {
    title: "Bảo mật",
    body: [
      "Khoá chỉnh sửa chỉ được lưu dưới dạng bản băm; phần khoá trong đường link nằm sau dấu # nên trình duyệt không gửi nó tới máy chủ khi mở trang. Dữ liệu được truyền qua kết nối HTTPS. Loại tệp tải lên được kiểm tra ở máy chủ, và các biểu mẫu công khai có giới hạn tốc độ.",
      "Không hệ thống nào an toàn tuyệt đối. Hãy giữ link chỉnh sửa như một chiếc chìa khoá và đừng đăng nó lên nơi công khai.",
    ],
  },
  {
    title: "Thay đổi chính sách",
    body: ["Khi có thay đổi quan trọng, chúng mình cập nhật trang này và đổi ngày cập nhật ở đầu trang."],
  },
  { title: "Liên hệ", body: [contact] },
];

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <LegalBody href="/quyen-rieng-tu" title="Quyền riêng tư" sections={sections} updated="22.09.2026" />
    </MarketingLayout>
  );
}
