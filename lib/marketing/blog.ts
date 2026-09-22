// Blog posts as plain data (no MDX dependency). Practical, original advice for couples planning an online invitation.
export type Block =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string };

export type Post = {
  slug: string;
  title: string;
  description: string;
  /** ISO date, also the sitemap lastModified. */
  date: string;
  readMinutes: number;
  category: string;
  blocks: Block[];
  /** Feature slugs (lib/marketing/features.ts) the post links to at the end. */
  related: string[];
};

export const posts: readonly Post[] = [
  {
    slug: "loi-moi-cuoi-hay-cho-thiep-online",
    title: "10 mẫu lời mời cưới cho thiệp online, từ trang trọng đến gần gũi",
    description: "Cách viết lời mời cưới ngắn, ấm và đủ thông tin, kèm mười câu mẫu để hai bạn chỉnh lại theo giọng của mình.",
    date: "2026-09-21",
    readMinutes: 5,
    category: "Nội dung thiệp",
    blocks: [
      { type: "p", text: "Lời mời là dòng chữ khách đọc đầu tiên và nhớ lâu nhất. Trên thiệp online, chỗ dành cho nó nhỏ hơn thiệp giấy, nên mỗi câu đều phải làm việc: nói được ai mời ai, vì dịp gì, và khiến người đọc muốn đến." },
      { type: "h2", text: "Ba nguyên tắc trước khi viết" },
      { type: "ul", items: [
        "Ngắn hơn bạn nghĩ. Hai đến bốn câu là đủ; thông tin ngày giờ và địa điểm đã có ở các phần riêng của thiệp.",
        "Xưng hô đúng người nhận. Thiệp gửi cho ông bà, cô bác cần giọng khác với thiệp gửi bạn bè đồng trang lứa. Nếu cần hai giọng, hãy chọn giọng phù hợp với nhóm khách đông nhất.",
        "Nói thật. Một câu giản dị nhưng thật lòng luôn hơn một câu vay mượn nghe rất kêu.",
      ] },
      { type: "h2", text: "Mười câu mẫu" },
      { type: "p", text: "Trang trọng, hợp với thiệp gửi họ hàng và khách lớn tuổi:" },
      { type: "ol", items: [
        "Trân trọng kính mời quý khách đến chung vui và chứng kiến lễ thành hôn của chúng con.",
        "Chúng con hân hạnh được đón tiếp quý khách trong ngày trọng đại của hai gia đình.",
        "Sự hiện diện của quý khách là niềm vinh dự và là lời chúc phúc quý giá nhất đối với chúng con.",
      ] },
      { type: "p", text: "Ấm áp, hợp với thiệp gửi cô dì chú bác và người thân:" },
      { type: "ol", items: [
        "Hai đứa con sắp về chung một nhà. Mời cô chú đến dự và chúc phúc cho tụi con.",
        "Ngày vui của tụi con sẽ trọn vẹn hơn khi có gia đình mình ở đó.",
      ] },
      { type: "p", text: "Gần gũi, hợp với thiệp gửi bạn bè và đồng nghiệp:" },
      { type: "ol", items: [
        "Sau ngần ấy năm, tụi mình quyết định về chung một nhà. Bạn đến uống với tụi mình một ly nhé.",
        "Có một buổi tiệc mà tụi mình rất muốn bạn có mặt. Chi tiết ở ngay bên dưới.",
        "Thiếu bạn là thiếu cả một góc của ngày cưới. Hẹn gặp bạn nhé!",
      ] },
      { type: "p", text: "Nhẹ nhàng, có chút hài hước:" },
      { type: "ol", items: [
        "Đã chọn được người để cãi nhau cả đời. Mời bạn đến xem tụi mình cười trước.",
        "Bánh cưới rất ngon, nhạc rất hay, cô dâu chú rể rất hồi hộp. Bạn đến nhé!",
      ] },
      { type: "h2", text: "Những điều nên tránh" },
      { type: "ul", items: [
        "Trộn nhiều giọng trong cùng một đoạn: đang trang trọng lại chuyển sang đùa.",
        "Nhắc lại giờ giấc và địa điểm trong lời mời, vì phần Sự kiện của thiệp đã có, dễ sai lệch khi hai bạn đổi giờ.",
        "Câu quá dài. Trên điện thoại, đoạn dài hơn năm dòng thường bị lướt qua.",
      ] },
      { type: "quote", text: "Đọc to lời mời lên một lần. Chỗ nào bạn vấp là chỗ khách cũng sẽ vấp." },
      { type: "p", text: "Khi đã có câu ưng ý, hãy dán vào ô Lời mời ở tab Cặp đôi. Khung xem trước bên cạnh cho bạn thấy ngay câu chữ nằm ra sao trên từng mẫu thiệp." },
    ],
    related: ["phong-bi-loi-moi", "xac-nhan-tham-du"],
  },
  {
    slug: "khi-nao-nen-gui-thiep-cuoi-online",
    title: "Nên gửi thiệp cưới online khi nào? Lịch gửi từ 8 tuần trước đến sau lễ",
    description: "Gợi ý thời điểm gửi thiệp, nhắc lịch và cảm ơn để khách sắp xếp được và số người đến đúng như hai bạn tính.",
    date: "2026-09-21",
    readMinutes: 4,
    category: "Kế hoạch",
    blocks: [
      { type: "p", text: "Gửi sớm quá thì khách quên, gửi muộn quá thì khách đã kín lịch. Thiệp online có lợi thế là hai bạn sửa được thông tin sau khi gửi và nhắc lại rất dễ, nên không cần gửi một lần rồi hy vọng." },
      { type: "h2", text: "Lịch gợi ý" },
      { type: "ol", items: [
        "6 đến 8 tuần trước: gửi cho họ hàng và bạn ở xa, những người cần đặt vé, xin nghỉ phép. Lúc này thiệp có thể chưa đủ chi tiết nhà hàng, không sao, hãy cập nhật sau.",
        "4 tuần trước: gửi cho bạn bè, đồng nghiệp và khách ở gần. Đây là lúc bật phần xác nhận tham dự và đặt hạn trả lời khoảng 2 tuần trước lễ.",
        "2 tuần trước: nhắc những người chưa trả lời. Một tin nhắn ngắn kèm lại link là đủ.",
        "1 tuần trước: chốt số lượng với nhà hàng dựa trên tổng kết trong Studio. Gửi lại link cho khách kèm lời nhắc giờ và địa điểm.",
        "Ngày cưới hoặc ngay sau đó: cảm ơn khách. Sổ lưu bút vẫn nằm đó để hai bạn đọc lại.",
      ] },
      { type: "h2", text: "Ba việc nên làm trước khi bấm gửi" },
      { type: "ul", items: [
        "Kiểm tra thiệp trên điện thoại thật, ở chế độ ẩn danh, để thấy đúng những gì khách thấy.",
        "Đặt đường dẫn dễ nhớ và dễ đọc qua điện thoại, vì đường dẫn không đổi được sau lần xuất bản đầu.",
        "Thử gửi link cho một người thân trước, hỏi họ mở có dễ không.",
      ] },
      { type: "h2", text: "Người lớn tuổi thì sao?" },
      { type: "p", text: "Không phải ai cũng quen mở link. Với ông bà, cô bác, một tấm thiệp giấy kèm cuộc điện thoại vẫn là cách lịch sự nhất. Thiệp online bổ sung chứ không thay thế: ai cần chi tiết, bản đồ hay muốn gửi lời chúc thì có sẵn." },
      { type: "p", text: "Nếu muốn khách thấy phong bì ghi đúng tên mình, thêm ?to= và tên vào cuối link trước khi gửi. Mất thêm vài giây cho mỗi người, đổi lại là cảm giác được mời riêng." },
    ],
    related: ["xac-nhan-tham-du", "phong-bi-loi-moi", "dem-nguoc-lich"],
  },
  {
    slug: "mung-cuoi-bang-qr-luu-y",
    title: "Mừng cưới bằng QR: những điều hai bạn nên làm cho gọn và an toàn",
    description: "Cách đặt mã QR mừng cưới trên thiệp online: chọn tài khoản, kiểm tra tên chủ tài khoản và giữ thông tin đúng người nhận.",
    date: "2026-09-21",
    readMinutes: 4,
    category: "Mừng cưới",
    blocks: [
      { type: "p", text: "Nhiều khách ở xa hoặc không tiện đến vẫn muốn gửi lời mừng. Một mã QR trên thiệp giúp họ chuyển khoản trong vài giây, đúng người, không phải nhắn hỏi số tài khoản." },
      { type: "h2", text: "Chọn tài khoản nào?" },
      { type: "ul", items: [
        "Dùng tài khoản của chính chú rể hoặc cô dâu, hoặc của người thân trong gia đình mà hai bạn hoàn toàn tin tưởng.",
        "Nếu hai bên gia đình nhận riêng, thêm hai tài khoản: một cho chú rể, một cho cô dâu. Thiệp hiển thị hai thẻ riêng.",
        "Nên dùng tài khoản có tên chủ tài khoản đúng như đăng ký ngân hàng, để khách thấy tên khớp khi chuyển.",
      ] },
      { type: "h2", text: "Kiểm tra trước khi xuất bản" },
      { type: "ol", items: [
        "Nhập ngân hàng, số tài khoản và tên chủ tài khoản, xem mã QR hiện ra trong khung xem trước.",
        "Tự quét thử bằng app ngân hàng của bạn: tên người nhận và số tài khoản phải đúng.",
        "Nhờ một người thân quét thử bằng ngân hàng khác để chắc chắn mã đọc được.",
      ] },
      { type: "h2", text: "Về an toàn" },
      { type: "p", text: "Số tài khoản ngân hàng là thông tin cá nhân. Thiệp của MỘC không được đưa lên công cụ tìm kiếm, nhưng ai có link đều xem được, nên hãy chỉ gửi link cho những người hai bạn muốn mời. Đừng đăng link thiệp lên mạng xã hội công khai nếu trên đó có mã mừng cưới." },
      { type: "p", text: "MỘC chỉ hiển thị mã và không nằm giữa giao dịch: tiền chuyển thẳng từ khách sang tài khoản của hai bạn, không đi qua MỘC và MỘC không thu phí." },
      { type: "h2", text: "Một lời nhắn nhỏ" },
      { type: "p", text: "Mừng cưới là tấm lòng, không phải nghĩa vụ. Hai bạn có thể đặt hộp mừng cưới ở cuối thiệp, sau phần sổ lưu bút, để khách đến với niềm vui trước rồi mới tới chuyện mừng." },
    ],
    related: ["mung-cuoi-qr", "so-luu-but"],
  },
  {
    slug: "chon-anh-cho-album-thiep-cuoi",
    title: "Chọn ảnh cho album thiệp cưới online: bao nhiêu ảnh, xếp thế nào",
    description: "Gợi ý số lượng, thứ tự và cách chọn ảnh để album trên thiệp online nhìn gọn, mở nhanh và kể được câu chuyện của hai bạn.",
    date: "2026-09-21",
    readMinutes: 4,
    category: "Ảnh và album",
    blocks: [
      { type: "p", text: "Thiệp của MỘC cho phép một ảnh bìa và tối đa 24 ảnh trong album. Có chỗ nhiều không có nghĩa là nên dùng hết. Album vừa phải luôn được xem đến cuối." },
      { type: "h2", text: "Bao nhiêu ảnh là vừa?" },
      { type: "p", text: "Mười hai đến mười tám ảnh là con số dễ chịu: đủ để kể một câu chuyện, chưa đủ để khách thấy mỏi tay. Nếu hai bạn có bộ ảnh cưới dài hơn, hãy để dành một phần cho lời mời tham gia xem tiếp ở nơi khác." },
      { type: "h2", text: "Ảnh bìa và ảnh đầu tiên" },
      { type: "ul", items: [
        "Ảnh bìa nên có bố cục thoáng, chủ thể ở giữa hoặc lệch một chút, vì tên hai bạn và ngày cưới sẽ nằm gần đó.",
        "Ảnh đầu tiên trong album là ảnh được phóng lớn nhất, hãy chọn tấm mạnh nhất về cảm xúc.",
        "Ảnh dọc đứng hợp với màn hình điện thoại. Ảnh ngang nên dùng ít hơn, đặt xen kẽ.",
      ] },
      { type: "h2", text: "Sắp xếp để kể chuyện" },
      { type: "ol", items: [
        "Mở đầu bằng ảnh chung, rõ mặt hai bạn.",
        "Xen vài ảnh khoảnh khắc: nhìn nhau, đi bên nhau, cười.",
        "Thêm một hai ảnh có gia đình hoặc bạn bè nếu hai bên thoải mái.",
        "Kết bằng ảnh nhẹ nhàng, ví dụ nắm tay hoặc bóng lưng.",
      ] },
      { type: "h2", text: "Về dung lượng và quyền riêng tư" },
      { type: "ul", items: [
        "Hai bạn không cần tự thu nhỏ ảnh: Studio nén mỗi ảnh xuống dưới 2 MB và cạnh dài tối đa 1600 px ngay trên máy trước khi tải.",
        "Studio nhận ảnh JPEG, PNG và WebP. Nếu một ảnh HEIC từ iPhone không tải được, hãy xuất sang JPEG rồi tải lại.",
        "Hỏi người có mặt trong ảnh trước khi đưa lên thiệp, nhất là trẻ nhỏ và những người không thích lên hình.",
        "Tránh ảnh có biển số xe, giấy tờ hoặc địa chỉ nhà rõ nét.",
      ] },
      { type: "p", text: "Sau khi tải, hãy mở khung xem trước trên điện thoại và bấm vào từng ảnh để xem cách chúng hiện ở khung xem lớn. Ảnh nào bị cắt mất đầu hoặc chân thì thay bằng ảnh khác." },
    ],
    related: ["album-anh", "nhac-nen"],
  },
  {
    slug: "thiep-cuoi-online-hay-thiep-giay",
    title: "Thiệp cưới online hay thiệp giấy? Cách kết hợp cả hai cho hợp lý",
    description: "So sánh thiệp online và thiệp giấy về chi phí công sức, sự trang trọng và tiện lợi, kèm gợi ý dùng cả hai cho từng nhóm khách.",
    date: "2026-09-21",
    readMinutes: 5,
    category: "Kế hoạch",
    blocks: [
      { type: "p", text: "Câu hỏi thường gặp là chọn thiệp online hay thiệp giấy. Thực tế nhiều đám cưới dùng cả hai: mỗi loại làm tốt một việc khác nhau." },
      { type: "h2", text: "Thiệp online làm tốt điều gì" },
      { type: "ul", items: [
        "Chi tiết luôn đúng: đổi giờ hay địa điểm, khách mở link vẫn thấy bản mới nhất.",
        "Có thứ giấy không có: bản đồ chỉ đường, đếm ngược, thêm vào lịch, album ảnh, nhạc nền.",
        "Thu phản hồi ngay: khách trả lời đến hay không, hai bạn có tổng số người trong Studio.",
        "Gửi cho người ở xa trong vài giây, không tốn công chuyển phát.",
      ] },
      { type: "h2", text: "Thiệp giấy làm tốt điều gì" },
      { type: "ul", items: [
        "Sự trang trọng và tính nghi lễ, nhất là với ông bà, họ hàng lớn tuổi, đối tác quan trọng.",
        "Cầm được, để được, nhiều gia đình giữ thiệp như một kỷ vật.",
        "Không phụ thuộc điện thoại hay đường truyền của người nhận.",
      ] },
      { type: "h2", text: "Cách kết hợp thực tế" },
      { type: "ol", items: [
        "In một số lượng thiệp giấy vừa phải cho người lớn tuổi, gia đình hai bên và khách cần sự trang trọng.",
        "Gửi thiệp online cho bạn bè, đồng nghiệp, khách ở xa và cho cả những người đã nhận thiệp giấy, để họ có bản đồ và lịch.",
        "Trên thiệp giấy, in thêm một mã QR hoặc đường link dẫn tới thiệp online. Khách có thể dùng nó để xem đường đi và trả lời tham dự.",
      ] },
      { type: "h2", text: "Một lưu ý về chi phí" },
      { type: "p", text: "Thiệp giấy tính tiền theo số lượng, thiệp online thì không. Nếu ngân sách hạn chế, hãy in ít thiệp giấy hơn và dành công sức cho thiệp online thật đẹp, rồi gọi điện mời trực tiếp những người thân thiết nhất." },
      { type: "quote", text: "Người đến dự vì tình cảm, không phải vì chất liệu tấm thiệp. Thiệp chỉ cần rõ ràng, ấm áp và dễ dùng." },
    ],
    related: ["phong-bi-loi-moi", "ban-do-chi-duong", "xac-nhan-tham-du"],
  },
];

export const getPost = (slug: string): Post | undefined => posts.find((p) => p.slug === slug);

// Newest first.
export const postsByDate = (): Post[] => [...posts].sort((a, b) => b.date.localeCompare(a.date));

// "21 tháng 9, 2026". Parsed and formatted in UTC so the day never shifts with the server's time zone.
export const formatPostDate = (iso: string): string => new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
