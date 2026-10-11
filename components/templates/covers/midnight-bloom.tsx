import type { CoverProps } from "./types";

// Dạ Hoa — a night garden seen through a window of vines: the photo is a big
// moon, a peony glows at the foot of the page, fireflies blink. Dark ground
// (palette is inverted by familyMeta.dark), gold only for line and glow.
const STARS: [number, number, number][] = [
  [22, 30, 0.5], [78, 16, 0.5], [90, 48, 0.4], [14, 66, 0.4], [84, 80, 0.4], [30, 10, 0.35], [68, 6, 0.35],
];
const BUDS: [number, number][] = [[7, 22], [4, 50], [8, 80], [5, 108]];
const LEAVES: [number, number, number][] = [[12, 40, 1], [20, 66, -1], [10, 94, 1], [18, 118, -1]];

function Vine({ side }: { side: "l" | "r" }) {
  return (
    <svg className={`cv-midnight-bloom__vine cv-midnight-bloom__vine--${side}`} viewBox="0 0 12 130" fill="none" stroke="var(--cv-paper)" strokeLinecap="round" aria-hidden="true">
      <path d="M2 0C8 16 0 30 5 46S10 76 4 92 6 118 3 130" strokeWidth="0.5" opacity="0.8" />
      {LEAVES.map(([y, x, d]) => (
        <path key={y} d="M0 0C4-3 8-2 10 3 5 5 1 4 0 0Z" fill="var(--cv-paper)" fillOpacity="0.3" strokeWidth="0.3" transform={`translate(${x / 4} ${y}) scale(${d} 1)`} />
      ))}
      {BUDS.map(([x, y]) => (
        <g key={y}>
          <circle cx={x} cy={y} r="2.6" fill="var(--cv-gold)" stroke="none" opacity="0.2" />
          <circle cx={x} cy={y} r="1.1" fill="var(--cv-paper)" fillOpacity="0.8" strokeWidth="0.3" />
        </g>
      ))}
    </svg>
  );
}

function Peony() {
  const rings: [number, number, number][] = [
    [9, 46, 0],
    [9, 38, 20],
    [7, 28, 6],
    [6, 19, 30],
  ];
  return (
    <svg className="cv-midnight-bloom__peony" viewBox="0 0 100 70" aria-hidden="true">
      <defs>
        <radialGradient id="cv-peony-glow" cx="50%" cy="100%" r="80%">
          <stop offset="0" stopColor="var(--cv-gold)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--cv-gold)" stopOpacity="0.04" />
        </radialGradient>
      </defs>
      <g transform="translate(50 74)" fill="url(#cv-peony-glow)" stroke="var(--cv-gold)" strokeWidth="0.45" strokeLinejoin="round">
        {rings.map(([n, len, off]) =>
          Array.from({ length: n }, (_, i) => {
            const deg = off + (360 / n) * i;
            return <path key={`${len}-${i}`} d={`M0 0C${len * 0.34} ${-len * 0.25} ${len * 0.34} ${-len * 0.78} 0 ${-len}C${-len * 0.34} ${-len * 0.78} ${-len * 0.34} ${-len * 0.25} 0 0Z`} transform={`rotate(${deg})`} />;
          }),
        )}
        <circle r="3" fill="var(--cv-gold)" stroke="none" opacity="0.8" />
      </g>
    </svg>
  );
}

export function MidnightBloomCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-midnight-bloom">
      <svg className="cv-midnight-bloom__stars" viewBox="0 0 100 110" fill="var(--cv-paper)" aria-hidden="true">
        {STARS.map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
        ))}
      </svg>
      <Vine side="l" />
      <Vine side="r" />
      <span className="cv-kicker cv-midnight-bloom__kicker">DẠ HOA</span>
      <div className="cv-midnight-bloom__moon">
        <div className="cv-midnight-bloom__photo">{slot(0, "Mẫu thiệp cưới Dạ Hoa phong cách hoa nền tối", true)}</div>
      </div>
      <Peony />
      <div className="cv-midnight-bloom__text">
        <p className="cv-names cv-midnight-bloom__names">
          {b} <span className="cv-midnight-bloom__amp">&amp;</span> {a}
        </p>
        <p className="cv-date cv-midnight-bloom__date">{date}</p>
        {place && <p className="cv-place cv-midnight-bloom__place">{place}</p>}
      </div>
      {[0, 1, 2, 3, 4, 5].map((n) => (
        <i key={n} className={`cv-midnight-bloom__fly cv-midnight-bloom__fly--${n}`} aria-hidden="true" />
      ))}
    </div>
  );
}
