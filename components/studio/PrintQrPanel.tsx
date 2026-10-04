"use client";

import { useState } from "react";
import { colors, type ColorKey } from "@/lib/templates";
import { qrImageUrl } from "@/lib/tools/qr";

// design/Quan Ly Thiep.dc.html, tab "QR để in": the invitation link as a QR on a card the couple prints (banquet
// table card, back of the paper card, round sticker). The QR image comes from the same free service the publish
// dialog already uses; "In thẻ" prints only the card (see the body[data-pq] rules in panels.css).
const STYLES = [
  { key: "table", label: "Thẻ bàn tiệc", size: "10 × 15 cm", kicker: "MỜI BẠN QUÉT MÃ", width: 260, radius: 14 },
  { key: "back", label: "Mặt sau thiệp", size: "5 × 5 cm", kicker: "XEM THIỆP ONLINE", width: 220, radius: 8 },
  { key: "sticker", label: "Nhãn dán", size: "Tròn 6 cm", kicker: "THIỆP & ĐƯỜNG ĐI", width: 240, radius: 140 },
] as const;
const PALETTES: { key: ColorKey; label: string }[] = [
  { key: "do", label: "Đỏ son" },
  { key: "dodam", label: "Đỏ đậm" },
  { key: "vang", label: "Vàng kim" },
  { key: "muc", label: "Mực" },
];

export function PrintQrPanel({ url, names, dateLine }: { url: string; names: string; dateLine: string }) {
  const [style, setStyle] = useState(0);
  const [palette, setPalette] = useState(0);
  const [text, setText] = useState("Quét để xem thiệp, đường đi và xác nhận tham dự");
  const st = STYLES[style];
  const c = colors[PALETTES[palette].key];
  const ink = c.deep;
  const src = qrImageUrl(url, 600).replace("margin=8", "margin=0") + `&color=${ink.slice(1)}`;

  function print() {
    document.body.dataset.pq = "1";
    window.addEventListener("afterprint", () => delete document.body.dataset.pq, { once: true });
    window.print();
  }

  return (
    <section className="pq" aria-labelledby="pq-title">
      <h3 id="pq-title" style={{ fontSize: 18, margin: "0 0 10px" }}>
        QR để in
      </h3>
      <div className="pq__grid">
        <div className="pq__stage">
          <div className="pq-card" style={{ width: st.width, borderRadius: st.radius, background: c.paper, color: ink }}>
            <span className="pq-card__kicker">{st.kicker}</span>
            <span className="pq-card__names">{names}</span>
            <img src={src} alt="Mã QR dẫn tới thiệp" width={150} height={150} />
            <span className="pq-card__text">{text}</span>
            {dateLine && <span className="pq-card__date">{dateLine}</span>}
          </div>
        </div>
        <div className="pq__controls">
          <div role="group" aria-label="Dùng cho">
            <span>Dùng cho</span>
            <div className="pq__chips">
              {STYLES.map((s, i) => (
                <button type="button" key={s.key} aria-pressed={i === style} onClick={() => setStyle(i)}>
                  {s.label}
                  <small>{s.size}</small>
                </button>
              ))}
            </div>
          </div>
          <div role="group" aria-label="Màu thẻ">
            <span>Màu thẻ</span>
            <div className="pq__swatches">
              {PALETTES.map((p, i) => (
                <button type="button" key={p.key} title={p.label} aria-label={p.label} aria-pressed={i === palette} onClick={() => setPalette(i)} style={{ background: colors[p.key].deep }} />
              ))}
            </div>
          </div>
          <label>
            <span>Lời nhắn trên thẻ</span>
            <input className="input" value={text} maxLength={80} onChange={(e) => setText(e.target.value)} />
          </label>
          <div className="pq__actions">
            <button type="button" className="button-primary" onClick={print}>
              In thẻ
            </button>
            <a className="button-ghost" href={qrImageUrl(url, 1000) + `&color=${ink.slice(1)}&format=png`} target="_blank" rel="noopener noreferrer">
              Mở ảnh QR để lưu
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
