import type { CoverProps } from "./types";

// Sâm Panh — two flutes clink under a gold line that drops from the top of
// the page; bubbles rise through the whole card. Flutes and sparks are drawn
// as paths; bubble positions are fixed so the cover never reshuffles.
const BUBBLES: [number, number, number, number][] = [
  [12, 150, 1.6, 0], [20, 120, 1.1, 1.2], [8, 90, 1.4, 2.4], [30, 160, 1, 0.6], [88, 140, 1.5, 0.9], [78, 168, 1.1, 1.8],
  [92, 100, 1.2, 0.3], [70, 125, 0.9, 2.1], [16, 60, 1, 1.5], [84, 62, 1.3, 2.7], [50, 168, 1, 0.4], [60, 155, 1.4, 1.1],
];

function Flute() {
  return (
    <>
      <path d="M-5.2 -52H5.2L4.4 -23C4 -15 1.2 -11 1 -6V-2.2L4.6 -1.4V1H-4.6V-1.4L-1-2.2V-6C-1.2 -11 -4 -15 -4.4 -23Z" fill="var(--cv-paper)" fillOpacity="0.6" stroke="currentColor" strokeWidth="0.7" />
      <path d="M-4.8 -44H4.8L4.4 -23C4 -15 1.2 -11 1 -6H-1C-1.2 -11 -4 -15 -4.4 -23Z" fill="var(--cv-gold)" fillOpacity="0.75" />
      <g fill="none" stroke="var(--cv-paper)" strokeWidth="0.45">
        <circle cx="-1.2" cy="-30" r="0.9" />
        <circle cx="1.4" cy="-24" r="0.7" />
        <circle cx="0" cy="-37" r="0.6" />
        <circle cx="-0.4" cy="-17" r="0.5" />
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
      {BUBBLES.map(([x, y, r, delay]) => (
        <i key={`${x}-${y}`} className="cv-champagne-line__bubble" style={{ left: `${x}cqw`, top: `${y}cqw`, width: `${r * 2}cqw`, height: `${r * 2}cqw`, animationDelay: `${delay}s` }} aria-hidden="true" />
      ))}
      <svg className="cv-champagne-line__glasses" viewBox="0 0 100 100" aria-hidden="true">
        <g transform="translate(35 96) rotate(-13) scale(1.2)" color="var(--cv-deep)">
          <Flute />
        </g>
        <g transform="translate(65 96) rotate(13) scale(1.2)" color="var(--cv-deep)">
          <Flute />
        </g>
        <Spark x={50} y={34} s={2.4} />
        <Spark x={40} y={24} s={1.2} />
        <Spark x={61} y={27} s={1.5} />
      </svg>
      <span className="cv-kicker cv-champagne-line__kicker">CHÚC MỪNG</span>
      <p className="cv-names cv-champagne-line__names">
        {b} <span className="cv-champagne-line__amp">&amp;</span> {a}
      </p>
      <p className="cv-date cv-champagne-line__date">{date}</p>
      {place && <p className="cv-place cv-champagne-line__place">{place}</p>}
    </div>
  );
}
