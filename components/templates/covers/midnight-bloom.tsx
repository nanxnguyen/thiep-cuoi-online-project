import type { CoverProps } from "./types";

// Dạ Hoa — a night garden: the photo is the moon, a peony of layered petals
// glows at the foot of the page, fireflies blink. Dark ground (palette is
// inverted by familyMeta.dark), gold used only for line and glow.
const STARS: [number, number, number][] = [
  [10, 12, 0.5], [22, 30, 0.35], [86, 14, 0.5], [92, 40, 0.35], [14, 62, 0.4], [80, 70, 0.3], [6, 96, 0.35], [94, 90, 0.4], [30, 8, 0.3], [70, 24, 0.3],
];

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
      <span className="cv-kicker cv-midnight-bloom__kicker">DẠ HOA</span>
      <div className="cv-midnight-bloom__moon">
        <div className="cv-midnight-bloom__photo">{slot(0, "Ảnh cưới", true)}</div>
      </div>
      <p className="cv-names cv-midnight-bloom__names">
        {b} <span className="cv-midnight-bloom__amp">&amp;</span> {a}
      </p>
      <p className="cv-date cv-midnight-bloom__date">{date}</p>
      {place && <p className="cv-place cv-midnight-bloom__place">{place}</p>}
      <Peony />
      <i className="cv-midnight-bloom__fly cv-midnight-bloom__fly--a" aria-hidden="true" />
      <i className="cv-midnight-bloom__fly cv-midnight-bloom__fly--b" aria-hidden="true" />
      <i className="cv-midnight-bloom__fly cv-midnight-bloom__fly--c" aria-hidden="true" />
    </div>
  );
}
