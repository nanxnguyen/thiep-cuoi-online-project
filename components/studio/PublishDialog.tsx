"use client";

import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { publishIssues, type Content } from "@/lib/content";
import { editLink } from "@/lib/local-invitations";
import { celebrate } from "@/lib/celebrate";
import { isValidSlug, slugify } from "@/lib/slug";

export type PublishMeta = { slug: string; published: boolean; publishedAt: string | null };

type Props = {
  open: boolean;
  onClose: () => void;
  id: string;
  editKey: string;
  content: Content;
  meta: PublishMeta;
  /** Saves the draft now and resolves once the server has it: publishing checks the SAVED content. */
  flush: () => Promise<void>;
  onMeta: (meta: PublishMeta) => void;
  /** Completion % and the parts still missing (lib/editor-sections), shown before the first publish like Editor v3. */
  pct?: number;
  missing?: { label: string; why: string; go: () => void }[];
};

// Publishing dialog: choose the public address (until the first publish), see what still blocks publishing,
// then share the link. Uses the native <dialog> so focus trapping, ESC and the backdrop come for free.
export function PublishDialog({ open, onClose, id, editKey, content, meta, flush, onMeta, pct, missing = [] }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const confetti = useRef<HTMLCanvasElement>(null);
  const [slug, setSlug] = useState(meta.slug);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      const suggestion = slugify([content.couple.groom.name, content.couple.bride.name].filter((n) => n.trim()).join(" "));
      setSlug(!meta.publishedAt && isValidSlug(suggestion) ? suggestion : meta.slug);
      setError("");
      d.showModal();
    }
    if (!open && d.open) d.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the suggestion is computed once, when the dialog opens
  }, [open]);

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const publicUrl = `${origin}/invite/${meta.slug}`;
  const issues = publishIssues(content);
  const locked = meta.publishedAt !== null;
  const slugOk = locked || isValidSlug(slug);

  async function apply(patch: { slug?: string; published: boolean }) {
    setBusy(true);
    setError("");
    try {
      await flush();
      const dto = await api.updateInvitation(id, editKey, patch);
      onMeta({ slug: dto.slug, published: dto.published, publishedAt: dto.publishedAt });
      if (patch.published) void celebrate(confetti.current);
    } catch (e) {
      setError(e instanceof ApiError || e instanceof Error ? e.message : "Chưa thực hiện được, bạn thử lại nhé.");
    } finally {
      setBusy(false);
    }
  }

  async function copy(what: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(what);
    window.setTimeout(() => setCopied(""), 2000);
  }

  return (
    <dialog className="dlg" ref={dialog} onClose={onClose} aria-labelledby="publish-title">
      <canvas className="confetti" ref={confetti} aria-hidden="true" />
      <div className="dlg__body">
        <button type="button" className="dlg__close" aria-label="Đóng" onClick={onClose}>
          ×
        </button>

        {meta.published ? (
          <>
            <p className="eyebrow">Đã xuất bản</p>
            <h2 id="publish-title">
              Thiệp của bạn <em>đã sẵn sàng.</em>
            </h2>
            <p style={{ color: "var(--muted)", margin: "0 0 8px" }}>Gửi link này cho khách. Muốn thiệp chào đúng tên từng hộ, thêm khách ở tab Khách rồi sao chép link riêng (<code>?g=…</code>) của từng người.</p>
            <div className="link-row">
              <input className="input" readOnly value={publicUrl} aria-label="Link thiệp" onFocus={(e) => e.currentTarget.select()} />
              <button type="button" className="button-primary" onClick={() => copy("public", publicUrl)}>
                {copied === "public" ? "Đã chép" : "Chép link"}
              </button>
            </div>
            {/* QR of the link, drawn by a free public service (a local generator comes with the tools phase). */}
            <img
              className="qr"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=4&data=${encodeURIComponent(publicUrl)}`}
              alt="Mã QR dẫn tới thiệp"
              width={168}
              height={168}
            />
            <div className="share-row">
              <a className="button-ghost" href={publicUrl} target="_blank" rel="noopener noreferrer">
                Mở thiệp
              </a>
              {typeof navigator !== "undefined" && "share" in navigator && (
                <button type="button" className="button-ghost" onClick={() => navigator.share({ title: "Thiệp cưới", url: publicUrl }).catch(() => undefined)}>
                  Chia sẻ
                </button>
              )}
              <button type="button" className="button-ghost" onClick={() => copy("edit", editLink(origin, id, editKey))}>
                {copied === "edit" ? "Đã chép" : "Chép link chỉnh sửa"}
              </button>
              <button type="button" className="link-quiet" disabled={busy} onClick={() => apply({ published: false })}>
                Gỡ xuất bản
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="eyebrow">Xuất bản</p>
            <h2 id="publish-title">
              Gửi thiệp <em>cho khách.</em>
            </h2>
            {pct !== undefined && (
              <div className="pub-check">
                <p>Thiệp đã hoàn thiện {pct}%. Bạn vẫn có thể sửa sau khi xuất bản, link giữ nguyên.</p>
                <div className="ed-progress" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>
                {missing.length > 0 && (
                  <ul>
                    {missing.map((m) => (
                      <li key={m.label}>
                        <span aria-hidden="true">!</span>
                        <div><strong>{m.label}</strong><small>{m.why}</small></div>
                        <button type="button" className="ed-chipbtn" onClick={m.go}>Bổ sung</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <p style={{ color: "var(--muted)", margin: "0 0 20px" }}>Sau khi xuất bản, ai có link cũng mở được thiệp. Bạn vẫn sửa được bất cứ lúc nào, thiệp cập nhật ngay.</p>
            {issues.length > 0 && (
              <ul className="issues" role="alert">
                {issues.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            )}
            <div className="field">
              <label htmlFor="slug">Địa chỉ thiệp</label>
              <div className="link-row" style={{ margin: 0, alignItems: "center" }}>
                <span style={{ color: "var(--muted)", fontSize: 14 }}>{origin.replace(/^https?:\/\//, "")}/invite/</span>
                <input id="slug" className="input" value={slug} disabled={locked} maxLength={40} onChange={(e) => setSlug(slugify(e.target.value))} />
              </div>
              <small>{locked ? "Địa chỉ đã khoá từ lần xuất bản đầu để link cũ không bị hỏng." : "Chữ thường, số và dấu gạch ngang. Sau lần xuất bản đầu sẽ không đổi được."}</small>
              {!slugOk && (
                <small role="alert" style={{ color: "var(--accent)" }}>
                  Địa chỉ cần 3 đến 40 ký tự, ví dụ khoa-va-lan.
                </small>
              )}
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="actions" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="button-primary"
                disabled={busy || issues.length > 0 || !slugOk}
                onClick={() => apply({ slug: locked || slug === meta.slug ? undefined : slug, published: true })}
              >
                {busy ? "Đang xuất bản…" : "Xuất bản thiệp"}
              </button>
              <button type="button" className="button-ghost" onClick={onClose}>
                Để sau
              </button>
            </div>
          </>
        )}
        {meta.published && error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </dialog>
  );
}
