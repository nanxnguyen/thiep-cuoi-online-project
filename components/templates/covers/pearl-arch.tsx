import type { CoverProps } from "./types";
import { r2 } from "./util";

// Ngọc Trai — two pearl festoons swing across the top and a pearl chain
// lowers an oval photo ringed in pearls. Pearls are circles on computed
// curves (quadratic Béziers and an ellipse); the shine is one radial gradient.
type Pt = [number, number];
const quad = (p0: Pt, p1: Pt, p2: Pt, t: number): Pt => [
  r2((1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0]),
  r2((1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]),
];
const festoon = (p0: Pt, p1: Pt, p2: Pt, n: number) => Array.from({ length: n + 1 }, (_, i) => quad(p0, p1, p2, i / n));
const ring = (cx: number, cy: number, rx: number, ry: number, n: number) =>
  Array.from({ length: n }, (_, i) => [r2(cx + rx * Math.cos((i / n) * Math.PI * 2 - Math.PI / 2)), r2(cy + ry * Math.sin((i / n) * Math.PI * 2 - Math.PI / 2))] as Pt);

const PEARLS: [Pt, number][] = [
  ...festoon([-2, 6], [50, 42], [102, 6], 22).map((p) => [p, 2.1] as [Pt, number]),
  ...festoon([-2, 18], [50, 58], [102, 18], 22).map((p) => [p, 2.4] as [Pt, number]),
  ...Array.from({ length: 5 }, (_, i) => [[50, 38 + i * 3.4], 1.5] as [Pt, number]),
  ...ring(50, 82, 21.5, 26, 30).map((p) => [p, 1.8] as [Pt, number]),
];

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
        {PEARLS.map(([[x, y], r]) => (
          <circle key={`${x}-${y}-${r}`} cx={x} cy={y} r={r} fill="url(#cv-pearl-shine)" stroke="var(--cv-deep)" strokeOpacity="0.25" strokeWidth="0.2" />
        ))}
      </svg>
      <div className="cv-pearl-arch__photo">{slot(0, "Ảnh cưới")}</div>
      <span className="cv-kicker cv-pearl-arch__kicker">TRÂN TRỌNG KÍNH MỜI</span>
      <p className="cv-names cv-pearl-arch__names">
        {b} <span className="cv-pearl-arch__amp">&amp;</span> {a}
      </p>
      <p className="cv-date cv-pearl-arch__date">{date}</p>
      {place && <p className="cv-place cv-pearl-arch__place">{place}</p>}
    </div>
  );
}
