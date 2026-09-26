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
import { getTemplate, templates } from "@/lib/templates";

const when = (iso: string) => new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

// "/studio": the owner's invitations (kept in this browser), the template picker that creates a new draft, and a
// way to bring back an invitation from an edit link. There are no accounts: the edit link IS the account.
export function StudioHome({ initialTemplate, initialColor }: { initialTemplate?: string; initialColor?: string }) {
  const router = useRouter();
  const [listRef] = useAutoAnimate<HTMLUListElement>();
  const [items, setItems] = useState<LocalInvitation[]>([]);
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const [importing, setImporting] = useState(false);
  const [copied, setCopied] = useState("");
  const sample = useMemo(() => sampleContent(), []);
  const starting = useMemo(() => defaultContent(), []);
  const [selectedId, setSelectedId] = useState(() => getTemplate(initialTemplate || "")?.id || templates[0].id);
  const [bride, setBride] = useState("");
  const [groom, setGroom] = useState("");
  const [date, setDate] = useState(starting.events[0]?.date || "");
  const selected = getTemplate(selectedId)!;
  const selectedColor = selectedId === getTemplate(initialTemplate || "")?.id && selected.colors.includes(initialColor as typeof selected.colors[number]) ? initialColor! : "";
  const preview = { ...sample, paletteKey: selectedColor, couple: { ...sample.couple, groom: { ...sample.couple.groom, name: groom || "Chú rể" }, bride: { ...sample.couple.bride, name: bride || "Cô dâu" }, heroPhoto: "" }, events: sample.events.map((e) => ({ ...e, date })) };

  const store = () => createLocalStore(window.localStorage);
  useEffect(() => setItems(createLocalStore(window.localStorage).list()), []);

  async function create() {
    if (creating) return;
    setCreating(selectedId);
    setError("");
    try {
      const content = defaultContent();
      content.paletteKey = selectedColor;
      content.couple.groom.name = groom.trim();
      content.couple.bride.name = bride.trim();
      content.events = content.events.map((event) => ({ ...event, date }));
      const made = await api.createInvitation(selectedId, content);
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
      <div className="studio-create-layout">
        <div className="studio-create-left">
          <div className="studio-steps"><b>1</b> Chọn mẫu <i /> <b>2</b> Tên hai bạn <i /> <b>3</b> Chỉnh sửa</div>
          <h1>Tạo thiệp mới</h1>
          <p className="lede">Chọn một mẫu để bắt đầu. Bạn đổi mẫu lúc nào cũng được mà không mất nội dung.</p>
          <div className="pick-grid" role="group" aria-label="Chọn mẫu thiệp">
            {templates.map((template) => <button type="button" key={template.id} className="pick" data-selected={selectedId === template.id} aria-pressed={selectedId === template.id} onClick={() => setSelectedId(template.id)}>
              <ScaledFrame className="pick__thumb"><InvitationRenderer only="cover" mode="preview" gate={false} template={template} content={{ ...preview, paletteKey: "" }} /></ScaledFrame>
              <span className="pick__meta"><strong>{template.name}</strong><small>{template.blurb}</small></span>
            </button>)}
          </div>
        </div>
        <aside className="studio-create-aside" aria-label="Thiệp đang chọn">
          <div className="studio-create-selected"><ScaledFrame className="studio-create-preview"><InvitationRenderer only="cover" mode="preview" gate={false} template={selected} content={preview} /></ScaledFrame><div><small>ĐÃ CHỌN</small><strong>{selected.name}</strong><span>{selected.blurb}</span></div></div>
          <div className="studio-create-fields"><label>Cô dâu<input className="input" value={bride} onChange={(e) => setBride(e.target.value)} placeholder="Tên cô dâu" /></label><label>Chú rể<input className="input" value={groom} onChange={(e) => setGroom(e.target.value)} placeholder="Tên chú rể" /></label><label>Ngày cưới<input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label></div>
          <button className="button-primary studio-create-submit" type="button" disabled={creating !== null} onClick={create}>{creating ? "Đang tạo thiệp…" : "Bắt đầu chỉnh sửa →"}</button>
          <p>Không cần đăng nhập. MỘC sẽ cấp một link sửa riêng, hãy lưu lại link đó.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
        </aside>
      </div>

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
