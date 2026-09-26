"use client";

import Link from "next/link";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ThiepPreview } from "@/components/templates/ThiepPreview";
import { api } from "@/lib/api";
import { defaultContent } from "@/lib/content";
import { createLocalStore, editLink, invitationTitle, parseEditLink, type LocalInvitation } from "@/lib/local-invitations";
import { colors, getTemplate, templateSamples, templates, type ColorKey } from "@/lib/templates";

const fmtDate = (d: string) => {
  const [y, m, dd] = d.split("-");
  return y ? `${dd} · ${m} · ${y}` : "";
};
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
  const [selectedId, setSelectedId] = useState(() => getTemplate(initialTemplate || "")?.id || templates[0].id);
  const [bride, setBride] = useState("Hạ Vy");
  const [groom, setGroom] = useState("Minh Khôi");
  const [date, setDate] = useState("2026-11-09");
  const selected = getTemplate(selectedId)!;
  const selectedColor = selectedId === getTemplate(initialTemplate || "")?.id && selected.colors.includes(initialColor as typeof selected.colors[number]) ? initialColor! : "";
  const cur = colors[(selectedColor || selected.colors[0]) as ColorKey];

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
    <div className="studio-home">
      <main className="sh">
        <div className="sh__left">
          <div className="sh__intro">
            <div className="sh__steps">
              <span className="sh__step sh__step--on">1</span>Chọn mẫu<span className="sh__line" />
              <span className="sh__step">2</span>Tên hai bạn<span className="sh__line" />
              <span className="sh__step">3</span>Chỉnh sửa
            </div>
            <h1>Tạo thiệp mới</h1>
            <p>Chọn một mẫu để bắt đầu. Bạn đổi mẫu lúc nào cũng được mà không mất nội dung.</p>
          </div>
          <div className="sh__grid" role="group" aria-label="Chọn mẫu thiệp">
            {templates.map((t, i) => {
              const on = selectedId === t.id;
              const c = colors[t.colors[0]];
              return (
                <button type="button" key={t.id} aria-pressed={on} onClick={() => setSelectedId(t.id)} style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className="sh__thumb" data-on={on || undefined}>
                    <ThiepPreview family={t.family} deep={c.deep} paper={c.paper} gold={c.gold} a={bride || "Cô dâu"} b={groom || "Chú rể"} date={fmtDate(date)} place="HÀ NỘI" radius="8px" />
                    {on && <span className="sh__check">✓</span>}
                  </div>
                  <div className="sh__meta">
                    <span>{t.name}</span>
                    <span>{templateSamples[t.id].style}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <aside className="sh__aside" aria-label="Thiệp đang chọn">
          <div className="sh__selected">
            <div className="sh__bob">
              <div className="sh__big" key={selectedId}>
                <ThiepPreview family={selected.family} deep={cur.deep} paper={cur.paper} gold={cur.gold} a={bride || "Cô dâu"} b={groom || "Chú rể"} date={fmtDate(date)} place="HÀ NỘI" />
              </div>
            </div>
            <div className="sh__name">
              <span>ĐÃ CHỌN</span>
              <span>{selected.name}</span>
              <span>{templateSamples[selected.id].style}</span>
            </div>
          </div>
          <div className="sh__fields">
            <label>
              Cô dâu
              <input value={bride} onChange={(e) => setBride(e.target.value)} />
            </label>
            <label>
              Chú rể
              <input value={groom} onChange={(e) => setGroom(e.target.value)} />
            </label>
            <label className="sh__full">
              Ngày cưới
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
          </div>
          <button className="sh__go" type="button" disabled={creating !== null} onClick={create}>
            {creating && <span className="sh__spin" aria-hidden="true" />}
            {creating ? "Đang tạo thiệp…" : "Bắt đầu chỉnh sửa →"}
          </button>
          <span className="sh__note">Không cần đăng nhập. Mộc sẽ cấp một link sửa riêng, hãy lưu lại link đó.</span>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </aside>
      </main>
      <div className="section studio-home__more">
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
      </div>
    </div>
  );
}
