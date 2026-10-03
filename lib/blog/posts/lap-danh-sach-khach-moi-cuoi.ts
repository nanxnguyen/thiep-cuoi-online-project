import type { Post } from "../types.ts";

export const post: Post = {
  slug: "lap-danh-sach-khach-moi-cuoi",
  title: "Lập danh sách khách mời đám cưới: cách làm gọn, không sót, không trùng",
  metaTitle: "Lập danh sách khách mời đám cưới không sót",
  description: "Cách lập danh sách khách mời đám cưới theo hộ và theo nhóm, những cột nên có, cách rà soát với hai bên gia đình và xuất file CSV để dùng tiếp.",
  category: "Chuẩn bị",
  cover: { src: "/photos/hoa-hong-phan.jpg", w: 500, h: 750, alt: "Cô dâu váy trắng và chú rể vest trắng đứng giữa những cành hoa hồng phấn", focus: "50% 30%" },
  keyword: "danh sách khách mời đám cưới",
  date: "2026-10-04",
  updated: "2026-10-04",
  excerpt: "Danh sách khách mời là nền của mọi việc sau đó: số bàn, thiệp, ngân sách. Làm theo hộ, chia nhóm và rà soát ba vòng sẽ đỡ sót, đỡ trùng và đỡ cãi nhau.",
  related: ["checklist-chuan-bi-dam-cuoi", "gui-thiep-cuoi-truoc-bao-lau", "cach-viet-loi-moi-cuoi"],
  blocks: [
    {
      t: "p",
      text: "Danh sách khách mời nghe có vẻ chỉ là việc ghi tên, nhưng nó quyết định số bàn, số thiệp, ngân sách tiệc và thậm chí không khí ngày cưới. Nó cũng là chuyện dễ nảy sinh bất đồng nhất giữa hai bên gia đình, vì mỗi bên đều có những mối quan hệ riêng muốn mời.",
    },
    {
      t: "p",
      text: "Làm có hệ thống ngay từ đầu giúp bạn tránh hai thứ phiền nhất: bỏ sót người quan trọng và mời trùng một hộ qua hai đầu mối. Dưới đây là cách làm gọn mà ai cũng dùng được.",
    },
    { t: "h2", text: "Lập danh sách theo hộ, không theo từng người" },
    {
      t: "p",
      text: "Đây là thay đổi nhỏ nhưng tiết kiệm nhiều công nhất. Một thiệp thường mời cả một gia đình hoặc một cặp đôi, vì vậy hãy ghi mỗi hộ thành một dòng, kèm số người dự kiến đi cùng. Việc này giúp bạn ước số bàn dễ hơn, gửi đúng một thiệp cho một hộ và tránh viết tên từng người vào bảng.",
    },
    {
      t: "p",
      text: "Cách ghi tên hộ cũng nên nhất quán. Ví dụ “Gia đình anh Minh”, “Chị Lan và gia đình”. Với thiệp online, tên hộ này sẽ hiện trên phong bì khi khách mở link riêng của họ, nên hãy ghi cách xưng hô bạn muốn khách đọc thấy.",
    },
    { t: "h2", text: "Những cột nên có trong danh sách" },
    {
      t: "ul",
      items: [
        "Tên hộ: cách bạn muốn gọi hộ đó trên thiệp.",
        "Nhóm: nhà trai, nhà gái, bạn bè, đồng nghiệp, họ hàng, hàng xóm.",
        "Số người dự kiến đi cùng.",
        "Số điện thoại hoặc Zalo, để gửi link và nhắc nhở.",
        "Số bàn, điền sau khi đã chốt chỗ ngồi.",
        "Ghi chú: ăn chay, người lớn tuổi cần chỗ gần cửa, trẻ nhỏ cần ghế, cần liên hệ qua ai.",
      ],
    },
    {
      t: "p",
      text: "Vừa đủ bấy nhiêu thôi. Thêm quá nhiều cột khiến việc cập nhật trở thành gánh nặng và cuối cùng không ai điền nữa. Tất cả các cột trên đều có trong [công cụ lập danh sách khách](/cong-cu/danh-sach-khach) miễn phí, gồm hộ, nhóm, số bàn, điện thoại, số người dự kiến và ghi chú.",
    },
    {
      t: "img",
      image: { src: "/photos/hy-phuc-do.jpg", w: 683, h: 1024, alt: "Cặp đôi mặc hỷ phục đỏ chụp trước phông đỏ", focus: "50% 33%" },
      caption: "Một danh sách rõ ràng giúp cả hai bên gia đình cùng nhìn về một con số.",
    },
    { t: "h2", text: "Chia nhóm và đặt hạn mức cho hai bên" },
    {
      t: "p",
      text: "Cách tránh tranh cãi hiệu quả nhất là thống nhất hạn mức từ đầu: nhà trai khoảng bao nhiêu khách, nhà gái khoảng bao nhiêu, và bao nhiêu chỗ dành cho bạn bè chung của hai bạn. Khi đã có con số, mỗi bên tự cân đối bên trong hạn mức của mình, thay vì cả hai cùng đặt ra danh sách rồi cắt bớt về sau.",
    },
    {
      t: "tip",
      title: "Chia danh sách thành hai nhóm ưu tiên",
      text: "Đánh dấu mỗi hộ là “chắc chắn mời” hoặc “mời nếu còn chỗ”. Khi số xác nhận về thấp hơn dự kiến, bạn có sẵn nhóm thứ hai để mời thêm mà không phải nghĩ lại từ đầu.",
    },
    { t: "h2", text: "Rà soát ba vòng trước khi gửi thiệp" },
    {
      t: "ol",
      items: [
        "Vòng một, tự soát: hai bạn đọc từ đầu đến cuối, tìm người bỏ sót và các hộ bị ghi trùng.",
        "Vòng hai, với hai bên gia đình: để bố mẹ mỗi bên xem phần của mình, vì người lớn thường nhớ những mối quan hệ mà bạn không nghĩ tới.",
        "Vòng ba, kiểm tra thông tin liên lạc: số điện thoại có đúng không, có ai đổi số hay chuyển nơi ở không.",
      ],
    },
    {
      t: "p",
      text: "Đừng bỏ vòng ba. Nhiều thiệp đến muộn hoặc không đến chỉ vì một con số điện thoại sai một chữ số.",
    },
    { t: "h2", text: "Xử lý các tình huống khó" },
    {
      t: "ul",
      items: [
        "Người bạn muốn mời nhưng sợ gia đình không đồng ý: nói chuyện sớm, vì sát ngày rất khó xử.",
        "Mời một người trong nhóm nhưng không mời cả nhóm: chuẩn bị sẵn một lý do ngắn gọn, thật lòng và không so sánh.",
        "Khách tự ý mang thêm người: ghi rõ số người trên thiệp ngay từ đầu, và để trống thêm một vài chỗ dự phòng.",
        "Khách trả lời muộn hoặc đổi ý sát ngày: luôn có ghi chú về nhóm mời thêm để thay vào.",
      ],
    },
    { t: "h2", text: "Dùng danh sách vào các việc sau" },
    {
      t: "p",
      text: "Một danh sách tốt không chỉ để ghi nhớ. Nó có thể xuất ra file CSV để lưu hoặc mở bằng bảng tính. Khi đã làm thiệp online, bạn có thể nhập danh sách đó vào tab Khách mời trong Studio. Mỗi hộ có một link riêng, khi khách mở link, phong bì ghi đúng tên họ.",
    },
    {
      t: "p",
      text: "Từ danh sách, bạn cũng biết nên gửi thiệp cho nhóm nào trước, theo gợi ý trong bài [gửi thiệp cưới trước bao lâu](/blog/gui-thiep-cuoi-truoc-bao-lau). Và để có lời nhắn hợp với từng nhóm, xem bài [cách viết lời mời cưới](/blog/cach-viet-loi-moi-cuoi).",
    },
    {
      t: "link",
      href: "/cong-cu/danh-sach-khach",
      label: "Công cụ miễn phí",
      text: "Lập danh sách khách theo hộ hoặc nhóm và xuất file CSV, không cần đăng nhập.",
    },
  ],
  faq: [
    {
      q: "Nên lập danh sách khách mời theo từng người hay theo hộ?",
      a: "Theo hộ. Mỗi dòng là một gia đình hoặc một cặp, kèm số người đi cùng. Cách này gửi đúng một thiệp cho một hộ, ước số bàn dễ hơn và tránh ghi trùng.",
    },
    {
      q: "Danh sách khách mời nên có những thông tin gì?",
      a: "Tên hộ, nhóm, số người dự kiến, số điện thoại hoặc Zalo, số bàn và ghi chú. Chừng đó là đủ dùng, thêm nhiều cột hơn thường không ai cập nhật.",
    },
    {
      q: "Làm thế nào để tránh mời trùng một người?",
      a: "Ghi theo hộ và rà soát chung với hai bên gia đình ở vòng hai. Khi mỗi hộ chỉ có một dòng và một người phụ trách mời, rất khó bị trùng.",
    },
    {
      q: "Xuất danh sách ra file CSV để làm gì?",
      a: "CSV mở được bằng các bảng tính phổ biến để bạn lưu trữ, in hoặc chia sẻ với người thân. Danh sách cũng có thể được nhập vào sổ khách mời trong Studio khi bạn đã tạo thiệp online.",
    },
  ],
};
