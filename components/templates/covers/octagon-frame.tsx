import type { CoverProps } from "./types";
import { r2 } from "./util";

// Bát Giác — the photo is cut to a regular octagon and wrapped in three gold
// outlines; sixteen faint rays leave the centre. Everything geometric, nothing
// borrowed: the octagon is the same percentage polygon in CSS and in SVG.
const OCT = "29.3,0 70.7,0 100,29.3 100,70.7 70.7,100 29.3,100 0,70.7 0,29.3";

export function OctagonFrameCover({ a, b, date, place, slot }: CoverProps) {
  const rays = Array.from({ length: 16 }, (_, i) => (i * Math.PI) / 8);
  return (
    <div className="cv-octagon-frame">
      <svg className="cv-octagon-frame__rays" viewBox="0 0 100 178" aria-hidden="true">
        <g stroke="var(--cv-gold)" strokeWidth="0.25" opacity="0.35">
          {rays.map((t) => (
            <line key={t} x1={50} y1={66} x2={r2(50 + 140 * Math.cos(t))} y2={r2(66 + 140 * Math.sin(t))} />
          ))}
        </g>
      </svg>
      <span className="cv-kicker cv-octagon-frame__kicker">TRÂN TRỌNG KÍNH MỜI</span>
      <div className="cv-octagon-frame__photo">{slot(0, "Ảnh cưới")}</div>
      <svg className="cv-octagon-frame__frame" viewBox="0 0 100 100" fill="none" stroke="var(--cv-gold)" aria-hidden="true">
        {[0.8, 0.88, 0.97].map((s, i) => (
          <polygon key={s} points={OCT} strokeWidth={i === 0 ? 0.8 : 0.35} vectorEffect="non-scaling-stroke" transform={`translate(50 50) scale(${s}) translate(-50 -50)`} />
        ))}
        {[[29.3, 0], [70.7, 0], [100, 29.3], [100, 70.7], [70.7, 100], [29.3, 100], [0, 70.7], [0, 29.3]].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={-1.1} y={-1.1} width={2.2} height={2.2} fill="var(--cv-gold)" stroke="none" transform={`translate(50 50) scale(0.97) translate(${x - 50} ${y - 50}) rotate(45)`} />
        ))}
      </svg>
      <p className="cv-names cv-octagon-frame__names">
        {b} <span className="cv-octagon-frame__amp">&amp;</span> {a}
      </p>
      <p className="cv-date cv-octagon-frame__date">{date}</p>
      {place && <p className="cv-place cv-octagon-frame__place">{place}</p>}
    </div>
  );
}
