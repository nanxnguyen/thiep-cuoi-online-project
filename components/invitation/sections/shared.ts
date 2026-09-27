import type { Content } from "@/lib/content";
import { t, type Locale } from "@/lib/i18n";

export const groomName = (c: Content, locale: Locale) => c.couple.groom.name.trim() || t(locale).groomFallback;
export const brideName = (c: Content, locale: Locale) => c.couple.bride.name.trim() || t(locale).brideFallback;
/** The design writes the groom first: "Minh Khôi & Hạ Vy". */
export const names = (c: Content, locale: Locale) => `${groomName(c, locale)} & ${brideName(c, locale)}`;
export const ceremonyOf = (c: Content) => c.events.find((e) => e.kind === "ceremony") ?? c.events.find((e) => e.kind !== "reception");
export const receptionOf = (c: Content) => c.events.find((e) => e.kind === "reception");
export const split = (date: string) => {
  const [y = "", m = "", d = ""] = date.split("-");
  return { y, m, d };
};
