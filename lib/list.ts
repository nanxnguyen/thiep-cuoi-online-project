// Immutable helpers for the editable lists in the Studio (events, album, questions, accounts).
// Out-of-range indexes are a no-op, so a stale click can never corrupt the list.

export function move<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list];
  const inRange = (i: number) => Number.isInteger(i) && i >= 0 && i < list.length;
  if (from === to || !inRange(from) || !inRange(to)) return next;
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export const removeAt = <T>(list: readonly T[], i: number): T[] => list.filter((_, idx) => idx !== i);

export const updateAt = <T extends object>(list: readonly T[], i: number, patch: Partial<T>): T[] =>
  list.map((item, idx) => (idx === i ? { ...item, ...patch } : item));

// 8 hex chars for new event/question ids. Uses getRandomValues rather than randomUUID because
// randomUUID only exists in secure contexts (a phone testing over http://192.168.x.x would crash).
export function newId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
