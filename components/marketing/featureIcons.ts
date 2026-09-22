import { CalendarClock, ClipboardCheck, Images, Mail, MapPin, Music2, NotebookPen, QrCode, type LucideIcon } from "lucide-react";

// One icon per feature slug (lib/marketing/features.ts). Kept out of lib/ so the data stays free of React.
export const FEATURE_ICON: Record<string, LucideIcon> = {
  "xac-nhan-tham-du": ClipboardCheck,
  "so-luu-but": NotebookPen,
  "mung-cuoi-qr": QrCode,
  "ban-do-chi-duong": MapPin,
  "dem-nguoc-lich": CalendarClock,
  "album-anh": Images,
  "nhac-nen": Music2,
  "phong-bi-loi-moi": Mail,
};
