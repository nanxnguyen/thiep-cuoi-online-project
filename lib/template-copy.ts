// Long-form copy for /templates/[id] (SEO: each detail page needs its own words, not just the shared layout).
// Suggestions only (who it suits, which photos work): never a claim about features the template lacks.
import { templates, type Archetype, type Template } from "./templates.ts";

export const archetypeCopy: Record<Archetype, { label: string; text: string }> = {
  traditional: {
    label: "truyền thống",
    text: "Các mẫu truyền thống của MỘC giữ những chi tiết quen thuộc trong đám cưới Việt như chữ Hỷ, sắc đỏ son và vàng kim, cách xưng hô hai họ. Khách lớn tuổi đọc dễ, còn khách trẻ vẫn thấy thiệp gọn gàng khi mở trên điện thoại.",
  },
  classic: {
    label: "cổ điển",
    text: "Nhóm cổ điển dùng khung viền mảnh, chữ có chân và khoảng trắng rộng, hợp tiệc ở nhà hàng, khách sạn hay lễ cưới cần sự trang trọng. Ảnh cưới chụp studio hoặc ảnh áo dài đứng thẳng thường lên đẹp nhất trong các khung này.",
  },
  botanical: {
    label: "vườn hoa",
    text: "Nhóm vườn hoa lấy cảm hứng từ cây lá và hoa vẽ tay, hợp tiệc sân vườn, tiệc ngoài trời hay đám cưới mùa xuân. Ảnh chụp ngoài trời với nền cây xanh, ánh sáng tự nhiên sẽ hoà vào hoạ tiết tốt hơn ảnh nền studio.",
  },
  editorial: {
    label: "hiện đại",
    text: "Nhóm hiện đại mượn ngôn ngữ của tạp chí, áp phích, vé và phim ảnh: chữ lớn, bố cục mạnh, ít hoạ tiết. Hợp cặp đôi muốn tấm thiệp mang cá tính riêng và có sẵn vài tấm ảnh cưới thật ấn tượng để làm điểm nhấn.",
  },
  minimal: {
    label: "tối giản",
    text: "Nhóm tối giản để chữ và khoảng thở làm việc chính, gần như không trang trí. Hợp cặp đôi thích sự tinh tế, tiệc nhỏ thân mật, hoặc khi hai bạn chưa có nhiều ảnh cưới nhưng vẫn muốn tấm thiệp trông chỉn chu.",
  },
  korean: {
    label: "phong cách Hàn",
    text: "Nhóm phong cách Hàn trẻ trung, nhiều màu pastel và chi tiết vui mắt như ảnh polaroid, cờ đuôi nheo hay minh hoạ. Hợp cặp đôi trẻ, tiệc có nhiều bạn bè, và những bộ ảnh cưới chụp tự nhiên, nhiều khoảnh khắc cười đùa.",
  },
};

export const templateFit: Record<string, string> = {
  "song-hy": "Song Hỷ hợp lễ cưới tổ chức tại nhà hoặc nhà hàng có đông họ hàng, nơi chữ Hỷ đỏ vẫn là biểu tượng ai cũng nhận ra. Khung vòm phía dưới đẹp nhất với ảnh đứng của hai bạn, áo dài hoặc váy cưới đều hợp.",
  "net-muc": "Nét Mực không cần ảnh, nên rất hợp khi hai bạn muốn gửi thiệp sớm trước buổi chụp ảnh cưới. Con số ngày cưới cỡ lớn là điểm nhìn đầu tiên, phần còn lại để chữ và khoảng trắng tự kể.",
  "hoa-nhai": "Hoa Nhài dịu dàng, hợp tiệc sân vườn hoặc đám cưới buổi sáng. Ảnh tròn dưới vòm hoa đẹp nhất với ảnh chụp cận hai người, nền sáng và màu áo nhạt.",
  "hoang-gia": "Hoàng Gia hợp tiệc ở khách sạn, sảnh cưới lớn hoặc lễ cưới cần không khí trang trọng. Khung cong viền vàng tôn ảnh chụp studio với váy cưới dài và vest tối màu.",
  "phong-thu": "Phong Thư hợp cặp đôi thích cảm giác gửi một lá thư tay cho từng người khách. Ảnh dán nghiêng trong phong bì đẹp với ảnh chụp tự nhiên, có chút ánh nắng hoặc tông phim.",
  "bia-bao": "Bìa Báo hợp cặp đôi cá tính, thích phong cách tạp chí và có một tấm ảnh cưới đủ mạnh để đứng giữa trang. Ảnh nửa người, nhìn thẳng ống kính sẽ ra chất bìa báo rõ nhất.",
  "hy-su": "Hỷ Sự dành cho lễ thành hôn theo nghi thức truyền thống, khi thông tin lễ và cách xưng hô cần rõ ràng cho khách lớn tuổi. Tông đỏ đậm hoặc lam đều giữ được vẻ trang nghiêm.",
  "vuon-uom": "Vườn Ươm hợp tiệc ngoài trời, sân vườn hay nhà hàng có cây xanh. Vòm cổng hoa đẹp với ảnh chụp ngoài trời, tông ô liu hoặc cam đất cho cảm giác ấm và mộc.",
  "nhung-lam": "Nhung Lam hợp đám cưới thích sự cổ điển nhưng không muốn dùng sắc đỏ quen thuộc. Khung cong viền vàng trên nền lam hợp với ảnh chụp trong nhà, ánh sáng dịu.",
  "thu-tinh": "Thư Tình hợp cặp đôi có câu chuyện tình dài, muốn tấm thiệp như một lá thư niêm phong gửi người thương. Ảnh chụp thân mật, hai người nhìn nhau, hợp tinh thần của mẫu này.",
  "chan-dung": "Chân Dung dành cho cặp đôi có bộ ảnh cưới đẹp và muốn khoe ngay từ trang bìa. Chọn tấm ảnh dọc rõ mặt, ít chi tiết nền để khung ảnh lớn phát huy hết.",
  "song-phung": "Song Phụng hợp đại lễ gia đình, khi hai họ muốn tấm thiệp trang trọng và đầy đủ ý nghĩa. Chữ Hỷ lớn giữ vai trò chính, ảnh cưới chỉ cần chọn một tấm thật chỉn chu.",
  "bao-hy": "Báo Hỷ hợp khi thiệp cần ghi đủ thông tin lễ của cả nhà trai và nhà gái, giờ đón khách và địa điểm từng nơi. Rất tiện gửi cho ông bà, cô chú, những người cần đọc rõ từng dòng.",
  "doi-khung": "Đôi Khung hợp cặp đôi trẻ, có ảnh riêng của cô dâu và chú rể để đặt vào hai khung polaroid so le. Ảnh chụp tự nhiên, cười tươi, sẽ hợp tinh thần trẻ trung của mẫu.",
  "song-cua": "Song Cửa hợp lễ cưới trang trọng ở nhà hàng hoặc tư gia có không gian cổ. Khung vòm viền vàng trên nền đậm tôn ảnh chụp áo dài, áo tấc hoặc ảnh studio nền tối.",
  "tem-thu": "Tem Thư hợp cặp đôi yêu xa hoặc thích sưu tầm bưu thiếp, muốn tấm thiệp như một lá thư có tem và dấu bưu điện. Ảnh du lịch của hai người là lựa chọn rất hợp.",
  "ve-hanh-phuc": "Vé Hạnh Phúc hợp cặp đôi thích sự độc lạ, nhất là khi hai bạn ở hai thành phố khác nhau: ga đi là quê chú rể, ga đến là quê cô dâu. Ảnh chụp ở nhà ga hoặc trên đường đi rất ăn ý.",
  "dia-than": "Đĩa Than dành cho cặp đôi mê nhạc, có thể biến lịch trình ngày cưới thành tracklist. Ghép với một bài nhạc nền hai bạn yêu thích để trọn vẹn tinh thần của mẫu.",
  "cuon-phim": "Cuộn Phim hợp cặp đôi mê điện ảnh hoặc có bộ ảnh cưới chụp máy film. Dải phim và dấu ngày kiểu máy ảnh cũ đẹp nhất với ảnh tông ấm, hơi nhiễu hạt.",
  "lich-bloc": "Lịch Bloc hợp gia đình coi trọng ngày lành tháng tốt, muốn ngày cưới hiện ra như một tờ lịch xé. Khách lớn tuổi nhìn là nhận ra ngay, rất hợp để gửi họ hàng.",
  "muc-loang": "Mực Loang hợp cặp đôi yêu nét thủy mặc Á Đông, tiệc trang nhã với tông trắng đen hoặc xanh ngọc. Ảnh cưới trong vòng cọ đẹp nhất với ảnh chụp áo dài, nền đơn giản.",
  "phung-vu": "Phụng Vũ hợp lễ cưới trang trọng, đông khách, khi hai họ muốn không khí sum vầy và uy nghi. Đôi cánh phụng mở ra ảnh cưới, nên chọn tấm ảnh chính diện của cả hai.",
  "lien-hoa": "Liên Hoa hợp gia đình yêu sự thanh tịnh, đám cưới nhẹ nhàng, không cầu kỳ. Hoa sen nét mảnh trên cuộn giấy hợp ảnh áo dài màu nhạt và tông xanh, hồng hoặc nâu.",
  "lam-su": "Lam Sứ hợp cặp đôi thích vẻ tinh xảo của gốm men lam, tiệc trang nhã với tông trắng và xanh. Ảnh cưới sáng, nền trơn sẽ nổi bật trong khung men lam.",
  "to-hong": "Tơ Hồng hợp cặp đôi tin vào duyên số, muốn dải lụa đỏ nối tên hai người và ngày cưới. Ảnh chụp tay trong tay hoặc có chi tiết dây đỏ sẽ rất hợp chủ đề.",
  "vuon-kinh": "Vườn Kính hợp tiệc sân vườn hoặc nhà hàng có nhà kính, nhiều cây xanh. Ảnh chụp sau lớp lá, ánh sáng xuyên qua tán cây là lựa chọn ăn ý nhất với khung cửa vòm.",
  "mai-lan": "Mai Lan hợp cặp đôi thích sự tinh tế và tiệc nhỏ, thân mật. Cành lan trắng và khoảng thở rộng giúp thiệp sang mà không cần nhiều ảnh, một tấm ảnh đẹp là đủ.",
  "vuon-ep-hoa": "Vườn Ép Hoa hợp cặp đôi yêu cây cỏ, tiệc ngoài trời hoặc đám cưới mùa xuân. Hoa ép rải như tiêu bản hợp ảnh chụp ngoài thiên nhiên, tông màu ấm.",
  "noi-minh-hen": "Nơi Mình Hẹn hợp khi địa điểm cưới có ý nghĩa riêng, như nơi hai bạn gặp nhau hay một nhà thờ, một khu vườn quen. Minh hoạ line-art địa điểm giúp khách nhớ ngay nơi đến.",
  "da-hoa": "Dạ Hoa hợp tiệc tối, đám cưới mùa đông hoặc cặp đôi thích sự huyền bí của nền tối. Ảnh chụp ánh đèn ấm, nền tối sẽ hiện ra như một ô cửa sổ đêm.",
  "thu-doc": "Thư Dọc hợp cặp đôi thích phong cách bìa tạp chí với tên hai người chạy dọc cỡ lớn. Ảnh dọc, chụp toàn thân hoặc nửa người, giúp bố cục cân đối nhất.",
  "phong-toi": "Phòng Tối hợp cặp đôi mê nhiếp ảnh, có bộ ảnh cưới đen trắng hoặc muốn kể câu chuyện qua nhiều khung hình nhỏ như contact sheet. Dấu son đánh dấu tấm ảnh hai bạn thích nhất.",
  "song-anh": "Song Ảnh hợp khi hai bạn có ảnh chân dung riêng, cùng kiểu chụp, để đặt cạnh nhau. Tên chạy dọc hai bên giúp thiệp hiện đại mà vẫn cân bằng giữa cô dâu và chú rể.",
  "co-hieu": "Cờ Hiệu hợp tiệc vui, đông bạn bè, hoặc khi hai bạn muốn báo tin sớm với dòng Save the date. Ảnh tròn treo trên dải cờ đẹp với ảnh cười tươi, chụp cận mặt.",
  "sac-doi": "Sắc Đôi hợp cặp đôi thích ảnh nghệ thuật, phủ hai tông màu cho cảm giác áp phích. Chọn ảnh có bố cục đơn giản, rõ dáng người để lớp màu lên đẹp nhất.",
  "hoa-chu": "Hoa Chữ hợp cặp đôi muốn tấm thiệp mang dấu ấn riêng qua hai chữ cái đầu tên. Không cần nhiều ảnh, cành hoa line-art mảnh và monogram đã đủ làm điểm nhấn.",
  "bat-giac": "Bát Giác hợp cặp đôi muốn sự sang trọng nhưng hiện đại, tiệc ở khách sạn hoặc không gian tối giản. Khung bát giác viền vàng hợp ảnh chụp studio, nền trơn.",
  "sam-panh": "Sâm Panh hợp tiệc tối sang trọng, có cocktail hay tiệc đứng. Đường line vàng chạy suốt thiệp hợp ảnh cưới tông kem, champagne hoặc hồng nhạt.",
  "ngoc-trai": "Ngọc Trai hợp cặp đôi thích vẻ tinh khôi, tiệc nhẹ nhàng với tông trắng. Vòm chấm ngọc trai tôn ảnh cưới váy trắng, chụp nền sáng.",
  "hong-nhung": "Hồng Nhung hợp đám cưới lãng mạn, nồng nàn, nhất là tiệc tối hoặc mùa thu đông. Chùm hồng vẽ tay trên nền đỏ mận hợp ảnh cưới tông ấm, ánh đèn vàng.",
  "nhat-ky-doi-minh": "Nhật Ký Đôi Mình hợp cặp đôi muốn kể lại hành trình yêu qua từng cột mốc: lần đầu gặp, lần hẹn đầu, lời cầu hôn. Chuẩn bị vài tấm ảnh theo từng năm để trang nhật ký thêm sống động.",
  "chung-mot-hanh-trinh": "Chung Một Hành Trình hợp cặp đôi có câu chuyện gắn với những nơi chốn, từ nơi gặp nhau đến ngày cưới. Ghi rõ ba điểm trên tuyến đường để khách hiểu hành trình của hai bạn.",
  "quan-quen": "Quán Quen hợp cặp đôi quen nhau ở một quán cà phê, quán ăn hay góc phố thân thuộc. Thẻ menu thanh lịch có thể kể lại những mốc yêu theo kiểu thực đơn rất gần gũi.",
  "giao-diem": "Giao Điểm hợp cặp đôi thích sự tối giản và một ý tưởng rõ ràng: hai vòng tròn giao nhau như hai cuộc đời gặp gỡ. Một tấm ảnh đẹp đặt trong vòng tròn là đủ.",
  "the-noi": "Thẻ Nổi hợp khi hai bạn muốn thiệp gọn gàng, lời mời ngắn và rõ, nhưng vẫn có chiều sâu nhờ nền hoạ tiết. Ảnh cưới chụp chính diện, bố cục cân đối là lựa chọn an toàn.",
  "chu-chuyen-nhip": "Chữ Chuyển Nhịp hợp cặp đôi cá tính, thích typography cỡ lớn và chuyển động khi mở thiệp. Lời mời ngắn, câu chữ có nhịp sẽ phát huy hết hiệu ứng của mẫu.",
  "khoi-hy": "Khối Hỷ hợp cặp đôi thích màu sắc rực rỡ, muốn chữ Hỷ quen thuộc được làm mới bằng mảng màu cắt giấy. Ảnh cưới nền đơn sắc, trang phục nổi bật sẽ hợp nhất.",
  "chung-minh": "Chúng Mình hợp cặp đôi trẻ, vui tính, muốn thiệp kể chuyện bằng minh hoạ chibi và bong bóng thoại. Viết những câu thoại ngắn, dí dỏm để khách đọc là bật cười.",
  "cat-giay": "Cắt Giấy hợp cặp đôi yêu đồ thủ công, thích những lớp giấy chồng lên nhau tạo chiều sâu quanh tên. Tông xanh, hồng hoặc lam đều nhẹ nhàng, hợp tiệc ban ngày.",
  "duyen-tinh-tu": "Duyên Tinh Tú hợp cặp đôi mộng mơ, tin rằng ngày cưới là ngày các vì sao sắp đặt. Chòm sao gieo từ đúng ngày cưới, hợp tiệc tối và ảnh cưới chụp đêm hoặc tông lam tím.",
};

// Same-archetype neighbours, taken in catalog order after this template (wrapping), so every page links onward.
export function relatedTemplates(id: string, count = 3): Template[] {
  const self = templates.find((t) => t.id === id);
  if (!self) return [];
  const peers = templates.filter((t) => t.archetype === self.archetype);
  const at = peers.indexOf(self);
  return Array.from({ length: Math.min(count, peers.length - 1) }, (_, i) => peers[(at + 1 + i) % peers.length]);
}
