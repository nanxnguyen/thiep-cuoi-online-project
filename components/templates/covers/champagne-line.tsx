import type { CoverProps } from "./types";

// Sâm Panh — a gold line runs the full height of the card; two flutes clink on
// it, bubbles rise, groom and bride sit either side and the date on the line.
const BUBBLES: [number, number, number][] = [
  [12, 150, 1.8], [20, 120, 1.1], [8, 90, 1.5], [30, 160, 1], [88, 140, 1.7], [78, 168, 1.1],
  [92, 100, 1.3], [70, 125, 0.9], [16, 60, 1.2], [84, 62, 1.4], [42, 168, 0.8], [60, 155, 1.5],
];

function Flute() {
  return (
    <>
      <path d="M-5.2 -52H5.2L4.4 -23C4 -15 1.2 -11 1 -6V-2.2L4.6 -1.4V1H-4.6V-1.4L-1-2.2V-6C-1.2 -11 -4 -15 -4.4 -23Z" fill="var(--cv-paper)" fillOpacity="0.55" stroke="currentColor" strokeWidth="0.5" />
      <path d="M-4.3 -50.5H4.3L3.7 -23C3.3 -15.5 0.6 -11 0.4 -6.4V-3" fill="none" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.6" />
      <path d="M-4.8 -44H4.8L4.4 -23C4 -15 1.2 -11 1 -6H-1C-1.2 -11 -4 -15 -4.4 -23Z" fill="url(#cv-champagne-fill)" />
      <g fill="none" stroke="var(--cv-paper)" strokeWidth="0.45">
        <circle cx="-1.2" cy="-30" r="0.9" />
        <circle cx="1.4" cy="-24" r="0.7" />
        <circle cx="0" cy="-37" r="0.6" />
      </g>
    </>
  );
}

function Spark({ x, y, s }: { x: number; y: number; s: number }) {
  return <path d="M0-4C0-1 1 0 4 0C1 0 0 1 0 4C0 1-1 0-4 0C-1 0 0-1 0-4Z" transform={`translate(${x} ${y}) scale(${s})`} fill="var(--cv-gold)" />;
}

export function ChampagneLineCover({ a, b, date, place }: CoverProps) {
  return (
    <div className="cv-champagne-line">
      <i className="cv-champagne-line__line" aria-hidden="true" />
      {BUBBLES.map(([x, y, r], i) => (
        <i key={`${x}-${y}`} className="cv-champagne-line__bubble" style={{ left: `${x}cqw`, top: `${y}cqw`, width: `${r * 2}cqw`, height: `${r * 2}cqw`, animationDelay: `${(i * 0.43).toFixed(2)}s` }} aria-hidden="true" />
      ))}
      <svg className="cv-champagne-line__glasses" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id="cv-champagne-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--cv-paper)" />
            <stop offset="1" stopColor="var(--cv-gold)" />
          </linearGradient>
        </defs>
        <g transform="translate(34 96) scale(1.25)" color="var(--cv-deep)">
          <g className="cv-champagne-line__flute cv-champagne-line__flute--l">
            <Flute />
          </g>
        </g>
        <g transform="translate(66 96) scale(1.25)" color="var(--cv-deep)">
          <g className="cv-champagne-line__flute cv-champagne-line__flute--r">
            <Flute />
          </g>
        </g>
        <Spark x={50} y={34} s={2.6} />
        <Spark x={40} y={22} s={1.2} />
        <Spark x={61} y={26} s={1.5} />
      </svg>
      <span className="cv-kicker cv-champagne-line__kicker">CHÚC MỪNG</span>
      <div className="cv-champagne-line__text">
        <p className="cv-names cv-champagne-line__names">
          <span className="cv-champagne-line__name cv-champagne-line__name--l">{b}</span>
          <span className="cv-champagne-line__amp">&amp;</span>
          <span className="cv-champagne-line__name cv-champagne-line__name--r">{a}</span>
        </p>
        <p className="cv-date cv-champagne-line__date">{date}</p>
        {place && <p className="cv-place cv-champagne-line__place">{place}</p>}
      </div>
    </div>
  );
}
