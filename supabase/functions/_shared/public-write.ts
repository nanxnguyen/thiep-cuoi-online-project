export type PublicAction = "rsvp" | "wish";
export type PublishedInvitation = {
  id: string;
  content: {
    rsvp?: { enabled?: boolean; questions?: { id: string }[] };
    guestbook?: { enabled?: boolean };
  };
};
export type StoredWrite = Record<string, unknown>;
export interface PublicWriteStore {
  findPublishedInvitation(slug: string): Promise<PublishedInvitation | null>;
  consumeRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean>;
  findGuestId(invitationId: string, tokenHash: string): Promise<string | null>;
  findExisting(action: PublicAction, invitationId: string, requestKey: string): Promise<StoredWrite | null>;
  insertRsvp(value: Record<string, unknown>): Promise<StoredWrite>;
  insertWish(value: Record<string, unknown>): Promise<StoredWrite>;
}

type RsvpPayload = { name: string; attending: boolean; guests: number; note: string; answers: Record<string, string>; guestLabel: string; guestToken: string; website: string };
type WishPayload = { name: string; message: string; website: string };
type PublicPayload = RsvpPayload | WishPayload;

class ContractError extends Error {}

const json = (status: number, detail: string) => Response.json({ detail }, { status });

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ContractError();
  return value as Record<string, unknown>;
}

function text(value: unknown, max: number, required = false): string {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new ContractError();
  return value;
}

export function parsePayload(action: PublicAction, input: unknown): PublicPayload { 
  const value = object(input);
  if (action === "wish") {
    return { name: text(value.name, 80, true).trim(), message: text(value.message, 500, true).trim(), website: text(value.website, 200) };
  }
  if (typeof value.attending !== "boolean" || !Number.isInteger(value.guests) || (value.guests as number) < 0 || (value.guests as number) > 100) throw new ContractError();
  const rawAnswers = object(value.answers);
  if (Object.keys(rawAnswers).length > 3 || Object.values(rawAnswers).some((answer) => typeof answer !== "string" || answer.length > 300)) throw new ContractError();
  return {
    name: text(value.name, 80, true).trim(),
    attending: value.attending,
    guests: value.guests as number,
    note: text(value.note, 500),
    answers: rawAnswers as Record<string, string>,
    guestLabel: text(value.guestLabel, 80).trim(),
    guestToken: text(value.guestToken, 128),
    website: text(value.website, 200),
  };
}

async function sha256(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function safeEqual(actual: string, expected: string): Promise<boolean> {
  const [a, b] = await Promise.all([sha256(actual), sha256(expected)]);
  let different = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index++) different |= a.charCodeAt(index % a.length) ^ b.charCodeAt(index % b.length);
  return different === 0;
}

function wishResponse(row: StoredWrite) {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    createdAt: row.created_at,
  };
}

export async function handlePublicWrite(
  request: Request,
  store: PublicWriteStore,
  config: { sharedSecret: string; limit?: number; windowSeconds?: number },
): Promise<Response> {
  if (request.method !== "POST") return json(405, "Phương thức không được hỗ trợ.");
  if (!await safeEqual(request.headers.get("x-edge-secret") ?? "", config.sharedSecret)) return json(401, "Không được phép.");

  let envelope: Record<string, unknown>;
  try { envelope = object(await request.json()); } catch { return json(400, "Thông tin chưa hợp lệ."); }
  const action = envelope.action;
  const slug = envelope.slug;
  const fingerprint = envelope.fingerprint;
  const requestKey = request.headers.get("idempotency-key") ?? "";
  if ((action !== "rsvp" && action !== "wish") || typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    || typeof fingerprint !== "string" || !/^[0-9a-f]{64}$/.test(fingerprint) || requestKey.length < 16 || requestKey.length > 120) {
    return json(400, "Thông tin chưa hợp lệ.");
  }

  let payload: PublicPayload;
  try { payload = parsePayload(action, envelope.payload); } catch { return json(400, "Thông tin chưa hợp lệ."); }

  try {
    const invitation = await store.findPublishedInvitation(slug);
    if (!invitation) return json(404, "Không tìm thấy nội dung này.");
    if (payload.website) {
      if (action === "rsvp") return new Response(null, { status: 204 });
      return Response.json({ id: crypto.randomUUID(), name: payload.name, message: (payload as WishPayload).message, createdAt: new Date().toISOString() }, { status: 201 });
    }

    const existing = await store.findExisting(action, invitation.id, requestKey);
    if (existing) return action === "rsvp" ? new Response(null, { status: 204 }) : Response.json(wishResponse(existing), { status: 201 });

    const allowed = await store.consumeRateLimit(`public-write:${fingerprint}:${action}:${invitation.id}`, config.limit ?? 5, config.windowSeconds ?? 600);
    if (!allowed) return json(429, "Bạn gửi quá nhanh, hãy thử lại sau ít phút.");

    if (action === "rsvp") {
      const input = payload as RsvpPayload;
      if (invitation.content.rsvp?.enabled === false) return json(403, "Chủ thiệp đã tắt tính năng này.");
      const questionIds = new Set((invitation.content.rsvp?.questions ?? []).map((question) => question.id));
      const answers = Object.fromEntries(Object.entries(input.answers).filter(([id]) => questionIds.has(id)));
      const guestId = input.guestToken ? await store.findGuestId(invitation.id, await sha256(input.guestToken)) : null;
      await store.insertRsvp({ invitation_id: invitation.id, guest_id: guestId, name: input.name, attending: input.attending,
        guests: input.attending ? input.guests : 0, note: input.note, answers, guest_label: input.guestLabel, request_key: requestKey });
      return new Response(null, { status: 204 });
    }

    const input = payload as WishPayload;
    if (invitation.content.guestbook?.enabled === false) return json(403, "Chủ thiệp đã tắt tính năng này.");
    const saved = await store.insertWish({ invitation_id: invitation.id, name: input.name, message: input.message,
      hidden: false, approved: false, request_key: requestKey });
    return Response.json(wishResponse(saved), { status: 201 });
  } catch {
    return json(500, "Máy chủ đang bận, bạn thử lại sau nhé.");
  }
}
