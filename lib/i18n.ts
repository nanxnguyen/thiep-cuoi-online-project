import type { Archetype } from "./templates";
import type { EventItem } from "./content";

// Phase 5 (đa ngôn ngữ): chrome text (nhãn, nút, thông báo) của trang khách — không đụng nội dung do chủ
// thiệp gõ (đó là "song ngữ theo trường", xem lib/content.ts couple.messageEn/thanks.messageEn/gift.noteEn
// và rsvp.questions[].labelEn). Chỉ dùng cho /invite/[slug]; Studio và marketing giữ nguyên tiếng Việt.
// Xem docs/superpowers/specs/2026-09-23-i18n-phase5-design.md.
export type Locale = "vi" | "en";

// `sp.lang` từ URL: bất kỳ giá trị nào khác "en" (thiếu, sai, "vi", rác) đều là tiếng Việt — mặc định an toàn.
export function resolveLocale(v: string | string[] | undefined): Locale {
  return v === "en" ? "en" : "vi";
}

// 4 trường nội dung có bản Anh tuỳ chọn: hiện bản Anh khi đang ở locale "en" VÀ chủ thiệp đã gõ; ngược lại
// fallback về bản tiếng Việt (không hiện trống).
export function pick(locale: Locale, vi: string, en: string): string {
  return locale === "en" && en.trim() !== "" ? en : vi;
}

interface ChromeText {
  countdownLabel: string;
  countdownLead(title: string): string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  srCountdown(days: number): string;
  weddingFallback: string;

  kicker: Record<Archetype, string>;
  groomFallback: string;
  brideFallback: string;
  scrollDown: string;
  heroAlt(groom: string, bride: string): string;

  inviteTitle: string;

  /** Sticky section nav on the guest page: family, events, album, rsvp, wishes, gift. */
  nav: readonly [string, string, string, string, string, string];
  familyTitle: string;
  groomSideTitle: string;
  brideSideTitle: string;

  eventsTitle: string;
  eventKindTitle: Record<EventItem["kind"], string>;
  atTime(time: string): string;

  giftTitle: string;
  holderLabel: Record<"groom" | "bride", string>;
  accountTitle(holder: string): string;
  qrAlt(holder: string, accountName: string): string;
  bankLabel: string;
  accountNumberLabel: string;
  accountNameLabel: string;
  copyAccountLabel(holder: string): string;
  copied: string;
  copyNumber: string;

  albumTitle: string;
  photoAlt(n: number): string;
  viewPhotoLabel(n: number, total: number): string;
  lightbox: { Close: string; Previous: string; Next: string; "Zoom in": string; "Zoom out": string; Lightbox: string };

  rsvpTitle: string;
  rsvpLead: string;
  rsvpDeadlineNote(date: string): string;
  yourName: string;
  attendingQuestion: string;
  attendingYes: string;
  attendingNo: string;
  guestsCount: string;
  noteLabel: string;
  yes: string;
  no: string;
  submitRsvp: string;
  sending: string;
  doneAttending: string;
  doneNotAttending: string;
  doneBody: string;
  editResponse: string;
  previewHintForm: string;
  errNoName: string;
  errNoAttending: string;
  errGeneric: string;

  wishesTitle: string;
  wishLegend: string;
  wishLabel: string;
  submitWish: string;
  wishSentMsg: string;
  wishPreviewHint: string;
  wishEmpty: string;
  errWishRequired: string;

  creditPrefix: string;

  directions: string;
  showMap: string;
  hideMap: string;
  mapTitle(title: string): string;

  addGoogleCal: string;
  downloadIcs: string;

  kindlyInvites: string;
  defaultGuest: string;
  openInvitation: string;
  autoScrollStart: string;
  autoScrollStop: string;
  muteMusic(title: string): string;
  playMusic(title: string): string;
}

const VI: ChromeText = {
  countdownLabel: "Đếm ngược",
  countdownLead: (title) => `Còn bao lâu nữa đến ${title}`,
  days: "Ngày",
  hours: "Giờ",
  minutes: "Phút",
  seconds: "Giây",
  srCountdown: (days) => `Còn ${days} ngày nữa đến lễ cưới.`,
  weddingFallback: "lễ cưới",

  kicker: {
    editorial: "Lễ thành hôn của",
    minimal: "Thiệp mời",
    classic: "Trân trọng báo tin lễ thành hôn của",
    botanical: "Cùng nhau về một nhà",
    traditional: "Thư mời dự lễ thành hôn",
    korean: "Chúng mình sắp cưới",
  },
  groomFallback: "Chú rể",
  brideFallback: "Cô dâu",
  scrollDown: "Cuộn xuống",
  heroAlt: (groom, bride) => `Ảnh cưới của ${groom} và ${bride}`,

  inviteTitle: "Lời mời",

  nav: ["Gia đình", "Sự kiện", "Album", "Tham dự", "Lời chúc", "Mừng cưới"],
  familyTitle: "Hai họ",
  groomSideTitle: "Nhà trai",
  brideSideTitle: "Nhà gái",

  eventsTitle: "Thời gian và địa điểm",
  eventKindTitle: { engagement: "Lễ đính hôn", ceremony: "Lễ thành hôn", reception: "Tiệc cưới", custom: "Sự kiện" },
  atTime: (time) => `Vào lúc ${time}`,

  giftTitle: "Hộp mừng cưới",
  holderLabel: { groom: "chú rể", bride: "cô dâu" },
  accountTitle: (holder) => `Mừng ${holder}`,
  qrAlt: (holder, accountName) => `Mã QR chuyển khoản mừng ${holder}, tài khoản ${accountName}`,
  bankLabel: "Ngân hàng",
  accountNumberLabel: "Số tài khoản",
  accountNameLabel: "Chủ tài khoản",
  copyAccountLabel: (holder) => `Chép số tài khoản mừng ${holder}`,
  copied: "Đã chép",
  copyNumber: "Chép số",

  albumTitle: "Khoảnh khắc của chúng mình",
  photoAlt: (n) => `Ảnh cưới ${n}`,
  viewPhotoLabel: (n, total) => `Xem ảnh ${n} trên ${total}`,
  lightbox: { Close: "Đóng", Previous: "Ảnh trước", Next: "Ảnh sau", "Zoom in": "Phóng to", "Zoom out": "Thu nhỏ", Lightbox: "Xem ảnh" },

  rsvpTitle: "Xác nhận tham dự",
  rsvpLead: "Sự hiện diện của bạn là niềm vui của chúng mình.",
  rsvpDeadlineNote: (date) => ` Bạn báo giúp chúng mình trước ${date} nhé.`,
  yourName: "Tên của bạn",
  attendingQuestion: "Bạn có tham dự không?",
  attendingYes: "Mình sẽ đến",
  attendingNo: "Mình không đến được",
  guestsCount: "Số người đi cùng (tính cả bạn)",
  noteLabel: "Lời nhắn (không bắt buộc)",
  yes: "Có",
  no: "Không",
  submitRsvp: "Gửi xác nhận",
  sending: "Đang gửi…",
  doneAttending: "Hẹn gặp bạn nhé!",
  doneNotAttending: "Cảm ơn bạn đã báo cho chúng mình.",
  doneBody: "Chúng mình đã nhận được phản hồi của bạn. Cần đổi ý, bạn cứ gửi lại.",
  editResponse: "Sửa phản hồi",
  previewHintForm: "Chế độ xem thử: biểu mẫu chưa gửi được.",
  errNoName: "Hãy cho chúng mình biết tên bạn.",
  errNoAttending: "Bạn sẽ đến chứ? Hãy chọn một đáp án.",
  errGeneric: "Chưa gửi được, bạn thử lại nhé.",

  wishesTitle: "Sổ lưu bút",
  wishLegend: "Gửi lời chúc",
  wishLabel: "Lời chúc",
  submitWish: "Gửi lời chúc",
  wishSentMsg: "Lời chúc của bạn đã được gửi. Cảm ơn bạn!",
  wishPreviewHint: "Chế độ xem thử: lời chúc chưa gửi được.",
  wishEmpty: "Chưa có lời chúc nào. Bạn là người đầu tiên nhé.",
  errWishRequired: "Hãy nhập tên và lời chúc của bạn.",

  creditPrefix: "Thiệp được tạo bằng ",

  directions: "Chỉ đường",
  showMap: "Xem bản đồ",
  hideMap: "Ẩn bản đồ",
  mapTitle: (title) => `Bản đồ: ${title}`,

  addGoogleCal: "Thêm vào Google Calendar",
  downloadIcs: "Tải lịch (.ics)",

  kindlyInvites: "Trân trọng kính mời",
  defaultGuest: "Quý khách",
  openInvitation: "Mở thiệp",
  autoScrollStart: "Tự cuộn thiệp từ đầu đến cuối",
  autoScrollStop: "Dừng tự cuộn",
  muteMusic: (title) => `Tắt nhạc nền: ${title}`,
  playMusic: (title) => `Bật nhạc nền: ${title}`,
};

const EN: ChromeText = {
  countdownLabel: "Countdown",
  countdownLead: (title) => `Counting down to ${title}`,
  days: "Days",
  hours: "Hours",
  minutes: "Minutes",
  seconds: "Seconds",
  srCountdown: (days) => `${days} days left until the wedding.`,
  weddingFallback: "the wedding",

  kicker: {
    editorial: "The wedding of",
    minimal: "You're invited",
    classic: "We joyfully announce the wedding of",
    botanical: "Together, we begin",
    traditional: "You are invited to the wedding of",
    korean: "We're getting married",
  },
  groomFallback: "Groom",
  brideFallback: "Bride",
  scrollDown: "Scroll down",
  heroAlt: (groom, bride) => `Wedding photo of ${groom} and ${bride}`,

  inviteTitle: "Invitation",

  nav: ["Family", "Events", "Album", "RSVP", "Wishes", "Gift"],
  familyTitle: "Families",
  groomSideTitle: "Groom's Family",
  brideSideTitle: "Bride's Family",

  eventsTitle: "When & Where",
  eventKindTitle: { engagement: "Engagement", ceremony: "Wedding Ceremony", reception: "Reception", custom: "Event" },
  atTime: (time) => `At ${time}`,

  giftTitle: "Wedding Gift",
  holderLabel: { groom: "the groom", bride: "the bride" },
  accountTitle: (holder) => `For ${holder}`,
  qrAlt: (holder, accountName) => `QR code to gift ${holder}, account ${accountName}`,
  bankLabel: "Bank",
  accountNumberLabel: "Account number",
  accountNameLabel: "Account holder",
  copyAccountLabel: (holder) => `Copy account number for ${holder}`,
  copied: "Copied",
  copyNumber: "Copy number",

  albumTitle: "Our Moments",
  photoAlt: (n) => `Wedding photo ${n}`,
  viewPhotoLabel: (n, total) => `View photo ${n} of ${total}`,
  lightbox: { Close: "Close", Previous: "Previous", Next: "Next", "Zoom in": "Zoom in", "Zoom out": "Zoom out", Lightbox: "Lightbox" },

  rsvpTitle: "RSVP",
  rsvpLead: "Your presence means the world to us.",
  rsvpDeadlineNote: (date) => ` Please let us know by ${date}.`,
  yourName: "Your name",
  attendingQuestion: "Will you be attending?",
  attendingYes: "I'll be there",
  attendingNo: "I can't make it",
  guestsCount: "Number of guests (including you)",
  noteLabel: "Message (optional)",
  yes: "Yes",
  no: "No",
  submitRsvp: "Submit RSVP",
  sending: "Sending…",
  doneAttending: "See you there!",
  doneNotAttending: "Thanks for letting us know.",
  doneBody: "We've received your RSVP. Changed your mind? Just send it again.",
  editResponse: "Edit response",
  previewHintForm: "Preview mode: the form can't be submitted.",
  errNoName: "Please tell us your name.",
  errNoAttending: "Will you come? Please pick one.",
  errGeneric: "Couldn't send that, please try again.",

  wishesTitle: "Guestbook",
  wishLegend: "Leave a wish",
  wishLabel: "Your wishes",
  submitWish: "Send wishes",
  wishSentMsg: "Your wishes have been sent. Thank you!",
  wishPreviewHint: "Preview mode: wishes can't be submitted.",
  wishEmpty: "No wishes yet. Be the first!",
  errWishRequired: "Please enter your name and your wishes.",

  creditPrefix: "Invitation made with ",

  directions: "Directions",
  showMap: "Show map",
  hideMap: "Hide map",
  mapTitle: (title) => `Map: ${title}`,

  addGoogleCal: "Add to Google Calendar",
  downloadIcs: "Download calendar (.ics)",

  kindlyInvites: "You are cordially invited",
  defaultGuest: "Dear guest",
  openInvitation: "Open invitation",
  autoScrollStart: "Auto-scroll the invitation end to end",
  autoScrollStop: "Stop auto-scroll",
  muteMusic: (title) => `Mute background music: ${title}`,
  playMusic: (title) => `Play background music: ${title}`,
};

const DICT: Record<Locale, ChromeText> = { vi: VI, en: EN };

export function t(locale: Locale): ChromeText {
  return DICT[locale];
}
