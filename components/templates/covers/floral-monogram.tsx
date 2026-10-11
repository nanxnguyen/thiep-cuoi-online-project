import type { CoverProps } from "./types";
import { initial } from "./util";

// Hoa Chữ — two big overlapping initials, wrapped by one line-art branch that
// grows from their feet and carries three blooms. No photo here.
function wavy(cx: number, cy: number, r: number, n: number, amp: number, phase: number) {
  const pts = Array.from({ length: 72 }, (_, i) => {
    const t = (i / 72) * Math.PI * 2;
    const rr = r * (1 + amp * Math.sin(n * t + phase));
    return `${(cx + rr * Math.cos(t)).toFixed(2)} ${(cy + rr * Math.sin(t)).toFixed(2)}`;
  });
  return `M${pts.join("L")}Z`;
}

function Bloom({ x, y, r, delay }: { x: number; y: number; r: number; delay: number }) {
  return (
    <g className="cv-floral-monogram__bloom" style={{ animationDelay: `${delay}s` }} fill="var(--cv-paper)">
      <path d={wavy(x, y, r, 6, 0.12, 0)} />
      <path d={wavy(x, y, r * 0.68, 5, 0.13, 0.6)} />
      <path d={wavy(x, y, r * 0.38, 4, 0.15, 1.1)} />
    </g>
  );
}

const LEAF = "M0 0C3-3 8-3 11 0C8 3 3 3 0 0Z";
const LEAVES: [number, number, number][] = [
  [22, 80, -150], [14, 66, -120], [11, 52, -100], [78, 80, -30], [86, 66, -60], [89, 52, -80], [36, 86, 160], [64, 86, 20],
];

export function FloralMonogramCover({ a, b, date, place }: CoverProps) {
  return (
    <div className="cv-floral-monogram">
      <span className="cv-kicker cv-floral-monogram__kicker">TRÂN TRỌNG KÍNH MỜI</span>
      <svg className="cv-floral-monogram__branch" viewBox="0 0 100 178" fill="none" stroke="var(--cv-gold)" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M50 88C34 92 14 80 12 50" strokeWidth="0.35" />
        <path d="M50 88C66 92 86 80 88 50" strokeWidth="0.35" />
        <path d="M12 50C12 36 26 26 42 24" strokeWidth="0.35" />
        <path d="M88 50C88 36 74 26 58 24" strokeWidth="0.35" />
        {LEAVES.map(([x, y, rot]) => (
          <path key={`${x}-${y}`} d={LEAF} transform={`translate(${x} ${y}) rotate(${rot})`} strokeWidth="0.35" fill="var(--cv-gold)" fillOpacity="0.14" />
        ))}
        <g strokeWidth="0.35">
          <Bloom x={50} y={22} r={7} delay={0.5} />
          <Bloom x={12} y={48} r={6} delay={0.8} />
          <Bloom x={88} y={48} r={6} delay={1.1} />
        </g>
      </svg>
      <div className="cv-floral-monogram__mono" aria-hidden="true">
        <span className="cv-floral-monogram__letter">{initial(b)}</span>
        <span className="cv-floral-monogram__letter cv-floral-monogram__letter--r">{initial(a)}</span>
      </div>
      <div className="cv-floral-monogram__text">
        <p className="cv-names cv-floral-monogram__names">
          {b} <span className="cv-floral-monogram__amp">&amp;</span> {a}
        </p>
        <p className="cv-date cv-floral-monogram__date">{date}</p>
        {place && <p className="cv-place cv-floral-monogram__place">{place}</p>}
      </div>
      <i className="cv-floral-monogram__rule" aria-hidden="true" />
    </div>
  );
}
