export type InviteTone = "formal" | "friendly";
export type InviteMessageInput = { bride: string; groom: string; link: string };

// The six sample messages from design/CC Tin Nhan.dc.html, three per tone. Blank fields fall back to readable
// placeholders so a half-filled form still produces something the couple can edit after pasting.
const TEMPLATES: Record<InviteTone, ((a: string, b: string, l: string) => string)[]> = {
  formal: [
    (a, b, l) => `Kính mời anh/chị đến chung vui trong ngày trọng đại của ${a} và ${b}. Mọi thông tin chi tiết đã có trong thiệp mời: ${l}`,
    (a, b, l) => `${a} và ${b} xin trân trọng thông báo lễ thành hôn. Kính mong quý anh/chị dành thời gian ghé chung vui, thiệp mời chi tiết: ${l}`,
    (_a, _b, l) => `Con/cháu xin kính báo ngày vui của con/cháu. Kính mong đến chung vui, thông tin chi tiết trong link sau: ${l}`,
  ],
  friendly: [
    (a, b, l) => `Ê, ${a} với ${b} cưới rồi nè! Ghé xem thiệp mời đi, nhớ xác nhận tham dự giúp bọn mình nha: ${l} 🥂`,
    (_a, _b, l) => `Tin nóng: mình cưới rồi! Xem thiệp mời tại đây và đến chung vui với bọn mình nhé: ${l}`,
    (a, b, l) => `Chỉ còn vài ngày nữa là đến ngày cưới của ${a} và ${b} rồi, xác nhận tham dự giúp mình nếu chưa xác nhận nha: ${l}`,
  ],
};

export function inviteMessages(tone: InviteTone, input: InviteMessageInput): string[] {
  const a = input.bride.trim() || "cô dâu";
  const b = input.groom.trim() || "chú rể";
  const l = input.link.trim() || "[link thiệp]";
  return TEMPLATES[tone].map((f) => f(a, b, l));
}
