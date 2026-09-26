"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { api, ApiError } from "@/lib/api";
import { persistable, type Content } from "@/lib/content";
import { createLocalStore, invitationTitle, parseEditLink } from "@/lib/local-invitations";
import { DEFAULT_TEMPLATE_ID, getTemplate } from "@/lib/templates";
import { SECTION_GROUPS, SECTIONS, completion, missingReason, type SectionItem } from "@/lib/editor-sections";
import { GuestsPanel } from "./GuestsPanel";
import { CouplePanel } from "./panels/CouplePanel";
import { EventsPanel } from "./panels/EventsPanel";
import { GiftPanel } from "./panels/GiftPanel";
import { MediaPanel } from "./panels/MediaPanel";
import { RsvpPanel } from "./panels/RsvpPanel";
import { TemplatePanel } from "./panels/TemplatePanel";
import { PublishDialog, type PublishMeta } from "./PublishDialog";
import { ResponsesPanel } from "./ResponsesPanel";
import { useAutosave, type SaveStatus } from "./useAutosave";

type Draft = { templateId: string; content: Content };
type Gate = "loading" | "nokey" | "notfound" | "error" | "ready";

// Sections with an on/off switch that maps to a real content flag (the design has more; the rest wait for Supabase).
const TOGGLES: Record<string, (c: Content) => boolean> = {
  rsvp: (c) => c.rsvp.enabled,
  guestbook: (c) => c.guestbook.enabled,
  gift: (c) => c.gift.enabled,
};
const toggle = (key: string, c: Content): Content =>
  key === "rsvp" ? { ...c, rsvp: { ...c.rsvp, enabled: !c.rsvp.enabled } }
  : key === "guestbook" ? { ...c, guestbook: { enabled: !c.guestbook.enabled } }
  : key === "gift" ? { ...c, gift: { ...c.gift, enabled: !c.gift.enabled } }
  : c;
const GUESTS = ["Bạn thân mến", "Cô Lan & gia đình", "Anh Tuấn", "Chú Hải"];

const STATUS: Record<SaveStatus, string> = { idle: "Đã lưu", saved: "Đã lưu", dirty: "Chưa lưu…", saving: "Đang lưu…", error: "Chưa lưu được" };

// The owner's workspace: panels on the left edit a draft, the phone on the right renders that same draft with the real
// invitation component. Every edit replaces the draft, and useAutosave sends it to the backend a moment later.
export function Editor({ id }: { id: string }) {
  const [gate, setGate] = useState<Gate>("loading");
  const [errorText, setErrorText] = useState("");
  const [editKey, setEditKey] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [meta, setMeta] = useState<PublishMeta | null>(null);
  const [sec, setSec] = useState<SectionItem>(SECTIONS.find((x) => x.key === "couple")!);
  const [mode, setMode] = useState<"edit" | "guest">("edit");
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [sheet, setSheet] = useState<null | "outline" | "form">(null);
  const [guestIdx, setGuestIdx] = useState(1);
  const [narrow, setNarrow] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const metaRef = useRef<PublishMeta | null>(null);
  metaRef.current = meta;
  const keyRef = useRef("");
  keyRef.current = editKey;

  const autosave = useAutosave<Draft>(
    draft,
    async (d, { keepalive }) => {
      const dto = await api.updateInvitation(id, keyRef.current, { templateId: d.templateId, content: persistable(d.content) }, { keepalive });
      createLocalStore(window.localStorage).upsert({
        id,
        slug: metaRef.current?.slug ?? dto.slug,
        key: keyRef.current,
        title: invitationTitle(d.content.couple),
        updatedAt: dto.updatedAt,
      });
    },
    { enabled: gate === "ready" },
  );

  useEffect(() => {
    let cancelled = false;
    const store = createLocalStore(window.localStorage);
    const fromLink = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("k");
    const key = fromLink || store.get(id)?.key || "";
    if (!key) {
      setGate("nokey");
      return;
    }
    setEditKey(key);
    api
      .getInvitation(id, key)
      .then((dto) => {
        if (cancelled) return;
        const initial: Draft = { templateId: dto.templateId, content: dto.content };
        autosave.markSaved(initial);
        setDraft(initial);
        setMeta({ slug: dto.slug, published: dto.published, publishedAt: dto.publishedAt });
        store.upsert({ id, slug: dto.slug, key, title: invitationTitle(dto.content.couple), updatedAt: dto.updatedAt });
        setGate("ready");
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) setGate("nokey");
        else if (e instanceof ApiError && e.status === 404) setGate("notfound");
        else {
          setErrorText(e instanceof Error ? e.message : "");
          setGate("error");
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per invitation id
  }, [id]);

  // < 1024px: preview full screen, outline and form open as bottom sheets (design/Studio Editor v3).
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Selecting a part scrolls the form to its PanelSection and the preview to the matching block, marked "ĐANG SỬA".
  useEffect(() => {
    if (sec.anchor) formRef.current?.querySelector(`[data-section="${sec.anchor}"]`)?.scrollIntoView({ block: "start", behavior: "smooth" });
    else formRef.current?.scrollTo({ top: 0 });
  }, [sec]);
  useEffect(() => {
    const root = previewRef.current;
    if (!root) return;
    root.querySelectorAll("[data-editing]").forEach((el) => el.removeAttribute("data-editing"));
    if (mode !== "edit" || !sec.preview) return;
    const el = root.querySelector<HTMLElement>(sec.preview);
    if (!el) return;
    el.setAttribute("data-editing", "");
    const scroller = root.querySelector<HTMLElement>(".studio-preview__scroll");
    if (scroller) scroller.scrollTo({ top: el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 16, behavior: "smooth" });
  }, [sec, mode, draft]);

  const setContent = (content: Content) => setDraft((d) => d && { ...d, content });
  const setTemplate = (templateId: string) => setDraft((d) => d && { ...d, templateId, content: { ...d.content, paletteKey: "" } });
  const setPalette = (paletteKey: string) => setDraft((d) => d && { ...d, content: { ...d.content, paletteKey } });

  function submitLink(e: FormEvent) {
    e.preventDefault();
    const parsed = parseEditLink(link, window.location.origin);
    if (!parsed || parsed.id !== id) {
      setLinkError("Link này không phải của thiệp đang mở. Hãy dán đúng link chỉnh sửa của thiệp này.");
      return;
    }
    window.location.assign(`/studio/${id}#k=${parsed.key}`);
    window.location.reload();
  }

  if (gate === "loading") {
    return (
      <main className="studio-gate" aria-busy="true">
        <p className="eyebrow">Đang mở thiệp</p>
        <p className="lede" style={{ margin: "0 auto" }}>Một chút thôi…</p>
      </main>
    );
  }

  if (gate === "nokey" || gate === "notfound" || gate === "error") {
    return (
      <main className="studio-gate">
        <p className="eyebrow">{gate === "notfound" ? "Không tìm thấy thiệp" : gate === "error" ? "Chưa kết nối được" : "Cần link chỉnh sửa"}</p>
        <h1>
          {gate === "notfound" ? (
            <>
              Thiệp này <em>không còn.</em>
            </>
          ) : gate === "error" ? (
            <>
              Đường truyền <em>đang trục trặc.</em>
            </>
          ) : (
            <>
              Thiệp này cần <em>link chỉnh sửa.</em>
            </>
          )}
        </h1>
        <p className="lede" style={{ margin: "0 auto" }}>
          {gate === "nokey"
            ? "Mở thiệp bằng đúng link chỉnh sửa đã nhận khi tạo, hoặc dán link vào ô dưới đây."
            : gate === "error"
              ? errorText || "Kiểm tra kết nối mạng rồi thử lại."
              : "Kiểm tra lại đường link, hoặc quay về danh sách thiệp trên máy này."}
        </p>
        {gate === "nokey" && (
          <form className="import__form" onSubmit={submitLink}>
            <input className="input" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…/studio/…#k=…" aria-label="Link chỉnh sửa" />
            <button type="submit" className="button-primary" disabled={!link.trim()}>
              Mở thiệp
            </button>
          </form>
        )}
        {linkError && (
          <p className="form-error" role="alert">
            {linkError}
          </p>
        )}
        <div className="actions" style={{ justifyContent: "center" }}>
          {gate === "error" && (
            <button type="button" className="button-primary" onClick={() => window.location.reload()}>
              Thử lại
            </button>
          )}
          <Link className="button-ghost" href="/studio">
            Về danh sách thiệp
          </Link>
        </div>
      </main>
    );
  }

  if (!draft || !meta) return null;
  const template = getTemplate(draft.templateId) ?? getTemplate(DEFAULT_TEMPLATE_ID)!;
  const media = { invitationId: id, editKey };
  const pct = completion(draft.content);
  const missing = SECTIONS.map((x) => ({ x, why: missingReason(x.key, draft.content) })).filter((m) => m.why);
  const go = (x: SectionItem) => {
    setSec(x);
    setMode("edit");
    setSheet(narrow ? "form" : null);
  };
  // Clicking a block in the preview (edit mode) jumps to the part that edits it.
  const pickFromPreview = (e: React.MouseEvent) => {
    if (mode !== "edit") return;
    const target = e.target as HTMLElement;
    const hit = SECTIONS.find((x) => x.preview && target.closest(x.preview) && x.key === sec.key) ?? SECTIONS.find((x) => x.preview && target.closest(x.preview));
    if (!hit) return;
    e.preventDefault();
    e.stopPropagation();
    go(hit);
  };
  const isOn = (key: string) => (TOGGLES[key] ? TOGGLES[key](draft.content) : true);
  const pane = (panel: string) => ({ hidden: sec.panel !== panel });

  return (
    <div className="ed" data-mode={mode} data-sheet={sheet ?? ""}>
      <header className="ed-bar">
        <div className="ed-bar__row">
          <Link className="ed-bar__back" href="/studio">
            <span aria-hidden="true">←</span>
            <span className="ed-bar__brand">MỘC</span>
          </Link>
          <span className="ed-bar__sep" aria-hidden="true" />
          <div className="ed-bar__title">
            <strong>{invitationTitle(draft.content.couple)}</strong>
            <span className="save-status" data-state={autosave.status} role="status">
              <i aria-hidden="true" />
              {autosave.status === "saved" || autosave.status === "idle" ? "Đã lưu tự động" : STATUS[autosave.status]}
              {autosave.status === "error" && (
                <button type="button" onClick={autosave.retry}>
                  Thử lại
                </button>
              )}
            </span>
          </div>
          <div className="ed-ring" title="Mức độ hoàn thiện">
            <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
              <circle cx="17" cy="17" r="14" className="ed-ring__track" />
              <circle cx="17" cy="17" r="14" className="ed-ring__value" strokeDasharray={`${(pct / 100) * 88} 88`} />
            </svg>
            <span className="ed-ring__pct">{pct}%</span>
            {!narrow && (
              <span className="ed-ring__label">
                {pct === 100 ? "Đã hoàn thiện" : `${missing.length} mục còn thiếu`}
              </span>
            )}
          </div>
          <div className="ed-seg" role="group" aria-label="Chế độ">
            <button type="button" aria-pressed={mode === "edit"} onClick={() => setMode("edit")}>
              Chỉnh sửa
            </button>
            <button type="button" aria-pressed={mode === "guest"} onClick={() => { setMode("guest"); setSheet(null); }}>
              Xem như khách
            </button>
          </div>
          {!narrow && (
            <div className="ed-seg" role="group" aria-label="Khung xem trước">
              <button type="button" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")} title="Điện thoại" aria-label="Điện thoại">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M11 18h2" /></svg>
              </button>
              <button type="button" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")} title="Máy tính" aria-label="Máy tính">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
              </button>
            </div>
          )}
          <button type="button" className="button-primary ed-publish" onClick={() => setPublishOpen(true)}>
            {meta.published ? "Chia sẻ" : "Xuất bản"}
          </button>
        </div>
        <div className="ed-progress" aria-hidden="true">
          <i style={{ width: `${pct}%` }} />
        </div>
      </header>

      <div className="ed-grid">
        {narrow && sheet && <button type="button" className="ed-scrim" aria-label="Đóng" onClick={() => setSheet(null)} />}
        <nav className="ed-outline" aria-label="Các phần của thiệp" data-open={sheet === "outline"}>
          <div className="ed-outline__head">
            <span>Các phần của thiệp</span>
            {narrow && (
              <button type="button" aria-label="Đóng" onClick={() => setSheet(null)}>
                ×
              </button>
            )}
          </div>
          {SECTION_GROUPS.map((g) => (
            <div className="ed-outline__group" key={g.label}>
              <span>{g.label}</span>
              {g.items.map((x) => {
                const why = missingReason(x.key, draft.content);
                const state = x.blocked ? "blocked" : why ? "missing" : "done";
                return (
                  <div className="ed-item" key={x.key} data-active={sec.key === x.key} data-state={state}>
                    <button type="button" className="ed-item__main" aria-current={sec.key === x.key ? "true" : undefined} onClick={() => go(x)}>
                      <i aria-hidden="true" />
                      <span>
                        {x.label}
                        {why && <small>{why}</small>}
                        {!why && TOGGLES[x.key] && !isOn(x.key) && <small>Đang tắt</small>}
                      </span>
                    </button>
                    {TOGGLES[x.key] && (
                      <button type="button" role="switch" className="ed-switch" aria-checked={isOn(x.key)} aria-label={`Bật/tắt ${x.label}`} onClick={() => setContent(toggle(x.key, draft.content))}>
                        <i />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        <aside className="ed-form" aria-label={`Chỉnh sửa: ${sec.label}`} data-open={sheet === "form"}>
          <div className="ed-form__head">
            <div className="ed-form__top">
              {narrow && (
                <button type="button" className="ed-chipbtn" onClick={() => setSheet("outline")}>
                  ← Các phần
                </button>
              )}
              {TOGGLES[sec.key] && (
                <label className="ed-form__toggle">
                  {isOn(sec.key) ? "Đang bật" : "Đang tắt"}
                  <button type="button" role="switch" className="ed-switch" aria-checked={isOn(sec.key)} aria-label={`Bật/tắt ${sec.label}`} onClick={() => setContent(toggle(sec.key, draft.content))}>
                    <i />
                  </button>
                </label>
              )}
            </div>
            <h1>{sec.label}</h1>
            <p>{sec.desc}</p>
            {sec.blocked && <p className="ed-form__blocked">{sec.blocked}</p>}
          </div>
          <div className="ed-form__body" ref={formRef} key={sec.panel} data-off={TOGGLES[sec.key] && !isOn(sec.key) ? "" : undefined}>
            {/* Panels stay mounted and are only hidden: an upload in flight must survive a section switch. */}
            <div className="studio-pane" {...pane("couple")}>
              <CouplePanel content={draft.content} onChange={setContent} media={media} />
            </div>
            <div className="studio-pane" {...pane("events")}>
              <EventsPanel content={draft.content} onChange={setContent} />
            </div>
            <div className="studio-pane" {...pane("media")}>
              <MediaPanel content={draft.content} onChange={setContent} media={media} />
            </div>
            <div className="studio-pane" {...pane("rsvp")}>
              <RsvpPanel content={draft.content} onChange={setContent} />
            </div>
            {sec.panel === "guests" && (
              <div className="studio-pane">
                <GuestsPanel id={id} editKey={editKey} published={meta.published} />
              </div>
            )}
            <div className="studio-pane" {...pane("gift")}>
              <GiftPanel content={draft.content} onChange={setContent} />
            </div>
            <div className="studio-pane" {...pane("template")}>
              <TemplatePanel templateId={draft.templateId} paletteKey={draft.content.paletteKey} onTemplate={setTemplate} onPalette={setPalette} />
            </div>
            {sec.panel === "responses" && (
              <div className="studio-pane">
                <ResponsesPanel id={id} editKey={editKey} questions={draft.content.rsvp.questions} published={meta.published} />
              </div>
            )}
          </div>
        </aside>

        <main className="ed-canvas" ref={previewRef}>
          {mode === "guest" && (
            <div className="ed-guestbar">
              <span>Đang xem với tên</span>
              <div>
                {GUESTS.map((g, i) => (
                  <button type="button" className="chip" key={g} aria-pressed={guestIdx === i} onClick={() => setGuestIdx(i)}>
                    {g}
                  </button>
                ))}
              </div>
              <button type="button" className="ed-chipbtn ed-chipbtn--dark" onClick={() => setMode("edit")}>
                Quay lại chỉnh sửa
              </button>
            </div>
          )}
          {mode === "edit" && !narrow && <span className="ed-hint">Bấm vào bất kỳ phần nào trên thiệp để sửa</span>}
          <div className="ed-frame" data-device={narrow ? "mobile" : device}>
            {device === "desktop" && !narrow && (
              <div className="ed-frame__chrome" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>
                  moc.vn/invite/{meta.slug}
                  {mode === "guest" ? `?g=…` : ""}
                </span>
              </div>
            )}
            <div className="ed-frame__screen">
              <div className="studio-preview__scroll" onClickCapture={pickFromPreview} role="region" aria-label="Xem trước thiệp">
                <InvitationRenderer
                  key={mode === "guest" ? `guest-${guestIdx}` : "edit"}
                  mode="preview"
                  gate={mode === "guest"}
                  guestName={mode === "guest" ? GUESTS[guestIdx] : ""}
                  template={template}
                  content={draft.content}
                />
              </div>
            </div>
          </div>
          {narrow && mode === "edit" && !sheet && (
            <div className="ed-mobilebar">
              <button type="button" onClick={() => setSheet("outline")}>
                ☰ Các phần
              </button>
              <button type="button" onClick={() => setSheet("form")}>
                Sửa: {sec.label}
              </button>
            </div>
          )}
        </main>
      </div>

      <PublishDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        id={id}
        editKey={editKey}
        content={draft.content}
        meta={meta}
        flush={autosave.flush}
        onMeta={setMeta}
        pct={pct}
        missing={missing.map((m) => ({ label: m.x.label, why: m.why!, go: () => { setPublishOpen(false); go(m.x); } }))}
      />
    </div>
  );
}
