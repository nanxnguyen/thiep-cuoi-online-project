// Phase 1 is Vietnam-only: wall-clock times are always +07:00 (no DST there).
export const TZ_OFFSET = "+07:00";
const WEEKDAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

export function eventStart(ev: { date: string; time: string }): Date | null {
  if (!ev.date) return null;
  const d = new Date(`${ev.date}T${ev.time || "00:00"}:00${TZ_OFFSET}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Earliest event that has not started yet; undated and past events are ignored.
export function nextEvent<T extends { date: string; time: string }>(events: readonly T[], now: Date): T | null {
  let best: T | null = null;
  let bestTime = Infinity;
  for (const e of events) {
    const t = eventStart(e)?.getTime();
    if (t !== undefined && t > now.getTime() && t < bestTime) {
      best = e;
      bestTime = t;
    }
  }
  return best;
}

// The soonest dated event, past or not: this is the "wedding date" shown on the cover.
export function earliestEvent<T extends { date: string; time: string }>(events: readonly T[]): T | null {
  let best: T | null = null;
  let bestTime = Infinity;
  for (const e of events) {
    const t = eventStart(e)?.getTime();
    if (t !== undefined && t < bestTime) {
      best = e;
      bestTime = t;
    }
  }
  return best;
}

export function remaining(target: Date, now: Date) {
  const s = Math.floor(Math.max(0, target.getTime() - now.getTime()) / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

// "2026-11-08" -> "Chủ nhật, 08/11/2026". Pure calendar arithmetic, so it is timezone independent.
export function formatDateVi(date: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return "";
  const utc = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (utc.getUTCMonth() !== Number(m[2]) - 1) return "";
  return `${WEEKDAYS[utc.getUTCDay()]}, ${m[3]}/${m[2]}/${m[1]}`;
}
