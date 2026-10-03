export type Faq = { q: string; a: string };

// Help centre content. Answers describe what the product really does today (see the plan's "Nguyên tắc nội dung").
export type HelpGroup = { id: string; title: string; items: Faq[] };

export const helpGroups: readonly HelpGroup[] = [
  {
    id: "bat-dau",
    title: "Bắt đầu",
    items: [
      {
        q: "MỘC là gì?",
        a: "MỘC là nơi hai bạn làm một tấm thiệp cưới online: chọn mẫu, điền tên, ngày giờ, địa điểm, thêm ảnh và nhạc, rồi xuất bản thành một đường link để gửi cho khách. Trên thiệp, khách có thể xác nhận tham dự, để lại lời chúc và quét mã mừng cưới.",
      },
      {
        q: "Tôi có cần đăng ký tài khoản không?",
        a: "Không bắt buộc. Hai bạn có thể tạo thiệp ngay và lưu link chỉnh sửa. Nếu tạo tài khoản, bạn có thể nhận thiệp vào tài khoản để mở lại trên thiết bị khác.",
      },
      {
        q: "Dùng MỘC có mất phí không?",
        a: "Hiện tại toàn bộ tính năng miễn phí. Nếu sau này có gói trả phí, thông tin sẽ được đăng ở trang Bảng giá.",
      },
      {
        q: "Tôi có đổi mẫu thiệp sau khi đã nhập nội dung được không?",
        a: "Được. Ở tab Mẫu, chọn mẫu khác bất cứ lúc nào. Nội dung bạn đã nhập được giữ nguyên, chỉ giao diện thay đổi.",
      },
    ],
  },
  {
    id: "link-chinh-sua",
    title: "Link chỉnh sửa",
    items: [
      {
        q: "Link chỉnh sửa là gì và vì sao quan trọng?",
        a: "Đó là đường link có dạng /studio/…#k=… . Ai có link này đều sửa được thiệp, nên hãy coi nó như chìa khoá: chỉ gửi cho người bạn tin. Phần sau dấu # là khoá bí mật; trình duyệt không gửi phần này tới máy chủ khi mở trang, và máy chủ chỉ lưu một bản băm của khoá, không lưu chính khoá.",
      },
      {
        q: "Tôi làm mất link chỉnh sửa thì sao?",
        a: "Nếu thiệp đã được nhận vào tài khoản, hãy đăng nhập để mở lại. Nếu không, trang Studio trên trình duyệt cũ có thể còn lưu link sửa. Nếu mất cả link lẫn dữ liệu trình duyệt và chưa nhận vào tài khoản, MỘC không thể khôi phục khóa sửa; hãy giữ link ở nơi riêng tư.",
      },
      {
        q: "Tôi có sửa thiệp từ máy khác được không?",
        a: "Được. Mở link chỉnh sửa trên máy đó, hoặc vào trang Studio và dán link vào ô \"Mở thiệp bằng link\".",
      },
      {
        q: "Danh sách \"Thiệp của tôi\" ở trang Studio lưu ở đâu?",
        a: "Danh sách này chỉ nhớ trong trình duyệt của bạn. Nội dung thiệp thì nằm trên máy chủ MỘC, nên xoá dữ liệu trình duyệt không làm mất thiệp, chỉ làm mất lối vào nếu bạn chưa lưu link chỉnh sửa.",
      },
    ],
  },
  {
    id: "xuat-ban",
    title: "Xuất bản và gửi thiệp",
    items: [
      {
        q: "Xuất bản nghĩa là gì?",
        a: "Là chọn đường dẫn cho thiệp (ví dụ /invite/minh-va-an) và mở thiệp cho khách. Sau khi xuất bản, hai bạn vẫn sửa được bất cứ lúc nào và thiệp cập nhật ngay.",
      },
      {
        q: "Tôi đổi đường dẫn sau khi xuất bản được không?",
        a: "Không. Đường dẫn bị khoá sau lần xuất bản đầu tiên để những link đã gửi cho khách không bao giờ hỏng. Hãy chọn tên đường dẫn kỹ trước khi xuất bản.",
      },
      {
        q: "Tôi có ngừng chia sẻ thiệp được không?",
        a: "Được. Mở lại hộp thoại chia sẻ và bấm \"Gỡ xuất bản\". Khách mở link sẽ thấy trang không tìm thấy cho tới khi bạn xuất bản lại. Đường dẫn cũ vẫn được giữ cho bạn.",
      },
      {
        q: "Làm sao để khách thấy phong bì ghi tên họ?",
        a: "Thêm khách vào tab Khách mời trong Studio rồi sao chép link riêng của từng hộ (dạng /invite/duong-dan?g=mã-riêng). Không có mã thì phong bì ghi \"Quý khách\".",
      },
      {
        q: "Thiệp của tôi có xuất hiện trên Google không?",
        a: "Không. Trang thiệp được đặt để công cụ tìm kiếm không lập chỉ mục. Chỉ người có link mới mở được.",
      },
      {
        q: "Gửi qua Zalo hay Messenger thì khách thấy gì trước khi mở?",
        a: "Bản xem trước hiện tên hai bạn, một dòng mời và ảnh bìa nếu bạn đã chọn ảnh bìa.",
      },
    ],
  },
  {
    id: "anh-nhac",
    title: "Ảnh và nhạc",
    items: [
      {
        q: "Tôi thêm được bao nhiêu ảnh?",
        a: "Một ảnh bìa và tối đa 24 ảnh trong album. Ảnh nhận định dạng JPEG, PNG hoặc WebP.",
      },
      {
        q: "Ảnh của tôi nặng vài chục MB có tải được không?",
        a: "Được. Trình duyệt tự thu nhỏ ảnh (cạnh dài tối đa 1600 px) và nén xuống dưới 2 MB trước khi tải lên, hai bạn không phải tự chỉnh.",
      },
      {
        q: "Nhạc nền dùng định dạng nào?",
        a: "Trong Studio có vài bài nhạc chọn sẵn để nghe thử và dùng ngay. Nếu muốn nhạc riêng, hãy tải lên file MP3 tối đa 8 MB; MỘC không nhận link YouTube. Với nhạc tự tải lên, hãy dùng bản hai bạn có quyền sử dụng.",
      },
      {
        q: "Vì sao nhạc chưa phát khi khách vừa mở link?",
        a: "Trình duyệt chỉ cho phát nhạc sau khi người xem chạm vào trang. Vì thế nhạc bắt đầu khi khách chạm vào phong bì để mở thiệp.",
      },
    ],
  },
  {
    id: "khach-moi",
    title: "Khách mời và phản hồi",
    items: [
      {
        q: "Ai xem được các câu trả lời của khách?",
        a: "Chỉ người có link chỉnh sửa, ở tab Phản hồi trong Studio. Khách không thấy câu trả lời của nhau. Riêng lời chúc trong sổ lưu bút thì hiện công khai trên thiệp.",
      },
      {
        q: "Tôi muốn ẩn một lời chúc thì làm thế nào?",
        a: "Vào tab Phản hồi, bấm \"Ẩn\" ở lời chúc đó. Lời chúc biến mất khỏi trang khách; bấm \"Hiện lại\" nếu đổi ý.",
      },
      {
        q: "Vì sao khách thấy thông báo \"gửi quá nhanh\"?",
        a: "Để chống spam, mỗi địa chỉ mạng chỉ được gửi một số lần trong khoảng thời gian ngắn. Khách chờ vài phút rồi gửi lại là được.",
      },
      {
        q: "Khách có thể xác nhận tham dự sau hạn trả lời không?",
        a: "Hạn trả lời hiện để khách biết thời điểm mong nhận phản hồi. Hai bạn vẫn nhận được câu trả lời gửi trễ.",
      },
    ],
  },
  {
    id: "chia-se",
    title: "Gửi thiệp cho khách",
    items: [
      {
        q: "Cách gửi thiệp cưới qua Zalo cho nhiều khách?",
        a: "Sau khi xuất bản, thêm từng hộ vào tab Khách mời trong Studio rồi sao chép link riêng của từng hộ. Mỗi link mở ra đều chào đúng tên hộ đó. Gửi link qua Zalo, Messenger hoặc SMS như tin nhắn bình thường.",
      },
      {
        q: "Thiệp cưới online có miễn phí thật không?",
        a: "Có. Hiện tại MỘC miễn phí toàn bộ: tạo thiệp, chọn mẫu, ảnh nhạc, xác nhận tham dự, sổ lưu bút và mã QR mừng cưới. Bạn không cần nhập thẻ hay đăng ký gói nào.",
      },
      {
        q: "Khách không mở được link thiệp thì làm sao?",
        a: "Hầu hết do link bị cắt khi sao chép: hãy gửi lại nguyên đường link. Thiệp chạy trên mọi trình duyệt điện thoại đời mới, không cần cài app. Nếu vẫn không được, thử mở bằng trình duyệt khác.",
      },
      {
        q: "Tôi muốn đổi ngày cưới sau khi đã gửi thiệp?",
        a: "Mở link chỉnh sửa, sửa ngày ở phần Lịch trình rồi lưu. Thiệp cập nhật ngay, khách mở lại link cũ sẽ thấy ngày mới — không cần gửi lại link.",
      },
      {
        q: "Có in thiệp MỘC ra giấy được không?",
        a: "MỘC làm thiệp online để gửi qua link. Nếu muốn bản giấy, bạn có thể chụp màn hình thiệp hoặc dùng công cụ tạo mã QR để in mã lên thiệp giấy, khách quét là tới thiệp online.",
      },
      {
        q: "Một thiệp dùng cho cả nhà trai và nhà gái được không?",
        a: "Được nếu hai họ chung ngày giờ, địa điểm. Thiệp có phần Hai họ để ghi tên cha mẹ hai bên. Nếu lễ và tiệc khác ngày giờ, bạn nên tạo hai thiệp riêng cho rõ.",
      },
    ],
  },
  {
    id: "rieng-tu",
    title: "Quyền riêng tư và dữ liệu",
    items: [
      {
        q: "MỘC lưu những dữ liệu nào?",
        a: "Nội dung thiệp hai bạn nhập, ảnh và nhạc bạn tải lên, câu trả lời và lời chúc của khách, cùng bản băm của khoá chỉnh sửa. Xem chi tiết ở trang Quyền riêng tư.",
      },
      {
        q: "Studio có nút xoá thiệp không?",
        a: "Hiện chưa có. Bạn có thể gỡ xuất bản để ngừng chia sẻ. Nếu muốn xoá hẳn dữ liệu, xem trang Quyền riêng tư để biết cách gửi yêu cầu.",
      },
      {
        q: "Mã QR mừng cưới có dùng dịch vụ bên ngoài không?",
        a: "Có. Hình mã QR do dịch vụ VietQR tạo từ ngân hàng, số tài khoản và tên chủ tài khoản bạn nhập, còn bản đồ xem trước là bản đồ nhúng của Google Maps.",
      },
    ],
  },
];

export const allHelpItems = (): Faq[] => helpGroups.flatMap((g) => g.items);
