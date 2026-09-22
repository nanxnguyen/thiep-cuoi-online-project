import { formatDateVi } from "../datetime.ts";

export type InviteMessageInput = {
  groom: string;
  bride: string;
  date: string; // "YYYY-MM-DD", optional
  link: string; // optional
  guestName: string; // optional
};

const clean = (s: string) => s.trim();

// Two tones, each a single composed message — not a template library, just string assembly so an
// invalid/empty optional field drops its whole clause instead of leaving a blank gap ("vào " with
// nothing after it, or a dangling "tại: ").
export function buildInviteMessages(input: InviteMessageInput): { friendly: string; formal: string } {
  const groom = clean(input.groom) || "chú rể";
  const bride = clean(input.bride) || "cô dâu";
  const guestName = clean(input.guestName);
  const link = clean(input.link);
  const dateVi = formatDateVi(clean(input.date));

  const whenClause = dateVi ? ` vào ${dateVi}` : "";
  const linkSentence = link ? ` Bạn xem thiệp và gửi lời chúc tại: ${link}.` : "";

  const friendlyGreeting = guestName ? `${guestName} ơi, ` : "Cả nhà ơi, ";
  const friendly = `${friendlyGreeting}${groom} và ${bride} tổ chức lễ cưới${whenClause}.${linkSentence} Rất mong được đón tiếp!`;

  const formalGreeting = guestName ? `Kính gửi ${guestName},` : "Kính gửi,";
  const formal = `${formalGreeting} ${groom} và ${bride} trân trọng kính mời bạn đến dự lễ thành hôn${whenClause}.${linkSentence} Sự hiện diện của bạn là niềm vinh hạnh cho gia đình hai bên.`;

  return { friendly, formal };
}
