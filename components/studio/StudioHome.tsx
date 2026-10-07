"use client";

import Link from "next/link";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { ThiepPreview } from "@/components/templates/ThiepPreview";
import { api } from "@/lib/api";
import { defaultContent } from "@/lib/content";
import { normalizeDateInput } from "@/lib/datetime";
import { createLocalStore, editLink, invitationTitle, parseEditLink, type LocalInvitation } from "@/lib/local-invitations";
import { colors, getTemplate, templateSamples, templates, type ColorKey } from "@/lib/templates";

const fmtDate = (d: string) => {
  const [y, m, dd] = d.split("-");
  return y ? `${dd} · ${m} · ${y}` : "";
};
const when = (iso: string) => new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

const STYLES = ["Tất cả", "Truyền thống", "Tối giản", "Hoa", "Cổ điển", "Lãng mạn", "Hiện đại"];

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
  const [style, setStyle] = useState("Tất cả");
  const dateInputRef = useRef<HTMLInputElement>(null);
  const selected = getTemplate(selectedId)!;
  const selectedColor = selectedId === getTemplate(initialTemplate || "")?.id && selected.colors.includes(initialColor as typeof selected.colors[number]) ? initialColor! : "";
  const list = style === "Tất cả" ? templates : templates.filter((t) => templateSamples[t.id].style === style);
  const cur = colors[(selectedColor || selected.colors[0]) as ColorKey];

  const store = () => createLocalStore(window.localStorage);
  useEffect(() => setItems(createLocalStore(window.localStorage).list()), []);

  async function create() {
    if (creating) return;
    const weddingDate = normalizeDateInput(dateInputRef.current?.value || date);
    if (!weddingDate) {
      setError("Ngày cưới chưa hợp lệ. Hãy chọn lại ngày theo định dạng ngày/tháng/năm.");
      return;
    }
    setCreating(selectedId);
    setError("");
    try {
      const content = defaultContent();
      content.paletteKey = selectedColor;
      content.couple.groom.name = groom.trim();
      content.couple.bride.name = bride.trim();
      content.events = content.events.map((event) => ({ ...event, date: weddingDate }));
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
        <aside id="tao-thiep" className="sh__aside" aria-label="Thiệp đang chọn" style={{ "--sh-deep": cur.deep, "--sh-gold": cur.gold } as CSSProperties}>
          <div className="sh__asideTop">
            <div className="sh__brand">
              <span>MỘC · TẠO THIỆP MỚI</span>
              <h2>
                {bride.trim() || "Cô dâu"} &amp; {groom.trim() || "Chú rể"}
              </h2>
            </div>
            <ol className="sh__steps">
              <li aria-current="step">
                <i>I</i>Chọn mẫu
              </li>
              <li>
                <i>II</i>Tên hai bạn
              </li>
              <li>
                <i>III</i>Chỉnh sửa
              </li>
            </ol>
            <div className="sh__bob">
              <div className="sh__big" key={selectedId}>
                <ThiepPreview family={selected.family} deep={cur.deep} paper={cur.paper} gold={cur.gold} a={bride || "Cô dâu"} b={groom || "Chú rể"} date={fmtDate(date)} place="HÀ NỘI" radius="12px" fit maxW="100%" eager />
              </div>
            </div>
            <div className="sh__name">
              <span>{selected.name}</span>
              <span>{templateSamples[selected.id].style}</span>
            </div>
          </div>
          <div className="sh__asideBottom">
            <div className="sh__fields">
              <label>
                CÔ DÂU
                <input name="brideName" value={bride} onChange={(e) => setBride(e.target.value)} />
              </label>
              <label>
                CHÚ RỂ
                <input name="groomName" value={groom} onChange={(e) => setGroom(e.target.value)} />
              </label>
              <label className="sh__full">
                NGÀY CƯỚI
                <input ref={dateInputRef} name="weddingDate" type="date" value={date} required onChange={(e) => setDate(e.currentTarget.value)} />
              </label>
            </div>
            <button className="sh__go" type="button" disabled={creating !== null} onClick={create}>
              {creating && <span className="sh__spin" aria-hidden="true" />}
              {creating ? "Đang tạo thiệp…" : "Bắt đầu chỉnh sửa →"}
            </button>
            <span className="sh__note">Không cần đăng nhập. Mộc sẽ cấp một link sửa riêng, hãy lưu lại link đó.</span>
            {error && (
              <p className="form-error sh__error" role="alert">
                {error}
              </p>
            )}
          </div>
        </aside>
        <div className="sh__left">
          <div className="sh__intro">
            <span>BƯỚC 1 / 3</span>
            <h1>Chọn một mẫu thiệp</h1>
            <p>Đổi mẫu lúc nào cũng được, nội dung của bạn vẫn còn nguyên.</p>
          </div>
          <div className="sh__chips" role="group" aria-label="Lọc theo phong cách">
            {STYLES.map((st) => (
              <button type="button" key={st} aria-pressed={st === style} onClick={() => setStyle(st)}>
                {st}
                <span>{st === "Tất cả" ? templates.length : templates.filter((t) => templateSamples[t.id].style === st).length}</span>
              </button>
            ))}
          </div>
          <div className="sh__grid" role="group" aria-label="Chọn mẫu thiệp">
            {list.map((t, i) => {
              const on = selectedId === t.id;
              const c = colors[t.colors[0]];
              return (
                <button type="button" key={t.id} aria-pressed={on} onClick={() => setSelectedId(t.id)} style={{ animationDelay: `${Math.min(i, 12) * 0.04}s` }}>
                  <div className="sh__thumb" data-on={on || undefined} style={{ "--ring": c.deep } as CSSProperties}>
                    <ThiepPreview family={t.family} deep={c.deep} paper={c.paper} gold={c.gold} a={bride || "Cô dâu"} b={groom || "Chú rể"} date={fmtDate(date)} place="HÀ NỘI" radius="0px" eager={i < 4} />
                    {on && <span className="sh__check" style={{ background: c.deep }}>✓</span>}
                  </div>
                  <div className="sh__meta">
                    <span>{t.name}</span>
                    <span>
                      {templateSamples[t.id].style} · {templateSamples[t.id].motif}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {/* Phones only (studio.css): the picker comes first there, so this bar takes the couple to the form. */}
          <a className="sh__jump" href="#tao-thiep">
            <span>Mẫu {selected.name}</span>
            <b>Tiếp tục ↓</b>
          </a>
        </div>
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
          <input className="input" name="editLink" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…/studio/…#k=…" aria-label="Link chỉnh sửa" />
          <button type="submit" className="button-primary" disabled={importing || !link.trim()}>
            {importing ? "Đang mở…" : "Mở thiệp"}
          </button>
        </form>
      </section>
      </div>
    </div>
  );
}
