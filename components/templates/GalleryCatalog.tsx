"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { colors, templateSamples, templates, type ColorKey, type Template } from "@/lib/templates";
import { ThiepPreview } from "./ThiepPreview";

// design/Mau Thiep v2.dc.html, interactive part: ranking rail, sticky style/colour filter bar, sortable card grid with a
// colour switch per card. Previews are the design's own Thiep Preview with each template's sample couple.
const STYLES = ["Tất cả", "Truyền thống", "Tối giản", "Hoa", "Cổ điển", "Lãng mạn", "Hiện đại"];
const COLOR_GROUPS: { key: string; label: string; color: string; pals: ColorKey[] }[] = [
  { key: "red", label: "Đỏ", color: colors.do.deep, pals: ["do", "dodam"] },
  { key: "green", label: "Xanh", color: colors.xanh.deep, pals: ["xanh", "oliu"] },
  { key: "blue", label: "Lam", color: colors.lam.deep, pals: ["lam"] },
  { key: "pink", label: "Hồng", color: colors.hong.deep, pals: ["hong", "tim"] },
  { key: "brown", label: "Nâu", color: colors.nau.deep, pals: ["nau", "cam"] },
  { key: "gold", label: "Vàng kim", color: colors.xanh.gold, pals: ["vang"] },
  { key: "ink", label: "Mực", color: colors.muc.deep, pals: ["muc"] },
];
const sampleOf = (t: Template) => templateSamples[t.id];
const preview = (t: Template, key: ColorKey, radius?: string) => {
  const s = sampleOf(t);
  const c = colors[key];
  return <ThiepPreview family={t.family} deep={c.deep} paper={c.paper} gold={c.gold} a={s.a} b={s.b} date={s.date} place={s.place} radius={radius} />;
};

export function GalleryCatalog() {
  const [cat, setCat] = useState("Tất cả");
  const [color, setColor] = useState<string | null>(null);
  const [sort, setSort] = useState<"pop" | "new">("pop");
  const [hover, setHover] = useState<string | null>(null);
  const [chosen, setChosen] = useState<Record<string, ColorKey>>({});
  const rail = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => rail.current?.scrollBy({ left: dir * 292 * 2, behavior: "smooth" });

  const grp = COLOR_GROUPS.find((g) => g.key === color);
  const list = templates
    .filter((t) => (cat === "Tất cả" || sampleOf(t).style === cat) && (!grp || t.colors.some((k) => grp.pals.includes(k))))
    .sort((x, y) => (sort === "new" ? Number(sampleOf(y).isNew) - Number(sampleOf(x).isNew) || sampleOf(y).pop - sampleOf(x).pop : sampleOf(y).pop - sampleOf(x).pop));
  const ranking = [...templates].sort((x, y) => sampleOf(y).pop - sampleOf(x).pop).slice(0, 7);
  const title = [cat === "Tất cả" ? "Tất cả mẫu thiệp" : cat, grp ? `tông ${grp.label.toLowerCase()}` : ""].filter(Boolean).join(", ");

  return (
    <>
      <section className="gal-rank" aria-labelledby="gal-rank-title">
        <div className="gal-rank__head">
          <div>
            <span className="gal-kicker gal-kicker--gold">BẢNG XẾP HẠNG · THÁNG 9</span>
            <h2 id="gal-rank-title">
              Được các cặp đôi
              <br />
              <em>chọn nhiều nhất</em>
            </h2>
          </div>
          <div className="gal-rank__nav">
            <button type="button" aria-label="Trước" onClick={() => scroll(-1)}>
              ←
            </button>
            <button type="button" aria-label="Sau" onClick={() => scroll(1)}>
              →
            </button>
          </div>
        </div>
        <div className="gal-rank__rail" ref={rail}>
          {ranking.map((t, i) => (
            <Link href={`/templates/${t.id}`} key={t.id}>
              <div className="gal-rank__card">
                {preview(t, t.colors[0], "12px")}
                <span className="gal-rank__n">{i + 1}</span>
              </div>
              <div className="gal-rank__meta">
                <span>{t.name}</span>
                <span>
                  {sampleOf(t).style} · {t.colors.length} màu
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="gal-filters">
        <div>
          <div className="gal-chips" role="group" aria-label="Lọc theo phong cách">
            {STYLES.map((c) => (
              <button type="button" key={c} aria-pressed={c === cat} onClick={() => { setCat(c); setChosen({}); }}>
                {c}
                <span>{c === "Tất cả" ? templates.length : templates.filter((t) => sampleOf(t).style === c).length}</span>
              </button>
            ))}
          </div>
          <div className="gal-dots">
            <span>Màu</span>
            {COLOR_GROUPS.map((g) => (
              <button
                type="button"
                key={g.key}
                title={g.label}
                aria-label={`Lọc màu ${g.label}`}
                aria-pressed={g.key === color}
                onClick={() => { setColor(color === g.key ? null : g.key); setChosen({}); }}
                style={{ background: g.color }}
              />
            ))}
          </div>
        </div>
      </div>

      <main className="gal-main">
        <div className="gal-main__head">
          <div>
            <h2>{title}</h2>
            <p>{list.length} mẫu · bấm chấm màu để đổi phiên bản</p>
          </div>
          <div className="gal-sort">
            {(
              [
                ["pop", "Phổ biến"],
                ["new", "Mới nhất"],
              ] as const
            ).map(([k, l]) => (
              <button type="button" key={k} aria-pressed={sort === k} onClick={() => setSort(k)}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {list.length === 0 && (
          <div className="gal-empty">
            <span>Chưa có mẫu phù hợp bộ lọc này</span>
            <button type="button" onClick={() => { setCat("Tất cả"); setColor(null); setChosen({}); }}>
              Xoá bộ lọc
            </button>
          </div>
        )}
        <div className="gal-grid">
          {list.map((t) => {
            const s = sampleOf(t);
            let key = chosen[t.id] ?? (grp ? t.colors.find((k) => grp.pals.includes(k)) : t.colors[0]) ?? t.colors[0];
            if (!t.colors.includes(key)) key = t.colors[0];
            const on = hover === t.id;
            return (
              <article key={t.id} onMouseEnter={() => setHover(t.id)} onMouseLeave={() => setHover(null)}>
                <div className="gal-card" data-hover={on || undefined}>
                  <Link href={`/templates/${t.id}?color=${key}`} aria-label={`Xem mẫu ${t.name}`}>
                    {preview(t, key)}
                  </Link>
                  {s.badge && <span className={`gal-badge${s.badge === "HOT" ? " gal-badge--hot" : ""}`}>{s.badge}</span>}
                  {on && (
                    <div className="gal-card__actions">
                      <Link href={`/templates/${t.id}?color=${key}`}>Xem thử</Link>
                      <Link href={`/studio?template=${t.id}&color=${key}`}>Dùng mẫu</Link>
                    </div>
                  )}
                </div>
                <div className="gal-card__meta">
                  <div>
                    <span>{t.name}</span>
                    <span>— {colors[key].label}</span>
                  </div>
                  <div>
                    <div className="gal-swatches">
                      {t.colors.map((k) => (
                        <button
                          type="button"
                          key={k}
                          title={colors[k].label}
                          aria-label={`${t.name}: ${colors[k].label}`}
                          aria-pressed={k === key}
                          onClick={() => setChosen((c) => ({ ...c, [t.id]: k }))}
                          style={{ background: colors[k].deep }}
                        />
                      ))}
                    </div>
                    <span className="gal-card__sep" />
                    <span className="gal-card__tags">
                      {s.style} · {s.motif}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </>
  );
}

/** "Hỏi đáp" accordion: one answer open at a time, the first open to start. */
export function GalleryFaq({ items }: { items: readonly (readonly [string, string])[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="gal-faq__list">
      {items.map(([q, a], i) => (
        <div key={q}>
          <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
            <span>{q}</span>
            <span aria-hidden="true">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <p>{a}</p>}
        </div>
      ))}
    </div>
  );
}
