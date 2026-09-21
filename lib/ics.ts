import { eventStart } from "./datetime.ts";

export type CalendarEvent = { title: string; date: string; time: string; venue: string; address: string };

const DURATION_MS = 2 * 60 * 60 * 1000;
const utc = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
const escapeText = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const where = (ev: CalendarEvent) => [ev.venue, ev.address].filter(Boolean).join(", ");

// RFC 5545: lines are at most 75 octets; continuation lines start with one space. Multibyte safe.
function fold(line: string): string {
  const enc = new TextEncoder();
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    if (bytes + n > 75) {
      out.push(cur);
      cur = " " + ch;
      bytes = 1 + n;
    } else {
      cur += ch;
      bytes += n;
    }
  }
  out.push(cur);
  return out.join("\r\n");
}

export function toIcs(ev: CalendarEvent, uid: string, now: Date = new Date()): string | null {
  const start = eventStart(ev);
  if (!start) return null;
  const end = new Date(start.getTime() + DURATION_MS);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MOC Wedding//VI",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${utc(now)}`,
    `DTSTART:${utc(start)}`,
    `DTEND:${utc(end)}`,
    `SUMMARY:${escapeText(ev.title)}`,
    `LOCATION:${escapeText(where(ev))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function googleCalendarUrl(ev: CalendarEvent): string | null {
  const start = eventStart(ev);
  if (!start) return null;
  const end = new Date(start.getTime() + DURATION_MS);
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    dates: `${utc(start)}/${utc(end)}`,
    location: where(ev),
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}
