"use client";

import Link from "next/link";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { ScaledFrame } from "@/components/templates/ScaledFrame";
import { api } from "@/lib/api";
import { defaultContent, sampleContent } from "@/lib/content";
import { createLocalStore, editLink, invitationTitle, parseEditLink, type LocalInvitation } from "@/lib/local-invitations";
import { templates } from "@/lib/templates";

const when = (iso: string) => new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

// "/studio": the owner's invitations (kept in this browser), the template picker that creates a new draft, and a
// way to bring back an invitation from an edit link. There are no accounts: the edit link IS the account.
export function StudioHome({ initialTemplate }: { initialTemplate?: string }) {
  const router = useRouter();
  const [listRef] = useAutoAnimate<HTMLUListElement>();
  const [items, setItems] = useState<LocalInvitation[]>([]);
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const [importing, setImporting] = useState(false);
  const [copied, setCopied] = useState("");
  const sample = useMemo(() => sampleContent(), []);

  const store = () => createLocalStore(window.localStorage);
  useEffect(() => setItems(createLocalStore(window.localStorage).list()), []);

  async function create(templateId: string) {
    if (creating) return;
    setCreating(templateId);
    setError("");
    try {
      const made = await api.createInvitation(templateId, defaultContent());
      store().upsert({ id: made.id, slug: made.slug, key: made.key, title: "Thiệp chưa đặt tên", updatedAt: new Date().toISOString() });
      router.push(`/studio/${made.id}#k=${made.key}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa tạo được thiệp, bạn thử lại nhé.");
      setCreating(null);
    }
  }

  async function bringBack(e: FormEvent) {
    e.preventDefault();
    const parsed = parseEditLink(link, window.location.origin);
    if (!parsed) {
      setError("Link chưa đúng. Link chỉnh sửa có dạng …/studio/mã-thiệp#k=mã-khoá.");
      return;
    }
    setImporting(true);
    setError("");
    try {
      const dto = await api.getInvitation(parsed.id, parsed.key);
      store().upsert({ id: dto.id, slug: dto.slug, key: parsed.key, title: invitationTitle(dto.content.couple), updatedAt: dto.updatedAt });
      router.push(`/studio/${dto.id}#k=${parsed.key}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chưa mở được thiệp từ link này.");
      setImporting(false);
    }
  }

  async function copyEditLink(item: LocalInvitation) {
    await navigator.clipboard.writeText(editLink(window.location.origin, item.id, item.key));
    setCopied(item.id);
    window.setTimeout(() => setCopied(""), 2000);
  }

  function forget(item: LocalInvitation) {
    if (!window.confirm(`Xoá "${item.title}" khỏi danh sách trên máy này?\n\nThiệp vẫn còn trên hệ thống. Nếu bạn chưa lưu link chỉnh sửa, bạn sẽ không mở lại để sửa được.`)) return;
    store().remove(item.id);
    setItems(store().list());
  }

  return (
    <main className="section studio-home">
      <p className="eyebrow">Studio</p>
      <h1 style={{ margin: "20px 0 16px" }}>
        Thiệp của <em>bạn.</em>
      </h1>
      <p className="lede">Tạo thiệp từ một mẫu, chỉnh sửa và xem thiệp cập nhật ngay khi gõ. Mọi thay đổi tự lưu.</p>

      <aside className="notice" role="note">
        <span className="xi" aria-hidden="true">
          囍
        </span>
        <p>
          <strong>Hãy lưu link chỉnh sửa của từng thiệp.</strong> Không có tài khoản: ai giữ link này thì sửa được thiệp, và mất link là mất quyền sửa.
        </p>
      </aside>

      {items.length > 0 && (
        <section className="studio-block" aria-labelledby="mine">
          <h2 id="mine">Thiệp đã tạo</h2>
          <ul className="my-list" ref={listRef}>
            {items.map((item) => (
              <li className="card my-item" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <small>Sửa lần cuối {when(item.updatedAt)}</small>
                </div>
                <div className="my-item__actions">
                  <Link className="button-primary" href={`/studio/${item.id}#k=${item.key}`}>
                    Chỉnh sửa
                  </Link>
                  <button type="button" className="button-ghost" onClick={() => copyEditLink(item)}>
                    {copied === item.id ? "Đã chép link" : "Chép link chỉnh sửa"}
                  </button>
                  <button type="button" className="link-quiet" onClick={() => forget(item)}>
                    Xoá khỏi máy này
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="studio-block" aria-labelledby="new">
        <h2 id="new">Tạo thiệp mới</h2>
        <p className="lede" style={{ margin: "12px 0 32px" }}>
          Chọn một mẫu để bắt đầu. Đổi mẫu lúc nào cũng được, nội dung của bạn vẫn còn nguyên.
        </p>
        <div className="pick-grid">
          {templates.map((t) => (
            <button
              type="button"
              key={t.id}
              className="pick"
              data-selected={initialTemplate === t.id}
              disabled={creating !== null}
              onClick={() => create(t.id)}
            >
              <ScaledFrame className="pick__thumb">
                <InvitationRenderer only="cover" mode="preview" gate={false} template={t} content={sample} />
              </ScaledFrame>
              <span className="pick__meta">
                <strong>{t.name}</strong>
                <small>{creating === t.id ? "Đang tạo thiệp…" : t.blurb}</small>
              </span>
            </button>
          ))}
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </section>

      <section className="studio-block card import" aria-labelledby="import">
        <h2 id="import" style={{ fontSize: 24 }}>
          Đã có link chỉnh sửa?
        </h2>
        <p style={{ margin: "8px 0 18px", color: "var(--muted)" }}>Dán link để mở lại thiệp trên thiết bị này.</p>
        <form onSubmit={bringBack} className="import__form">
          <input className="input" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…/studio/…#k=…" aria-label="Link chỉnh sửa" />
          <button type="submit" className="button-primary" disabled={importing || !link.trim()}>
            {importing ? "Đang mở…" : "Mở thiệp"}
          </button>
        </form>
      </section>
    </main>
  );
}
