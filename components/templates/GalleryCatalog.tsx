"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { sampleContent } from "@/lib/content";
import { colors, templates, type Template } from "@/lib/templates";
import { ScaledFrame } from "./ScaledFrame";

const styleOf = (family: Template["family"]) =>
  ["A", "H", "I", "J"].includes(family) ? "Truyền thống" :
  family === "B" ? "Tối giản" : family === "C" ? "Hoa" : family === "D" ? "Cổ điển" :
  ["E", "G"].includes(family) ? "Lãng mạn" : "Hiện đại";
const styles = ["Tất cả", "Truyền thống", "Tối giản", "Hoa", "Cổ điển", "Lãng mạn", "Hiện đại"];
// Swatch colours come from the template palette registry, never copied hex.
const groups = [
  ["Đỏ", colors.do.deep, ["do", "dodam"]],
  ["Xanh", colors.xanh.deep, ["xanh", "oliu"]],
  ["Lam", colors.lam.deep, ["lam"]],
  ["Hồng", colors.hong.deep, ["hong", "tim"]],
  ["Nâu", colors.nau.deep, ["nau", "cam"]],
  ["Vàng kim", colors.xanh.gold, ["vang"]],
  ["Mực", colors.muc.deep, ["muc"]],
] as const;
// Per-template sample couple and badge from design/Mau Thiep v2.dc.html, so each card previews like the design.
const CARD: Record<string, [badge: string, bride: string, groom: string]> = {
  "song-hy": ["HOT", "Ngọc Hân", "Đức Huy"], "net-muc": ["MỚI", "An", "Bảo"], "hoa-nhai": ["", "Thu Hà", "Văn Long"],
  "hoang-gia": ["HOT", "Phương Thảo", "Trung Kiên"], "phong-thu": ["MỚI", "Hoàng Long", "Bảo Ngọc"], "bia-bao": ["", "Linh", "Tuấn"],
  "hy-su": ["", "Quỳnh Anh", "Gia Khánh"], "giay-do": ["", "Hương", "Nam"], "vuon-uom": ["MỚI", "Mai", "Phong"],
  "nhung-lam": ["", "Thanh Trúc", "Quốc Anh"], "thu-tinh": ["", "Minh Ánh", "Thế Bảo"], "chan-dung": ["HOT", "Hạ Vy", "Minh Khôi"],
  "song-phung": ["HOT", "Ngọc Ánh", "Thế Bảo"], "bao-hy": ["MỚI", "Thanh Tú", "Hoàng Nam"], "doi-khung": ["MỚI", "Thu Hà", "Minh Quân"],
  "song-cua": ["HOT", "Thanh Hà", "Tuấn Kiệt"],
};
const rank = ["song-hy", "song-phung", "song-cua", "hoang-gia", "chan-dung", "hy-su", "bao-hy"];
const sample = sampleContent(new Date("2026-09-20T00:00:00Z"));
const preview = { ...sample, couple: { ...sample.couple, heroPhoto: "" } };
const cardContent = (id: string, paletteKey: string) => {
  const names = CARD[id];
  return { ...preview, paletteKey, couple: names ? { ...preview.couple, bride: { ...preview.couple.bride, name: names[1] }, groom: { ...preview.couple.groom, name: names[2] } } : preview.couple };
};

export function GalleryCatalog() {
  const [style, setStyle] = useState("Tất cả");
  const [color, setColor] = useState("");
  const [sort, setSort] = useState("popular");
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const list = useMemo(() => {
    const selected = groups.find(([label]) => label === color)?.[2];
    return templates.filter((t) => (style === "Tất cả" || styleOf(t.family) === style) && (!selected || t.colors.some((key) => (selected as readonly string[]).includes(key))))
      .sort((a, b) => sort === "new" ? templates.indexOf(b) - templates.indexOf(a) : (rank.indexOf(a.id) < 0 ? 99 : rank.indexOf(a.id)) - (rank.indexOf(b.id) < 0 ? 99 : rank.indexOf(b.id)));
  }, [style, color, sort]);

  return <>
    <div className="tpl-filters" role="group" aria-label="Lọc theo phong cách">
      {styles.map((label) => <button className="tpl-chip" key={label} type="button" aria-pressed={style === label} onClick={() => setStyle(label)}>{label}</button>)}
      <span className="tpl-filter-spacer" />
      <span className="tpl-color-label">Màu</span>
      {groups.map(([label, swatch]) => <button key={label} type="button" className="tpl-color-filter" aria-label={`Lọc màu ${label}`} aria-pressed={color === label} title={label} onClick={() => setColor(color === label ? "" : label)} style={{ background: swatch }} />)}
    </div>
    <div className="tpl-catalog-controls"><span>{list.length} mẫu · chọn điểm bắt đầu của hai bạn</span><label>Sắp xếp <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="popular">Phổ biến</option><option value="new">Mới nhất</option></select></label></div>
    <div className="tpl-grid">
      {list.map((template) => {
        const key = template.colors.includes(chosen[template.id] as typeof template.colors[number]) ? chosen[template.id] as typeof template.colors[number] : template.colors[0];
        return <article className="tpl-card" key={template.id}>
          <div className="tpl-card__frame">
            <Link href={`/templates/${template.id}?color=${key}`} aria-label={`Xem mẫu ${template.name}`}>
              <ScaledFrame className="tpl-thumb"><InvitationRenderer only="cover" mode="preview" gate={false} template={template} content={cardContent(template.id, key)} /></ScaledFrame>
            </Link>
            {CARD[template.id]?.[0] && <span className={`tpl-card__badge${CARD[template.id][0] === "HOT" ? " tpl-card__badge--hot" : ""}`}>{CARD[template.id][0]}</span>}
            <div className="tpl-card__actions">
              <Link href={`/templates/${template.id}?color=${key}`} tabIndex={-1}>Xem thử</Link>
              <Link href={`/studio?template=${template.id}&color=${key}`}>Dùng mẫu</Link>
            </div>
          </div>
          <div className="tpl-card__meta"><strong>{template.name}</strong><span>— {colors[key].label}</span><small>{styleOf(template.family)} · {template.blurb}</small></div>
          <div className="tpl-card__swatches" role="group" aria-label={`Màu mẫu ${template.name}`}>
            {template.colors.map((option) => <button key={option} type="button" title={colors[option].label} aria-label={`${template.name}: ${colors[option].label}`} aria-pressed={key === option} onClick={() => setChosen((previous) => ({ ...previous, [template.id]: option }))} style={{ background: colors[option].deep }} />)}
          </div>
        </article>;
      })}
    </div>
    {list.length === 0 && (
      <div className="tpl-empty">
        <strong>Chưa có mẫu phù hợp bộ lọc này</strong>
        <button type="button" className="button-ghost" onClick={() => { setStyle("Tất cả"); setColor(""); }}>Xoá bộ lọc</button>
      </div>
    )}
  </>;
}
