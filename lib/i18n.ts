import type { Archetype } from "./templates";
import type { EventItem } from "./content";
import { formatDateEn, formatDateVi } from "./datetime.ts";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

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
  rsvpDone: string;
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

  /** Studio Editor v3 invitation body (design/Studio Editor v3.dc.html preview pane). */
  toAttend(kind: string): string;
  coupleTitle: string;
  ceremonyKicker: string;
  atTimeOn(time: string, weekday: string): string;
  monthYear(month: string, year: string): string;
  atPlace(place: string): string;
  partyKicker: string;
  welcomeLabel: string;
  dinnerLabel: string;
  longDate(date: string): string;
  scheduleTitle: string;
  rsvpBy(date: string): string;
  wishTo(names: string): string;
  thankYou: string;
  madeWith: string;
  tapToOpen: string;
  addAppleCal: string;
  noAccount: string;

  kindlyInvites: string;
  defaultGuest: string;
  openInvitation: string;
  autoScrollStart: string;
  autoScrollStop: string;
  muteMusic(title: string): string;
  playMusic(title: string): string;
}

const VI: ChromeText = {
  countdownLabel: "CÒN LẠI",
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
  groomSideTitle: "NHÀ TRAI",
  brideSideTitle: "NHÀ GÁI",

  eventsTitle: "Thời gian và địa điểm",
  eventKindTitle: { engagement: "Lễ đính hôn", ceremony: "Lễ thành hôn", reception: "Tiệc cưới", custom: "Sự kiện" },
  atTime: (time) => `Vào lúc ${time}`,

  giftTitle: "HỘP MỪNG CƯỚI",
  holderLabel: { groom: "CHÚ RỂ", bride: "CÔ DÂU" },
  accountTitle: (holder) => `Mừng ${holder}`,
  qrAlt: (holder, accountName) => `Mã QR chuyển khoản mừng ${holder}, tài khoản ${accountName}`,
  bankLabel: "Ngân hàng",
  accountNumberLabel: "Số tài khoản",
  accountNameLabel: "Chủ tài khoản",
  copyAccountLabel: (holder) => `Chép số tài khoản mừng ${holder}`,
  copied: "Đã chép",
  copyNumber: "Chép số",

  albumTitle: "Khoảnh khắc",
  photoAlt: (n) => `Ảnh cưới ${n}`,
  viewPhotoLabel: (n, total) => `Xem ảnh ${n} trên ${total}`,
  lightbox: { Close: "Đóng", Previous: "Ảnh trước", Next: "Ảnh sau", "Zoom in": "Phóng to", "Zoom out": "Thu nhỏ", Lightbox: "Xem ảnh" },

  rsvpTitle: "XÁC NHẬN THAM DỰ",
  rsvpLead: "Sự hiện diện của bạn là niềm vui của chúng mình.",
  rsvpDeadlineNote: (date) => ` Bạn báo giúp chúng mình trước ${date} nhé.`,
  yourName: "Tên của bạn",
  attendingQuestion: "Bạn có tham dự không?",
  attendingYes: "Sẽ tham dự",
  attendingNo: "Rất tiếc",
  guestsCount: "Số người đi cùng (tính cả bạn)",
  noteLabel: "Lời nhắn (không bắt buộc)",
  yes: "Có",
  no: "Không",
  submitRsvp: "Gửi xác nhận",
  sending: "Đang gửi…",
  rsvpDone: "Đã ghi nhận, cảm ơn bạn!",
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

  addGoogleCal: "+ Google Calendar",
  downloadIcs: "Tải lịch (.ics)",

  toAttend: (kind) => `tới dự ${kind} của`,
  coupleTitle: "CÔ DÂU & CHÚ RỂ",
  ceremonyKicker: "TRÂN TRỌNG BÁO TIN",
  atTimeOn: (time, weekday) => `Vào lúc ${time} · ${weekday}`,
  monthYear: (month, year) => `THÁNG ${month} · ${year}`,
  atPlace: (place) => `Tại ${place}`,
  partyKicker: "TIỆC CƯỚI",
  welcomeLabel: "ĐÓN KHÁCH",
  dinnerLabel: "KHAI TIỆC",
  longDate: (date) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    const wd = formatDateVi(date).split(",")[0];
    return m && wd ? `${wd}, ngày ${m[3]} tháng ${m[2]} năm ${m[1]}` : "";
  },
  scheduleTitle: "LỊCH TRÌNH",
  rsvpBy: (date) => `Vui lòng phản hồi trước ngày ${date}`,
  wishTo: (names) => `Gửi lời chúc đến ${names}…`,
  thankYou: "Thank you",
  madeWith: "TẠO BẰNG MỘC",
  tapToOpen: "CHẠM ĐỂ MỞ THIỆP",
  addAppleCal: "+ Apple Calendar",
  noAccount: "Chưa nhập số TK",

  kindlyInvites: "Trân trọng kính mời",
  defaultGuest: "Bạn thân mến",
  openInvitation: "Mở thiệp",
  autoScrollStart: "Tự cuộn thiệp từ đầu đến cuối",
  autoScrollStop: "Dừng tự cuộn",
  muteMusic: (title) => `Tắt nhạc nền: ${title}`,
  playMusic: (title) => `Bật nhạc nền: ${title}`,
};

const EN: ChromeText = {
  countdownLabel: "TIME LEFT",
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
  groomSideTitle: "GROOM'S FAMILY",
  brideSideTitle: "BRIDE'S FAMILY",

  eventsTitle: "When & Where",
  eventKindTitle: { engagement: "Engagement", ceremony: "Wedding Ceremony", reception: "Reception", custom: "Event" },
  atTime: (time) => `At ${time}`,

  giftTitle: "WEDDING GIFT",
  holderLabel: { groom: "GROOM", bride: "BRIDE" },
  accountTitle: (holder) => `For ${holder}`,
  qrAlt: (holder, accountName) => `QR code to gift ${holder}, account ${accountName}`,
  bankLabel: "Bank",
  accountNumberLabel: "Account number",
  accountNameLabel: "Account holder",
  copyAccountLabel: (holder) => `Copy account number for ${holder}`,
  copied: "Copied",
  copyNumber: "Copy number",

  albumTitle: "Moments",
  photoAlt: (n) => `Wedding photo ${n}`,
  viewPhotoLabel: (n, total) => `View photo ${n} of ${total}`,
  lightbox: { Close: "Close", Previous: "Previous", Next: "Next", "Zoom in": "Zoom in", "Zoom out": "Zoom out", Lightbox: "Lightbox" },

  rsvpTitle: "RSVP",
  rsvpLead: "Your presence means the world to us.",
  rsvpDeadlineNote: (date) => ` Please let us know by ${date}.`,
  yourName: "Your name",
  attendingQuestion: "Will you be attending?",
  attendingYes: "Will attend",
  attendingNo: "Regretfully no",
  guestsCount: "Number of guests (including you)",
  noteLabel: "Message (optional)",
  yes: "Yes",
  no: "No",
  submitRsvp: "Submit RSVP",
  sending: "Sending…",
  rsvpDone: "Received, thank you!",
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

  addGoogleCal: "+ Google Calendar",
  downloadIcs: "Download calendar (.ics)",

  toAttend: (kind) => `to the ${kind} of`,
  coupleTitle: "BRIDE & GROOM",
  ceremonyKicker: "WE JOYFULLY ANNOUNCE",
  atTimeOn: (time, weekday) => `At ${time} · ${weekday}`,
  monthYear: (month, year) => `${MONTHS[Number(month) - 1] ?? month} · ${year}`,
  atPlace: (place) => `At ${place}`,
  partyKicker: "RECEPTION",
  welcomeLabel: "WELCOME",
  dinnerLabel: "DINNER",
  longDate: (date) => formatDateEn(date),
  scheduleTitle: "SCHEDULE",
  rsvpBy: (date) => `Please reply by ${date}`,
  wishTo: (names) => `Send your wishes to ${names}…`,
  thankYou: "Thank you",
  madeWith: "MADE WITH MỘC",
  tapToOpen: "TAP TO OPEN",
  addAppleCal: "+ Apple Calendar",
  noAccount: "No account number yet",

  kindlyInvites: "You are cordially invited",
  defaultGuest: "Dear friend",
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
