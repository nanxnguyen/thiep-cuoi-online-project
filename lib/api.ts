import type { Content } from "./content.ts";

// Typed client for the Spring backend (spec 6.4). The backend is the source of truth for this
// contract; keep the DTO shapes below in sync with its records (see the plan's self-review table).
export class ApiError extends Error {
  status: number;
  // No parameter properties: Node's type stripping (used by `npm test`) only supports erasable syntax.
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// User-facing text for failures that carry no usable ProblemDetail `detail` (proxy errors, crashes, no network).
// The backend's own `detail` strings are already Vietnamese and win when present.
export const NETWORK_MESSAGE = "Không kết nối được máy chủ. Bạn kiểm tra mạng rồi thử lại nhé.";
const STATUS_MESSAGE: Record<number, string> = {
  400: "Thông tin chưa hợp lệ, bạn kiểm tra lại nhé.",
  401: "Cần link chỉnh sửa của thiệp này.",
  403: "Bạn không có quyền thực hiện thao tác này.",
  404: "Không tìm thấy nội dung này.",
  409: "Thao tác bị trùng, bạn thử lại nhé.",
  413: "Nội dung quá lớn.",
  415: "Định dạng này chưa được hỗ trợ.",
  429: "Bạn thao tác hơi nhanh, hãy thử lại sau ít phút.",
};
export const messageForStatus = (status: number): string =>
  STATUS_MESSAGE[status] ?? (status >= 500 ? "Máy chủ đang bận, bạn thử lại sau nhé." : `Lỗi ${status}`);

export type PublicWish = { id: string; name: string; message: string; createdAt: string };
export type InvitationDto = {
  id: string;
  slug: string;
  templateId: string;
  content: Content;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
};
export type CreatedInvitation = { id: string; slug: string; key: string };
export type PublicInvitationDto = { slug: string; templateId: string; content: Content; wishes: PublicWish[] };
// `website` is a honeypot: real users never fill it, bots do. `guestToken` comes from a `?g=` guest-manager
// link (Phase 3); empty string for the manual `?to=` flow, resolved server-side into `guest_id` or ignored.
export type RsvpInput = {
  name: string;
  attending: boolean;
  guests: number;
  note: string;
  answers: Record<string, string>;
  guestLabel: string;
  guestToken: string;
  website: string;
};
export type WishInput = { name: string; message: string; website: string };
export type RsvpRow = {
  id: string;
  name: string;
  attending: boolean;
  guests: number;
  note: string;
  answers: Record<string, string>;
  guestLabel: string;
  createdAt: string;
};
export type WishRow = PublicWish & { hidden: boolean };
export type ResponsesDto = {
  rsvps: RsvpRow[];
  summary: { attending: number; declined: number; headcount: number };
  wishes: WishRow[];
};
type Patch = { templateId?: string; content?: Content; slug?: string; published?: boolean };

// Một dòng khách mời (hộ/nhóm). rsvpStatus/confirmedPax phản ánh RSVP mới nhất gắn guest này (GuestService).
export type GuestRsvpStatus = "pending" | "attending" | "declined";
export type GuestDto = {
  id: string;
  household: string;
  groupName: string;
  tableNo: string;
  phone: string;
  expectedPax: number;
  note: string;
  token: string;
  link: string;
  rsvpStatus: GuestRsvpStatus;
  confirmedPax: number | null;
  createdAt: string;
  updatedAt: string;
};
// household bắt buộc khi tạo mới; khi sửa, trường bỏ qua (undefined) nghĩa là giữ nguyên (BE: null = unchanged).
export type GuestInput = {
  household?: string;
  groupName?: string;
  tableNo?: string;
  phone?: string;
  expectedPax?: number;
  note?: string;
};
export type GuestImportResult = { created: number; errors: { index: number; message: string }[] };
export type AccountUser = { id: string; email: string };
export type AuthResponse = { accessToken: string; user: AccountUser };
export type AccountInvitation = { id: string; slug: string; templateId: string; published: boolean; updatedAt: string };

export function createApi(baseUrl: string, fetchImpl: typeof fetch = (...a) => fetch(...a)) {
  async function call<T>(path: string, init: RequestInit = {}, key?: string): Promise<T> {
    const headers = new Headers(init.headers);
    if (key) headers.set("X-Edit-Key", key);
    // Only string bodies are JSON; for FormData fetch must add the multipart boundary itself.
    if (typeof init.body === "string") headers.set("Content-Type", "application/json");
    let res: Response;
    try {
      res = await fetchImpl(`${baseUrl}${path}`, { ...init, headers });
    } catch {
      throw new ApiError(0, NETWORK_MESSAGE); // offline, DNS, CORS, server down
    }
    if (!res.ok) {
      let message = messageForStatus(res.status);
      try {
        const problem = await res.json();
        if (typeof problem.detail === "string" && problem.detail) message = problem.detail;
      } catch {
        /* non-JSON error body */
      }
      throw new ApiError(res.status, message);
    }
    return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
  }
  const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

  return {
    register: (email: string, password: string) => call<AuthResponse>("/api/auth/register", json("POST", { email, password })),
    login: (email: string, password: string) => call<AuthResponse>("/api/auth/login", json("POST", { email, password })),
    me: (token: string) => call<AccountUser>("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
    listAccountInvitations: (token: string) => call<AccountInvitation[]>("/api/account/invitations", { headers: { Authorization: `Bearer ${token}` } }),
    claimInvitation: (token: string, id: string, key: string) => call<AccountInvitation>("/api/account/invitations/claim", { ...json("POST", { id, key }), headers: { Authorization: `Bearer ${token}` } }),
    createInvitation: (templateId: string, content: Content) =>
      call<CreatedInvitation>("/api/invitations", json("POST", { templateId, content })),
    getInvitation: (id: string, key: string) => call<InvitationDto>(`/api/invitations/${id}`, {}, key),
    // keepalive lets the last autosave finish while the tab is closing (browsers cap such bodies at 64KB).
    updateInvitation: (id: string, key: string, patch: Patch, opts?: { keepalive?: boolean }) =>
      call<InvitationDto>(`/api/invitations/${id}`, { ...json("PATCH", patch), ...(opts?.keepalive ? { keepalive: true } : {}) }, key),
    uploadMedia(id: string, key: string, kind: "image" | "audio", file: Blob, filename: string) {
      const form = new FormData();
      form.set("kind", kind);
      form.set("file", file, filename);
      return call<{ url: string }>(`/api/invitations/${id}/media`, { method: "POST", body: form }, key);
    },
    getResponses: (id: string, key: string) => call<ResponsesDto>(`/api/invitations/${id}/responses`, {}, key),
    setWishHidden: (id: string, key: string, wishId: string, hidden: boolean) =>
      call<void>(`/api/invitations/${id}/wishes/${wishId}`, json("PATCH", { hidden }), key),
    // 404 (unknown or unpublished) resolves to null so the page can call notFound(); never cached.
    async getPublicInvitation(slug: string): Promise<PublicInvitationDto | null> {
      try {
        return await call<PublicInvitationDto>(`/api/public/invitations/${slug}`, { cache: "no-store" });
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
    submitRsvp: (slug: string, input: RsvpInput) =>
      call<void>(`/api/public/invitations/${slug}/rsvp`, json("POST", input)),
    submitWish: (slug: string, input: WishInput) =>
      call<PublicWish>(`/api/public/invitations/${slug}/wishes`, json("POST", input)),
    listGuests: (id: string, key: string) => call<{ guests: GuestDto[] }>(`/api/invitations/${id}/guests`, {}, key),
    createGuest: (id: string, key: string, input: GuestInput & { household: string }) =>
      call<GuestDto>(`/api/invitations/${id}/guests`, json("POST", input), key),
    updateGuest: (id: string, key: string, guestId: string, input: GuestInput) =>
      call<GuestDto>(`/api/invitations/${id}/guests/${guestId}`, json("PATCH", input), key),
    deleteGuest: (id: string, key: string, guestId: string) =>
      call<void>(`/api/invitations/${id}/guests/${guestId}`, { method: "DELETE" }, key),
    importGuests: (id: string, key: string, guests: (GuestInput & { household: string })[]) =>
      call<GuestImportResult>(`/api/invitations/${id}/guests/import`, json("POST", { guests }), key),
    // Token sai/hết hạn -> null (không lỗi cả trang khách); xem app/invite/[slug]/page.tsx.
    async resolveGuestToken(slug: string, token: string): Promise<string | null> {
      try {
        const res = await call<{ household: string }>(`/api/public/invitations/${slug}/guests/${token}`);
        return res.household;
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
  };
}

export const api = createApi(process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080");
