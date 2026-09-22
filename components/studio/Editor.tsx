"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { api, ApiError } from "@/lib/api";
import { persistable, type Content } from "@/lib/content";
import { createLocalStore, invitationTitle, parseEditLink } from "@/lib/local-invitations";
import { DEFAULT_TEMPLATE_ID, getTemplate } from "@/lib/templates";
import { GuestsPanel } from "./GuestsPanel";
import { CouplePanel } from "./panels/CouplePanel";
import { EventsPanel } from "./panels/EventsPanel";
import { GiftPanel } from "./panels/GiftPanel";
import { MediaPanel } from "./panels/MediaPanel";
import { RsvpPanel } from "./panels/RsvpPanel";
import { TemplatePanel } from "./panels/TemplatePanel";
import { PreviewFrame } from "./PreviewFrame";
import { PublishDialog, type PublishMeta } from "./PublishDialog";
import { ResponsesPanel } from "./ResponsesPanel";
import { useAutosave, type SaveStatus } from "./useAutosave";

type Draft = { templateId: string; content: Content };
type Gate = "loading" | "nokey" | "notfound" | "error" | "ready";

const TABS = [
  { id: "couple", label: "Cặp đôi" },
  { id: "events", label: "Sự kiện" },
  { id: "media", label: "Ảnh và nhạc" },
  { id: "rsvp", label: "Tham dự" },
  { id: "guests", label: "Khách mời" },
  { id: "gift", label: "Mừng cưới" },
  { id: "template", label: "Mẫu" },
  { id: "responses", label: "Phản hồi" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const STATUS: Record<SaveStatus, string> = { idle: "Đã lưu", saved: "Đã lưu", dirty: "Chưa lưu…", saving: "Đang lưu…", error: "Chưa lưu được" };

// The owner's workspace: panels on the left edit a draft, the phone on the right renders that same draft with the real
// invitation component. Every edit replaces the draft, and useAutosave sends it to the backend a moment later.
export function Editor({ id }: { id: string }) {
  const [gate, setGate] = useState<Gate>("loading");
  const [errorText, setErrorText] = useState("");
  const [editKey, setEditKey] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [meta, setMeta] = useState<PublishMeta | null>(null);
  const [tab, setTab] = useState<TabId>("couple");
  const [view, setView] = useState<"edit" | "preview">("edit");
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

  const setContent = (content: Content) => setDraft((d) => d && { ...d, content });
  const setTemplate = (templateId: string) => setDraft((d) => d && { ...d, templateId });

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

  return (
    <div className="studio" data-view={view}>
      <header className="studio-bar">
        <Link className="studio-bar__back" href="/studio">
          <span aria-hidden="true">←</span>
          <span>Thiệp của tôi</span>
        </Link>
        <p className="studio-bar__title">{invitationTitle(draft.content.couple)}</p>
        <span className="save-status" data-state={autosave.status} role="status">
          {STATUS[autosave.status]}
          {autosave.status === "error" && (
            <button type="button" onClick={autosave.retry}>
              Thử lại
            </button>
          )}
        </span>
        <button type="button" className="button-primary" onClick={() => setPublishOpen(true)}>
          {meta.published ? "Chia sẻ" : "Xuất bản"}
        </button>
      </header>

      <main className="studio-body">
        <section className="studio-left" aria-label="Chỉnh sửa">
          <div className="studio-tabs" role="tablist" aria-label="Các phần của thiệp">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls="studio-panel"
                className="studio-tab"
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="studio-panel" id="studio-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={0}>
            {/* Panels stay mounted and are only hidden: an upload in flight must survive a tab switch. */}
            <div className="studio-pane" hidden={tab !== "couple"}>
              <CouplePanel content={draft.content} onChange={setContent} media={media} />
            </div>
            <div className="studio-pane" hidden={tab !== "events"}>
              <EventsPanel content={draft.content} onChange={setContent} />
            </div>
            <div className="studio-pane" hidden={tab !== "media"}>
              <MediaPanel content={draft.content} onChange={setContent} media={media} />
            </div>
            <div className="studio-pane" hidden={tab !== "rsvp"}>
              <RsvpPanel content={draft.content} onChange={setContent} />
            </div>
            {tab === "guests" && (
              <div className="studio-pane">
                <GuestsPanel id={id} editKey={editKey} published={meta.published} />
              </div>
            )}
            <div className="studio-pane" hidden={tab !== "gift"}>
              <GiftPanel content={draft.content} onChange={setContent} />
            </div>
            <div className="studio-pane" hidden={tab !== "template"}>
              <TemplatePanel templateId={draft.templateId} onTemplate={setTemplate} />
            </div>
            {tab === "responses" && (
              <div className="studio-pane">
                <ResponsesPanel id={id} editKey={editKey} questions={draft.content.rsvp.questions} published={meta.published} />
              </div>
            )}
          </div>
        </section>

        <section className="studio-right" aria-label="Xem trước">
          <PreviewFrame>
            <InvitationRenderer mode="preview" gate={false} template={template} content={draft.content} />
          </PreviewFrame>
        </section>
      </main>

      <div className="studio-switch" role="group" aria-label="Chế độ xem">
        <button type="button" aria-pressed={view === "edit"} onClick={() => setView("edit")}>
          Sửa
        </button>
        <button type="button" aria-pressed={view === "preview"} onClick={() => setView("preview")}>
          Xem thiệp
        </button>
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
      />
    </div>
  );
}
