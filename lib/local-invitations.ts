export type LocalInvitation = { id: string; slug: string; key: string; title: string; updatedAt: string };

// The edit key lives only in the owner's browser (and their saved link): this list is how "Thiệp của tôi"
// finds it again. Losing it means losing edit access, which is the documented trade-off of having no accounts.
const STORAGE_KEY = "moc.invitations.v1";

const isLocal = (v: unknown): v is LocalInvitation =>
  typeof v === "object" &&
  v !== null &&
  ["id", "slug", "key", "title", "updatedAt"].every((k) => typeof (v as Record<string, unknown>)[k] === "string");

export function createLocalStore(storage: Pick<Storage, "getItem" | "setItem">) {
  const list = (): LocalInvitation[] => {
    try {
      const parsed: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? "[]");
      return Array.isArray(parsed) ? parsed.filter(isLocal).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) : [];
    } catch {
      return [];
    }
  };
  const write = (items: LocalInvitation[]) => {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* quota or private mode: the list is best-effort */
    }
  };
  return {
    list,
    get: (id: string) => list().find((i) => i.id === id),
    upsert: (item: LocalInvitation) => write([item, ...list().filter((i) => i.id !== item.id)]),
    remove: (id: string) => write(list().filter((i) => i.id !== id)),
  };
}

const UUID = /^\/studio\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

// The link an owner must keep: the fragment (#k=) never reaches server logs, and it carries the edit key.
export const editLink = (origin: string, id: string, key: string) => `${origin}/studio/${id}#k=${key}`;

// Accepts an absolute or relative studio link pasted by the owner; anything else is null.
export function parseEditLink(input: string, origin: string): { id: string; key: string } | null {
  try {
    const url = new URL(input.trim(), origin);
    const id = UUID.exec(url.pathname)?.[1];
    const key = new URLSearchParams(url.hash.replace(/^#/, "")).get("k");
    return id && key ? { id, key } : null;
  } catch {
    return null;
  }
}

export function invitationTitle(couple: { groom: { name: string }; bride: { name: string } }): string {
  const names = [couple.groom.name, couple.bride.name].map((n) => n.trim()).filter(Boolean);
  return names.length ? names.join(" & ") : "Thiệp chưa đặt tên";
}
