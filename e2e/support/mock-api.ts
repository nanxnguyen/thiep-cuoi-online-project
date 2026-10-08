import type { Page } from "playwright/test";

// The creation flow talks to /api/invitations. These tests never touch the real backend (the dev and production
// builds point at the live Supabase project, so a stray request would create real rows): every /api/** call is
// answered here, and anything not mocked is recorded in `unmocked` so a spec can fail on it.
export const INVITATION_ID = "11111111-1111-4111-8111-111111111111"; // the editor route only accepts a UUID
export const EDIT_KEY = "e2e-edit-key-0123456789abcdef";

type Json = Record<string, unknown>;
export type MockApi = {
  /** Bodies of POST /api/invitations, in order. */
  created: Json[];
  /** PATCH /api/invitations/:id bodies with the X-Edit-Key header each one carried. */
  patches: { body: Json; key: string | null }[];
  /** "METHOD /path" of API calls nobody mocked. Must stay empty. */
  unmocked: string[];
  /** The next POST answers with this status and a problem+json `detail`. */
  failNextCreate(status: number, detail: string): void;
  /** Every POST waits this long before answering (to test double clicks). */
  delayCreate(ms: number): void;
  /** What GET /api/invitations/:id returns: null until something was created or `seed` ran. */
  current(): Json | null;
  /** Pretend the invitation already exists (for "open with an edit link" tests). */
  seed(content: Json, templateId?: string): void;
};

export async function mockApi(page: Page): Promise<MockApi> {
  let dto: Json | null = null;
  let failure: { status: number; detail: string } | null = null;
  let delay = 0;
  const mock: MockApi = {
    created: [],
    patches: [],
    unmocked: [],
    failNextCreate: (status, detail) => void (failure = { status, detail }),
    delayCreate: (ms) => void (delay = ms),
    current: () => dto,
    seed(content, templateId = "song-hy") {
      dto = { id: INVITATION_ID, slug: "e2e-thiep", templateId, content, published: false, publishedAt: null, updatedAt: new Date().toISOString() };
    },
  };
  const json = (status: number, body: unknown) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

  // Registered first = lowest priority: Playwright tries the most recently added route first.
  await page.route("**/api/**", (route) => {
    const req = route.request();
    mock.unmocked.push(`${req.method()} ${new URL(req.url()).pathname}`);
    return route.fulfill(json(501, { detail: "E2E: endpoint chưa được mock" }));
  });

  await page.route("**/api/invitations", async (route) => {
    const req = route.request();
    if (req.method() !== "POST") return route.fallback();
    if (delay) await new Promise((r) => setTimeout(r, delay));
    if (failure) {
      const { status, detail } = failure;
      failure = null;
      return route.fulfill(json(status, { detail }));
    }
    const body = req.postDataJSON() as Json;
    mock.created.push(body);
    mock.seed(body.content as Json, String(body.templateId));
    return route.fulfill(json(201, { id: INVITATION_ID, slug: "e2e-thiep", key: EDIT_KEY }));
  });

  await page.route(`**/api/invitations/${INVITATION_ID}`, async (route) => {
    const req = route.request();
    const key = req.headers()["x-edit-key"] ?? null;
    if (key !== EDIT_KEY || !dto) return route.fulfill(json(key ? 404 : 401, { detail: "Không mở được thiệp." }));
    if (req.method() === "PATCH") {
      const body = req.postDataJSON() as Json;
      mock.patches.push({ body, key });
      dto = { ...dto, ...(body.templateId ? { templateId: body.templateId } : {}), ...(body.content ? { content: body.content } : {}), ...(body.slug ? { slug: body.slug } : {}) };
      if (typeof body.published === "boolean") dto = { ...dto, published: body.published, publishedAt: body.published ? new Date().toISOString() : dto.publishedAt };
      dto = { ...dto, updatedAt: new Date().toISOString() };
    }
    return route.fulfill(json(200, dto));
  });

  return mock;
}

// Khu quản trị (/admin). Đăng ký SAU mockApi() nên các route này ưu tiên cao
// hơn catch-all `**/api/**` (Playwright thử route mới nhất trước), còn mọi
// /api/** khác vẫn rơi vào `unmocked` để spec fail tường minh.
// Mặc định me = 401 (chưa đăng nhập — đúng với server guard khi không có
// session thật); gọi setMe(200) khi muốn giả lập đã login ở tầng client.
// Lưu ý: guard (panel)/layout.tsx chạy server-side nên mock me KHÔNG mở được
// trang panel — e2e panel cần session Supabase thật (xem e2e/admin.spec.ts).
export const ADMIN_EMAIL = "admin@moc.vn";
export const ADMIN_PASSWORD = "admin";
const ADMIN_LOGIN_ERROR = "Email hoặc mật khẩu chưa đúng.";

export type AdminMeStatus = 200 | 401 | 403;
export type MockAdminApi = {
  /** Đổi trạng thái GET /api/admin/me giữa chừng. */
  setMe(status: AdminMeStatus): void;
  /** Body các POST /api/admin/login, theo thứ tự. */
  logins: { email: string; password: string }[];
  userPatches: { id: string; body: Json }[];
  deletedUsers: string[];
  cardPatches: { id: string; body: Json }[];
  deletedCards: string[];
  templatePatches: { id: string; body: Json }[];
};

type AdminUserSeed = {
  id: string; email: string; name: string; createdAt: string; inviteCount: number;
  status: "active" | "suspended";
};
type AdminCardSeed = {
  id: string; slug: string; couple: string; templateId: string; templateName: string;
  ownerEmail: string; createdAt: string; published: boolean; flagged: boolean; confirmed: string;
};
type AdminTemplateSeed = {
  id: string; name: string; style: string; badge: "" | "MỚI" | "HOT"; hidden: boolean; pop: number;
};

const cardStatusOf = (row: AdminCardSeed): "published" | "draft" | "reported" =>
  row.flagged ? "reported" : row.published ? "published" : "draft";
const cardDto = (row: AdminCardSeed): Json => ({
  id: row.id, slug: row.slug, couple: row.couple, templateId: row.templateId, templateName: row.templateName,
  ownerEmail: row.ownerEmail, createdAt: row.createdAt, status: cardStatusOf(row), confirmed: row.confirmed,
});

function paginate<T>(rows: T[], page: number, perPage: number): { items: T[]; page: number; pageCount: number; total: number } {
  const safePage = Math.max(1, Math.floor(page) || 1);
  const safePer = Math.min(50, Math.max(1, Math.floor(perPage) || 8));
  const pageCount = Math.max(1, Math.ceil(rows.length / safePer));
  const current = Math.min(safePage, pageCount);
  return { items: rows.slice((current - 1) * safePer, current * safePer), page: current, pageCount, total: rows.length };
}

export async function mockAdminApi(page: Page, mock: MockApi, opts?: { me?: AdminMeStatus }): Promise<MockAdminApi> {
  let meStatus: AdminMeStatus = opts?.me ?? 401;
  const admin: MockAdminApi = {
    setMe: (status) => void (meStatus = status),
    logins: [], userPatches: [], deletedUsers: [], cardPatches: [], deletedCards: [], templatePatches: [],
  };
  const json = (status: number, body: unknown) => ({ status, contentType: "application/json", body: JSON.stringify(body) });
  const onAdmin = (suffix: string) => (url: URL) => url.pathname === `/api/admin/${suffix}` || url.pathname.startsWith(`/api/admin/${suffix}/`);

  let users: AdminUserSeed[] = [
    { id: "u-01", email: "linh.tran@example.com", name: "Trần Thảo Linh", createdAt: "2026-09-28T02:00:00.000Z", inviteCount: 3, status: "active" },
    { id: "u-02", email: "minh.hoang@example.com", name: "Hoàng Minh Quân", createdAt: "2026-09-25T02:00:00.000Z", inviteCount: 1, status: "active" },
    { id: "u-03", email: "anh.thu@example.com", name: "Nguyễn Anh Thư", createdAt: "2026-09-20T02:00:00.000Z", inviteCount: 2, status: "suspended" },
    { id: "u-04", email: "duc.long@example.com", name: "Phạm Đức Long", createdAt: "2026-09-18T02:00:00.000Z", inviteCount: 0, status: "active" },
    { id: "u-05", email: "phuong.anh@example.com", name: "Đỗ Phương Anh", createdAt: "2026-09-15T02:00:00.000Z", inviteCount: 5, status: "active" },
    { id: "u-06", email: "quoc.bao@example.com", name: "Lê Quốc Bảo", createdAt: "2026-09-12T02:00:00.000Z", inviteCount: 1, status: "active" },
    { id: "u-07", email: "thanh.ha@example.com", name: "Vũ Thanh Hà", createdAt: "2026-09-10T02:00:00.000Z", inviteCount: 0, status: "suspended" },
    { id: "u-08", email: "hai.yen@example.com", name: "Bùi Hải Yến", createdAt: "2026-09-08T02:00:00.000Z", inviteCount: 2, status: "active" },
    { id: "u-09", email: "tuan.kiet@example.com", name: "Ngô Tuấn Kiệt", createdAt: "2026-09-05T02:00:00.000Z", inviteCount: 1, status: "active" },
    { id: "u-10", email: "my.duyen@example.com", name: "Trịnh Mỹ Duyên", createdAt: "2026-09-01T02:00:00.000Z", inviteCount: 0, status: "active" },
  ];

  let cards: AdminCardSeed[] = [
    { id: "c-01", slug: "linh-quan-0926", couple: "Thảo Linh & Minh Quân", templateId: "song-hy", templateName: "Song Hỷ", ownerEmail: "linh.tran@example.com", createdAt: "2026-09-28T03:00:00.000Z", published: true, flagged: false, confirmed: "96/180" },
    { id: "c-02", slug: "anh-long-0926", couple: "Anh Thư & Đức Long", templateId: "hoa-cuoi", templateName: "Hoa Cưới", ownerEmail: "anh.thu@example.com", createdAt: "2026-09-20T03:00:00.000Z", published: true, flagged: true, confirmed: "12/60" },
    { id: "c-03", slug: "phuong-bao-nhap", couple: "Thiệp chưa đặt tên", templateId: "toi-gian", templateName: "Tối Giản", ownerEmail: "phuong.anh@example.com", createdAt: "2026-09-15T03:00:00.000Z", published: false, flagged: false, confirmed: "—" },
    { id: "c-04", slug: "bao-ha-0926", couple: "Quốc Bảo & Thanh Hà", templateId: "co-dien", templateName: "Cổ Điển", ownerEmail: "quoc.bao@example.com", createdAt: "2026-09-12T03:00:00.000Z", published: true, flagged: false, confirmed: "40/120" },
    { id: "c-05", slug: "yen-kiet-nhap", couple: "Hải Yến & Tuấn Kiệt", templateId: "lang-man", templateName: "Lãng Mạn", ownerEmail: "hai.yen@example.com", createdAt: "2026-09-08T03:00:00.000Z", published: false, flagged: false, confirmed: "—" },
    { id: "c-06", slug: "duyen-khach-0926", couple: "Mỹ Duyên & Khách Mời", templateId: "hien-dai", templateName: "Hiện Đại", ownerEmail: "Khách vãng lai", createdAt: "2026-09-05T03:00:00.000Z", published: true, flagged: true, confirmed: "5/50" },
    { id: "c-07", slug: "long-anh-0926", couple: "Đức Long & Phương Anh", templateId: "song-hy", templateName: "Song Hỷ", ownerEmail: "duc.long@example.com", createdAt: "2026-09-03T03:00:00.000Z", published: true, flagged: false, confirmed: "70/150" },
    { id: "c-08", slug: "kiet-duyen-nhap", couple: "Tuấn Kiệt & Mỹ Duyên", templateId: "hoa-cuoi", templateName: "Hoa Cưới", ownerEmail: "tuan.kiet@example.com", createdAt: "2026-09-02T03:00:00.000Z", published: false, flagged: false, confirmed: "—" },
    { id: "c-09", slug: "ha-bao-0926", couple: "Thanh Hà & Quốc Bảo", templateId: "truyen-thong", templateName: "Truyền Thống", ownerEmail: "thanh.ha@example.com", createdAt: "2026-09-01T03:00:00.000Z", published: true, flagged: false, confirmed: "30/90" },
  ];

  let templates: AdminTemplateSeed[] = [
    { id: "song-hy", name: "Song Hỷ Đỏ", style: "Truyền thống", badge: "HOT", hidden: false, pop: 98 },
    { id: "hoa-cuoi", name: "Vườn Hoa Cưới", style: "Hoa", badge: "MỚI", hidden: false, pop: 91 },
    { id: "toi-gian", name: "Tối Giản Trắng", style: "Tối giản", badge: "", hidden: false, pop: 85 },
    { id: "co-dien", name: "Cổ Điển Vàng", style: "Cổ điển", badge: "", hidden: false, pop: 80 },
    { id: "lang-man", name: "Lãng Mạn Hồng", style: "Lãng mạn", badge: "HOT", hidden: false, pop: 77 },
    { id: "hien-dai", name: "Hiện Đại Xanh", style: "Hiện đại", badge: "", hidden: true, pop: 70 },
    { id: "truyen-thong", name: "Áo Dài Xưa", style: "Truyền thống", badge: "", hidden: false, pop: 66 },
    { id: "sen-hong", name: "Sen Hồng", style: "Hoa", badge: "", hidden: false, pop: 60 },
    { id: "giay-mo", name: "Giấy Mờ", style: "Tối giản", badge: "MỚI", hidden: false, pop: 55 },
    { id: "hoang-gia", name: "Hoàng Gia", style: "Cổ điển", badge: "", hidden: true, pop: 50 },
    { id: "hoang-hon", name: "Hoàng Hôn", style: "Lãng mạn", badge: "", hidden: false, pop: 44 },
    { id: "duong-thang", name: "Đường Thẳng", style: "Hiện đại", badge: "", hidden: false, pop: 38 },
    { id: "que-huong", name: "Quê Hương", style: "Truyền thống", badge: "", hidden: false, pop: 30 },
  ];

  await page.route(onAdmin("login"), async (route) => {
    const req = route.request();
    if (req.method() !== "POST") return route.fallback();
    const body = req.postDataJSON() as { email?: unknown; password?: unknown };
    admin.logins.push({ email: String(body.email ?? ""), password: String(body.password ?? "") });
    if (body.email === ADMIN_EMAIL && body.password === ADMIN_PASSWORD) {
      return route.fulfill(json(200, { user: { id: "admin-1", email: ADMIN_EMAIL, name: "Quản Trị Mộc" } }));
    }
    return route.fulfill(json(401, { detail: ADMIN_LOGIN_ERROR }));
  });

  await page.route(onAdmin("me"), (route) => {
    if (route.request().method() !== "GET") return route.fallback();
    if (meStatus === 200) {
      return route.fulfill(json(200, { id: "admin-1", email: ADMIN_EMAIL, name: "Quản Trị Mộc", isAdmin: true }));
    }
    return route.fulfill(json(meStatus, { detail: meStatus === 401 ? "Chưa đăng nhập." : "Tài khoản không có quyền quản trị." }));
  });

  await page.route(onAdmin("stats"), (route) => {
    if (route.request().method() !== "GET") return route.fallback();
    if (meStatus !== 200) return route.fulfill(json(meStatus, { detail: "Không có quyền." }));
    const total = users.length;
    const suspended = users.filter((u) => u.status === "suspended").length;
    return route.fulfill(json(200, {
      users: { total, active: total - suspended, suspended },
      cards: {
        total: cards.length,
        published: cards.filter((c) => cardStatusOf(c) === "published").length,
        draft: cards.filter((c) => cardStatusOf(c) === "draft").length,
        flagged: cards.filter((c) => cardStatusOf(c) === "reported").length,
      },
      pendingWishes: 7,
      usersWeekly: [3, 5, 2, 6, 4, 7, 5, 8],
      cardsWeekly: [1, 2, 4, 3, 5, 2, 6, 4],
      topTemplates: [
        { templateId: "song-hy", name: "Song Hỷ Đỏ", count: 12 },
        { templateId: "hoa-cuoi", name: "Vườn Hoa Cưới", count: 9 },
      ],
      recentUsers: users.slice(0, 5).map((u) => ({ id: u.id, email: u.email, name: u.name, createdAt: u.createdAt })),
      recentCards: cards.slice(0, 5).map((c) => ({
        id: c.id, slug: c.slug, couple: c.couple, templateId: c.templateId,
        status: cardStatusOf(c), confirmed: c.confirmed, createdAt: c.createdAt,
      })),
    }));
  });

  await page.route(onAdmin("users"), async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (meStatus !== 200) return route.fulfill(json(meStatus, { detail: "Không có quyền." }));
    const id = url.pathname.slice("/api/admin/users/".length);
    if (id) {
      const row = users.find((u) => u.id === id);
      if (!row) return route.fulfill(json(404, { detail: "Không tìm thấy người dùng." }));
      if (req.method() === "PATCH") {
        const body = req.postDataJSON() as Json;
        admin.userPatches.push({ id, body });
        if (body.action === "ban") row.status = "suspended";
        if (body.action === "unban") row.status = "active";
        return route.fulfill(json(200, row));
      }
      if (req.method() === "DELETE") {
        admin.deletedUsers.push(id);
        users = users.filter((u) => u.id !== id);
        return route.fulfill({ status: 204, contentType: "application/json", body: "" });
      }
      return route.fallback();
    }
    if (req.method() !== "GET") return route.fallback();
    const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    const status = url.searchParams.get("status") ?? "all";
    const filtered = users.filter((u) => {
      if (status !== "all" && u.status !== status) return false;
      return !q || u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q);
    });
    const paged = paginate(filtered, Number(url.searchParams.get("page") ?? 1), Number(url.searchParams.get("perPage") ?? 8));
    return route.fulfill(json(200, {
      ...paged,
      weekly: [1, 2, 1, 3, 2, 4, 3, 5],
      summary: {
        total: users.length,
        active: users.filter((u) => u.status === "active").length,
        suspended: users.filter((u) => u.status === "suspended").length,
        cards: cards.length,
      },
    }));
  });

  await page.route(onAdmin("cards"), async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (meStatus !== 200) return route.fulfill(json(meStatus, { detail: "Không có quyền." }));
    const id = url.pathname.slice("/api/admin/cards/".length);
    if (id) {
      const row = cards.find((c) => c.id === id);
      if (!row) return route.fulfill(json(404, { detail: "Không tìm thấy thiệp." }));
      if (req.method() === "PATCH") {
        const body = req.postDataJSON() as Json;
        admin.cardPatches.push({ id, body });
        if (typeof body.published === "boolean") row.published = body.published;
        if (typeof body.is_flagged === "boolean") row.flagged = body.is_flagged;
        return route.fulfill(json(200, cardDto(row)));
      }
      if (req.method() === "DELETE") {
        admin.deletedCards.push(id);
        cards = cards.filter((c) => c.id !== id);
        return route.fulfill({ status: 204, contentType: "application/json", body: "" });
      }
      return route.fallback();
    }
    if (req.method() !== "GET") return route.fallback();
    const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    const status = url.searchParams.get("status") ?? "all";
    const filtered = cards.filter((c) => {
      if (status !== "all" && cardStatusOf(c) !== status) return false;
      return !q || c.slug.toLowerCase().includes(q) || c.couple.toLowerCase().includes(q) || c.templateId.toLowerCase().includes(q);
    });
    return route.fulfill(json(200, paginate(filtered, Number(url.searchParams.get("page") ?? 1), Number(url.searchParams.get("perPage") ?? 8))));
  });

  await page.route(onAdmin("templates"), async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (meStatus !== 200) return route.fulfill(json(meStatus, { detail: "Không có quyền." }));
    const id = url.pathname.slice("/api/admin/templates/".length);
    if (id) {
      const row = templates.find((t) => t.id === id);
      if (!row) return route.fulfill(json(404, { detail: "Không tìm thấy mẫu." }));
      if (req.method() === "PATCH") {
        const body = req.postDataJSON() as Json;
        admin.templatePatches.push({ id, body });
        if (typeof body.name === "string") row.name = body.name;
        if (typeof body.style === "string") row.style = body.style;
        if (typeof body.badge === "string") row.badge = body.badge as AdminTemplateSeed["badge"];
        if (typeof body.hidden === "boolean") row.hidden = body.hidden;
        return route.fulfill(json(200, row));
      }
      return route.fallback();
    }
    if (req.method() !== "GET") return route.fallback();
    const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    const style = url.searchParams.get("style") ?? "all";
    const filtered = templates
      .filter((t) => (style === "all" || t.style === style) && (!q || t.name.toLowerCase().includes(q)))
      .sort((a, b) => b.pop - a.pop);
    return route.fulfill(json(200, paginate(filtered, Number(url.searchParams.get("page") ?? 1), Number(url.searchParams.get("perPage") ?? 12))));
  });

  return admin;
}
