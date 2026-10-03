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
