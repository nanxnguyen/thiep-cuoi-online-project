// Feature pages of the marketing site. Pure data: every number below (6 events, 24 photos, 3 questions, 2 gift
// accounts, 2 MB photos, 8 MB music) mirrors lib/content.ts and the backend rules, so change them together.
export type Faq = { q: string; a: string };
export type Feature = {
  slug: string;
  name: string;
  /** One line under the title, also the meta description seed. */
  tagline: string;
  /** Opening paragraph. */
  intro: string;
  /** "Cách hoạt động": short imperative steps. */
  steps: string[];
  /** Two or three things worth knowing. */
  points: { title: string; body: string }[];
  faq: Faq[];
  /** Slugs of other features shown at the bottom. */
  related: string[];
};

export const features: readonly Feature[] = [
  {
    slug: "xac-nhan-tham-du",
    name: "Xác nhận tham dự",
    tagline: "Khách trả lời ngay trên thiệp, hai bạn thấy tổng số người đến.",
    intro:
      "Thay vì nhắn tin hỏi từng người, hai bạn đặt sẵn một biểu mẫu nhỏ ở cuối thiệp. Khách nhập tên, chọn đến hay không, số người đi cùng và để lại lời nhắn. Câu trả lời về thẳng Studio của hai bạn.",
    steps: [
      "Vào Studio, mở tab Tham dự và bật xác nhận tham dự.",
      "Đặt hạn trả lời nếu muốn, thêm tối đa 3 câu hỏi riêng (ví dụ: bạn có cần chỗ đậu xe không?).",
      "Gửi link thiệp. Khách điền biểu mẫu, hai bạn mở tab Phản hồi để xem danh sách và tổng kết.",
    ],
    points: [
      {
        title: "Tổng kết tự động",
        body: "Studio đếm số người sẽ đến, số người không đến và tổng số khách đi cùng, để hai bạn báo nhà hàng đúng con số.",
      },
      {
        title: "Câu hỏi của riêng bạn",
        body: "Mỗi câu hỏi là trả lời ngắn hoặc có/không. Đủ để hỏi về món ăn, chỗ ngồi hay chuyện đưa đón mà không biến biểu mẫu thành bài khảo sát.",
      },
      {
        title: "Chống làm phiền",
        body: "Biểu mẫu có ô ẩn để chặn robot và giới hạn số lần gửi liên tiếp từ một địa chỉ, nên hộp thư của hai bạn không bị rác.",
      },
    ],
    faq: [
      { q: "Khách có cần đăng nhập để trả lời không?", a: "Không. Khách chỉ cần mở link thiệp, điền tên và bấm gửi." },
      { q: "Tôi tắt xác nhận tham dự được không?", a: "Được. Tắt ở tab Tham dự, biểu mẫu sẽ biến mất khỏi thiệp ngay, những câu trả lời đã nhận vẫn còn trong tab Phản hồi." },
    ],
    related: ["so-luu-but", "phong-bi-loi-moi", "dem-nguoc-lich"],
  },
  {
    slug: "so-luu-but",
    name: "Sổ lưu bút",
    tagline: "Lời chúc của bạn bè hiện ngay dưới thiệp, hai bạn giữ quyền ẩn.",
    intro:
      "Một trang thiệp giấy không có chỗ cho lời chúc. Thiệp online thì có: khách viết vài dòng, lời chúc xuất hiện ngay trong sổ lưu bút để những người đến sau cùng đọc.",
    steps: [
      "Mở tab Tham dự và bật sổ lưu bút.",
      "Khách nhập tên và lời chúc (tối đa 500 ký tự) rồi gửi.",
      "Hai bạn vào tab Phản hồi để đọc và ẩn bất kỳ lời chúc nào không muốn hiển thị.",
    ],
    points: [
      { title: "Hiện ngay, không cần duyệt trước", body: "Lời chúc lên thiệp lập tức, để không khí lễ cưới được giữ nguyên. Nếu có điều không phù hợp, hai bạn ẩn đi bằng một cú bấm." },
      { title: "Ẩn là biến mất thật sự", body: "Lời chúc bị ẩn không còn xuất hiện trên trang khách, kể cả khi họ tải lại." },
      { title: "Lưu giữ được", body: "Những lời chúc vẫn nằm trong tab Phản hồi để hai bạn đọc lại sau đám cưới." },
    ],
    faq: [
      { q: "Ai cũng viết lời chúc được sao?", a: "Ai có link thiệp đều viết được. Biểu mẫu có giới hạn số lần gửi để tránh bị spam." },
      { q: "Tôi có xoá hẳn một lời chúc được không?", a: "Hiện hai bạn có thể ẩn lời chúc khỏi trang khách. Ẩn có thể bật lại bất cứ lúc nào." },
    ],
    related: ["xac-nhan-tham-du", "mung-cuoi-qr", "album-anh"],
  },
  {
    slug: "mung-cuoi-qr",
    name: "Mừng cưới bằng QR",
    tagline: "Mã VietQR cho chú rể và cô dâu, khách quét là chuyển khoản.",
    intro:
      "Không phải ai cũng đến được, và không phải ai đến cũng mang phong bì. Hộp mừng cưới trên thiệp cho khách quét mã chuyển khoản bằng app ngân hàng, đúng tài khoản, không phải gõ số.",
    steps: [
      "Mở tab Mừng cưới, chọn ngân hàng, nhập số tài khoản và tên chủ tài khoản.",
      "Thêm tài khoản thứ hai nếu chú rể và cô dâu nhận riêng (tối đa 2 tài khoản).",
      "Thiệp tự sinh mã VietQR. Khách quét mã, hoặc bấm chép số tài khoản.",
    ],
    points: [
      { title: "Chuẩn VietQR", body: "Danh sách ngân hàng phổ biến có sẵn, mã tạo theo chuẩn VietQR nên hầu hết app ngân hàng trong nước đọc được." },
      { title: "Tên hiện rõ", body: "Khách thấy tên chủ tài khoản ngay cạnh mã, yên tâm chuyển đúng người." },
      { title: "Không thu phí, không giữ tiền", body: "Tiền đi thẳng từ khách sang tài khoản của hai bạn. MỘC không đứng giữa và không chạm vào giao dịch." },
    ],
    faq: [
      { q: "MỘC có lấy phí giao dịch không?", a: "Không. Giao dịch diễn ra giữa khách và ngân hàng của hai bạn, MỘC chỉ hiển thị mã." },
      { q: "Tôi chỉ muốn hiện một tài khoản được không?", a: "Được. Chỉ điền một tài khoản, phần còn lại sẽ không xuất hiện." },
      { q: "Mã QR có dùng dịch vụ ngoài không?", a: "Có. Hình mã QR do dịch vụ VietQR (img.vietqr.io) tạo ra từ ngân hàng, số tài khoản và tên bạn nhập." },
    ],
    related: ["so-luu-but", "phong-bi-loi-moi", "xac-nhan-tham-du"],
  },
  {
    slug: "ban-do-chi-duong",
    name: "Bản đồ và chỉ đường",
    tagline: "Mỗi buổi tiệc một địa chỉ, một nút chỉ đường bằng Google Maps.",
    intro:
      "Đám cưới có thể có ba địa điểm: nhà gái, nhà trai, nhà hàng. Mỗi sự kiện trên thiệp có địa chỉ riêng, nút chỉ đường và bản đồ xem trước, để khách khỏi phải hỏi lại.",
    steps: [
      "Mở tab Sự kiện, thêm sự kiện (tối đa 6) với tên, ngày giờ, nơi tổ chức và địa chỉ.",
      "Dán link Google Maps của địa điểm nếu muốn khách đến đúng cổng.",
      "Khách bấm Chỉ đường để mở Google Maps, hoặc Xem bản đồ để xem ngay trên thiệp.",
    ],
    points: [
      { title: "Ngày âm lịch", body: "Mỗi sự kiện có ô ngày âm lịch để hai bạn ghi theo tập quán gia đình, hiện ngay dưới ngày dương." },
      { title: "Không cần link vẫn chỉ đường được", body: "Nếu chưa có link, thiệp dựng đường dẫn Google Maps từ tên nơi tổ chức và địa chỉ bạn đã nhập." },
      { title: "Nhiều buổi, một danh sách", body: "Lễ vu quy, lễ thành hôn, tiệc cưới: mỗi buổi là một thẻ riêng, có giờ, địa chỉ và nút chỉ đường." },
    ],
    faq: [
      { q: "Nút Chỉ đường và bản đồ xem trước dùng link nào?", a: "Nút Chỉ đường ưu tiên link Google Maps hai bạn dán; nếu không có, thiệp dựng đường dẫn từ nơi tổ chức và địa chỉ. Bản đồ xem trước luôn dựng từ địa chỉ." },
      { q: "Tôi có thể có hơn 6 sự kiện không?", a: "Hiện mỗi thiệp có tối đa 6 sự kiện, đủ cho các nghi lễ cưới thông thường." },
    ],
    related: ["dem-nguoc-lich", "phong-bi-loi-moi", "xac-nhan-tham-du"],
  },
  {
    slug: "dem-nguoc-lich",
    name: "Đếm ngược và thêm vào lịch",
    tagline: "Khách thấy còn bao lâu nữa và lưu ngày cưới vào lịch chỉ một chạm.",
    intro:
      "Một thiệp gửi từ hai tháng trước rất dễ bị quên. Đồng hồ đếm ngược nhắc khách còn bao nhiêu ngày, giờ, phút, giây, và nút thêm vào lịch giữ chỗ trong điện thoại của họ.",
    steps: [
      "Nhập ngày giờ cho các sự kiện ở tab Sự kiện. Đồng hồ đếm về sự kiện tiếp theo chưa diễn ra.",
      "Khách bấm Thêm vào Google Calendar, hoặc Tải lịch (.ics) để dùng với Apple Calendar, Outlook.",
      "Sự kiện vào lịch kèm tên, giờ và địa chỉ.",
    ],
    points: [
      { title: "Theo giờ Việt Nam", body: "Ngày giờ trên thiệp luôn hiểu theo múi giờ Việt Nam (UTC+7), nên đồng hồ không lệch dù khách mở thiệp ở đâu." },
      { title: "Tệp lịch chuẩn", body: "Tệp .ics là định dạng lịch phổ biến, mở được trên hầu hết ứng dụng lịch." },
    ],
    faq: [
      { q: "Đồng hồ đếm ngược về sự kiện nào?", a: "Về sự kiện gần nhất chưa bắt đầu trong danh sách của hai bạn." },
      { q: "Sau ngày cưới thì sao?", a: "Khi mọi sự kiện đã qua, mục đếm ngược tự ẩn khỏi thiệp thay vì hiện số sai." },
    ],
    related: ["ban-do-chi-duong", "xac-nhan-tham-du", "album-anh"],
  },
  {
    slug: "album-anh",
    name: "Album ảnh",
    tagline: "Tới 24 ảnh, xem toàn màn hình, phóng to, lướt bằng bàn phím.",
    intro:
      "Ảnh cưới là phần khách xem lâu nhất. Album trên thiệp cho tối đa 24 ảnh, bấm vào là mở khung xem lớn, phóng to được, có đếm số ảnh và lướt tiếp bằng vuốt hoặc phím mũi tên.",
    steps: [
      "Mở tab Ảnh và nhạc, chọn ảnh bìa và các ảnh album. Kéo thả ảnh vào khung hoặc bấm để chọn ảnh.",
      "Trình duyệt tự thu nhỏ và nén từng ảnh (cạnh dài tối đa 1600 px, dưới 2 MB) trước khi tải lên.",
      "Sắp lại thứ tự, xoá ảnh không ưng. Thiệp cập nhật ngay trong khung xem trước.",
    ],
    points: [
      { title: "Nhẹ mà vẫn nét", body: "Ảnh được nén ngay trên máy của hai bạn, nên tải lên nhanh và trang thiệp mở nhanh trên mạng di động." },
      { title: "Xem trọn khung", body: "Khung xem ảnh hỗ trợ phóng to, phím mũi tên, phím Esc để đóng và trả lại vị trí đang xem." },
      { title: "Ảnh bìa riêng", body: "Ảnh bìa hiện ở đầu thiệp, còn cover không có ảnh vẫn đẹp nhờ hoạ tiết riêng của từng mẫu." },
    ],
    faq: [
      { q: "Ảnh của tôi có bị công khai không?", a: "Ảnh chỉ hiện trên thiệp của hai bạn. Trang thiệp không được đưa vào công cụ tìm kiếm, nhưng ai có link đều xem được." },
      { q: "Tôi có thể tải ảnh lớn hơn 2 MB không?", a: "Có. Ảnh gốc lớn được thu nhỏ trên trình duyệt trước khi tải, hai bạn không phải tự chỉnh." },
    ],
    related: ["nhac-nen", "so-luu-but", "phong-bi-loi-moi"],
  },
  {
    slug: "nhac-nen",
    name: "Nhạc nền",
    tagline: "Một bản nhạc riêng khi khách mở thiệp, bật tắt bằng một nút.",
    intro:
      "Thiệp mở ra với bài hát của hai bạn sẽ khác hẳn. Nhạc nền phát khi khách mở phong bì, có nút nổi để tắt hoặc bật lại bất cứ lúc nào.",
    steps: [
      "Mở tab Ảnh và nhạc, chọn file mp3 (tối đa 8 MB) và đặt tên bài.",
      "Xem thử trong khung xem trước.",
      "Khách chạm vào phong bì là nhạc bắt đầu; nút nhạc nổi cho phép tắt/bật.",
    ],
    points: [
      { title: "Không tự phát bất ngờ", body: "Trình duyệt chỉ cho phát nhạc sau khi người xem chạm vào trang, nên nhạc bắt đầu đúng lúc khách mở phong bì, không giật mình trước đó." },
      { title: "Bản quyền là của hai bạn", body: "Hãy dùng bản nhạc hai bạn có quyền sử dụng. MỘC không cung cấp kho nhạc." },
    ],
    faq: [
      { q: "Có dùng link nhạc từ YouTube được không?", a: "Không. Thiệp chỉ nhận file mp3 tải lên trực tiếp để phát ổn định trên mọi trình duyệt." },
      { q: "Tôi không muốn có nhạc thì sao?", a: "Bỏ trống phần nhạc, thiệp sẽ không có nút nhạc." },
    ],
    related: ["album-anh", "phong-bi-loi-moi", "dem-nguoc-lich"],
  },
  {
    slug: "phong-bi-loi-moi",
    name: "Phong bì và lời mời riêng",
    tagline: "Mỗi khách nhận một phong bì ghi đúng tên của họ.",
    intro:
      "Thiệp giấy có tên người nhận viết tay. Thiệp online cũng thế: thêm ?to=Tên vào cuối link, khách sẽ thấy phong bì ghi tên mình rồi chạm để mở.",
    steps: [
      "Sau khi xuất bản, chép link thiệp của hai bạn.",
      "Thêm ?to= và tên người nhận, ví dụ: ...?to=Chú Ba. Tên có dấu và khoảng trắng đều dùng được.",
      "Gửi qua Zalo, Messenger hay tin nhắn. Người nhận thấy phong bì mang tên họ.",
    ],
    points: [
      { title: "Không có tên vẫn đẹp", body: "Nếu link không có ?to=, phong bì ghi Quý khách." },
      { title: "Phong bì hợp từng mẫu", body: "Mỗi mẫu có phong bì riêng: nâu tối cho Gallery Noir, đỏ son vàng ánh cho Lụa Son, hồng phấn cho Sơ Xuân, mực đen với con dấu son cho Thủy Mặc." },
      { title: "Chào khách, điền sẵn tên", body: "Tên trong link dùng để ghi lên phong bì và điền sẵn vào ô tên khi khách trả lời. MỘC không ghi lại lượt mở link; tên chỉ được lưu khi khách gửi xác nhận tham dự." },
    ],
    faq: [
      { q: "Có công cụ tạo link hàng loạt không?", a: "Hiện hai bạn tự thêm ?to= cho từng người. Quản lý danh sách khách và tạo link hàng loạt nằm trong kế hoạch tiếp theo." },
      { q: "Khách mở lại thiệp có thấy phong bì nữa không?", a: "Có. Mỗi lần mở link mới, phong bì hiện lại để chào." },
    ],
    related: ["xac-nhan-tham-du", "nhac-nen", "album-anh"],
  },
];

export const getFeature = (slug: string): Feature | undefined => features.find((f) => f.slug === slug);

// Meta description: the tagline plus the first sentence of the intro, cut at a word boundary to fit a search result.
export function featureDescription(f: Feature): string {
  const first = f.intro.split(/(?<=[.!?])\s/)[0];
  const text = `${f.tagline} ${first}`;
  return text.length <= 160 ? text : `${text.slice(0, 157).replace(/\s+\S*$/, "")}…`;
}
