import type { CoverProps } from "./types";

// Hồng Nhung — a cluster of drawn roses spills in from the top edge onto a
// deep ground, a thin row of small ones closes the base. A rose is four rings
// of overlapping petal ellipses with a spiral heart; tones come from mixing
// the palette's paper into its deep colour, so every palette key still works.
type Rose = { x: number; y: number; r: number; rot: number };

function RoseShape({ x, y, r, rot }: Rose) {
  const rings: [number, number, number][] = [
    [6, 1, 0],
    [5, 0.76, 18],
    [4, 0.54, 40],
    [3, 0.32, 10],
  ];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} strokeLinejoin="round">
      {rings.map(([n, k, off], ring) =>
        Array.from({ length: n }, (_, i) => {
          const rr = r * k;
          const deg = off + (360 / n) * i;
          return <ellipse key={`${ring}-${i}`} cx={0} cy={-rr * 0.4} rx={rr * 0.66} ry={rr * 0.56} transform={`rotate(${deg})`} fill={`color-mix(in srgb, var(--cv-paper) ${46 + ring * 11}%, var(--cv-deep))`} stroke="var(--cv-deep)" strokeOpacity="0.5" strokeWidth={0.35} />;
        }),
      )}
      <path d={`M0 0m${-r * 0.1} 0a${r * 0.1} ${r * 0.1} 0 1 1 ${r * 0.2} 0a${r * 0.2} ${r * 0.2} 0 1 1 ${-r * 0.4} 0`} fill="none" stroke="var(--cv-deep)" strokeOpacity="0.6" strokeWidth={0.4} />
    </g>
  );
}

const TOP: Rose[] = [
  { x: 20, y: 12, r: 23, rot: 10 },
  { x: 56, y: 6, r: 27, rot: -14 },
  { x: 86, y: 24, r: 21, rot: 24 },
  { x: 38, y: 36, r: 17, rot: -30 },
  { x: 70, y: 44, r: 13, rot: 8 },
  { x: 8, y: 40, r: 11, rot: 40 },
];
const BASE: Rose[] = [10, 30, 50, 70, 90].map((x, i) => ({ x, y: 176, r: 9 + (i % 2) * 2, rot: i * 24 }));
const LEAVES: [number, number, number][] = [
  [4, 30, -50], [30, 52, 20], [48, 28, -20], [64, 26, 30], [78, 50, -35], [94, 44, 55], [12, 168, -30], [40, 170, 25], [62, 172, -25], [84, 170, 35],
];

export function RoseClusterCover({ a, b, date, place }: CoverProps) {
  return (
    <div className="cv-rose-cluster">
      <svg className="cv-rose-cluster__art" viewBox="0 0 100 178" aria-hidden="true">
        {LEAVES.map(([x, y, rot]) => (
          <path key={`${x}-${y}`} d="M0 0C6-4 12-4 16 0C12 4 6 4 0 0Z" transform={`translate(${x} ${y}) rotate(${rot}) scale(1.5)`} fill="var(--cv-gold)" fillOpacity="0.5" stroke="var(--cv-gold)" strokeOpacity="0.8" strokeWidth="0.25" />
        ))}
        {TOP.map((r) => (
          <RoseShape key={`${r.x}-${r.y}`} {...r} />
        ))}
        {BASE.map((r) => (
          <RoseShape key={`${r.x}-${r.y}`} {...r} />
        ))}
      </svg>
      <span className="cv-kicker cv-rose-cluster__kicker">THE WEDDING OF</span>
      <p className="cv-names cv-rose-cluster__names">
        {b}
        <span className="cv-rose-cluster__amp">and</span>
        {a}
      </p>
      <p className="cv-date cv-rose-cluster__date">{date}</p>
      {place && <p className="cv-place cv-rose-cluster__place">{place}</p>}
    </div>
  );
}
