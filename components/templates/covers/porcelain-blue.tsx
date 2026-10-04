import type { CoverProps } from "./types";

// Lam Sứ — a tiled porcelain ground with a scalloped plate holding the photo.
// The tile (four-petal sprig in a diamond) and the scallops are drawn here.
function scallops(cx: number, cy: number, r: number, n: number) {
  const pt = (i: number) => {
    const t = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)] as const;
  };
  const chord = 2 * r * Math.sin(Math.PI / n);
  const s = (chord / 2) * 1.08;
  const [x0, y0] = pt(0);
  let d = `M${x0.toFixed(2)} ${y0.toFixed(2)}`;
  for (let i = 1; i <= n; i++) {
    const [x, y] = pt(i % n);
    d += `A${s.toFixed(2)} ${s.toFixed(2)} 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return `${d}Z`;
}

const PLATE = scallops(50, 76, 34, 30);

export function PorcelainBlueCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-porcelain-blue">
      <svg className="cv-porcelain-blue__tiles" viewBox="0 0 100 178" aria-hidden="true">
        <defs>
          <pattern id="cv-pb-tile" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M10 1L19 10L10 19L1 10Z" fill="none" stroke="currentColor" strokeWidth="0.45" />
            <circle cx="10" cy="5.2" r="2" fill="none" stroke="currentColor" strokeWidth="0.45" />
            <circle cx="10" cy="14.8" r="2" fill="none" stroke="currentColor" strokeWidth="0.45" />
            <circle cx="5.2" cy="10" r="2" fill="none" stroke="currentColor" strokeWidth="0.45" />
            <circle cx="14.8" cy="10" r="2" fill="none" stroke="currentColor" strokeWidth="0.45" />
            <circle cx="10" cy="10" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100" height="178" fill="url(#cv-pb-tile)" />
      </svg>
      <span className="cv-kicker cv-porcelain-blue__kicker">TRÂN TRỌNG KÍNH MỜI</span>
      <svg className="cv-porcelain-blue__plate" viewBox="0 0 100 178" aria-hidden="true">
        <path d={PLATE} fill="var(--cv-paper)" stroke="currentColor" strokeWidth="1.1" />
        <circle cx="50" cy="76" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="50" cy="76" r="28.4" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.85" />
      </svg>
      <div className="cv-porcelain-blue__photo">{slot(0, "Ảnh cưới", true)}</div>
      <div className="cv-porcelain-blue__label">
        <p className="cv-names cv-porcelain-blue__names">
          {b} &amp; {a}
        </p>
        <p className="cv-date cv-porcelain-blue__date">{date}</p>
        <p className="cv-place cv-porcelain-blue__place">{place}</p>
      </div>
    </div>
  );
}
