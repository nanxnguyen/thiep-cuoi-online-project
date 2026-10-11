import type { CoverProps } from "./types";
import { r2 } from "./util";

// Ngọc Trai — an oval photo under three concentric pearl strands (bigger beads
// where the arch lands) with a short strand hanging at each side. 30 beads.
type Bead = { x: number; y: number; r: number; d: number };
const CX = 50;
const CY = 66;
const strand = (rx: number, ry: number, n: number, rEnd: number, rTop: number): Bead[] =>
  Array.from({ length: n }, (_, i) => {
    const u = i / (n - 1);
    const ang = Math.PI + Math.PI * u;
    const k = Math.abs(2 * u - 1); // 0 at the crown, 1 at the feet
    return { x: r2(CX + rx * Math.cos(ang)), y: r2(CY + ry * Math.sin(ang)), r: r2(rTop + (rEnd - rTop) * k * k), d: r2(Math.min(u, 1 - u) * 0.9) };
  });
const hang = (x: number): Bead[] => [0, 1, 2].map((i) => ({ x, y: CY + 5 + i * 5.2, r: 2.3 - i * 0.3, d: 0.5 + i * 0.12 }));

const BEADS: Bead[] = [...strand(32, 42, 8, 2.8, 1.8), ...strand(37, 47, 8, 2.8, 1.8), ...strand(42, 52, 8, 2.8, 1.8), ...hang(8), ...hang(92)];

export function PearlArchCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-pearl-arch">
      <svg className="cv-pearl-arch__pearls" viewBox="0 0 100 178" aria-hidden="true">
        <defs>
          <radialGradient id="cv-pearl-shine" cx="36%" cy="32%" r="70%">
            <stop offset="0" stopColor="white" />
            <stop offset="0.55" stopColor="var(--cv-paper)" />
            <stop offset="1" stopColor="var(--cv-deep)" stopOpacity="0.45" />
          </radialGradient>
        </defs>
        {BEADS.map(({ x, y, r, d }) => (
          <circle key={`${x}-${y}-${r}`} className="cv-pearl-arch__bead" style={{ animationDelay: `${d}s` }} cx={x} cy={y} r={r} fill="url(#cv-pearl-shine)" stroke="var(--cv-deep)" strokeOpacity="0.2" strokeWidth="0.25" />
        ))}
        <circle cx={CX} cy={CY - 52.5} r="0.9" fill="var(--cv-gold)" />
      </svg>
      <span className="cv-kicker cv-pearl-arch__kicker">TRÂN TRỌNG KÍNH MỜI</span>
      <div className="cv-pearl-arch__photo">{slot(0, "Mẫu thiệp cưới Ngọc Trai phong cách tối giản vòm ngọc")}</div>
      <div className="cv-pearl-arch__text">
        <p className="cv-names cv-pearl-arch__names">
          {b} <span className="cv-pearl-arch__amp">&amp;</span> {a}
        </p>
        <p className="cv-date cv-pearl-arch__date">{date}</p>
        {place && <p className="cv-place cv-pearl-arch__place">{place}</p>}
      </div>
    </div>
  );
}
