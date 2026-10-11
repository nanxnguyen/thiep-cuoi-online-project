import type { CoverProps } from "./types";

// Hồng Nhung — one velvet-rose cascade spilling from the top edge down toward
// the names on a deep plum ground. A single curved stem carries one hero rose
// (gold-ringed heart, soft halo — the memorable element), two mid roses, two
// side buds and one trailing bud that gestures at the names. Petal tones mix
// the palette's paper into its deep colour, so every palette key still works.
// Design-DB note ("dark floral roses luxury"): a single velvety depth cue on
// the hero bloom, restraint everywhere else.
type Bloom = { x: number; y: number; r: number; rot: number; d: number; hero?: boolean };

function RoseShape({ r, hero }: { r: number; hero?: boolean }) {
  const rings: [number, number, number][] = [
    [6, 1, 0],
    [5, 0.74, 18],
    [4, 0.52, 40],
    [3, 0.3, 10],
  ];
  return (
    <g strokeLinejoin="round">
      {hero && <circle r={r * 1.28} fill="color-mix(in srgb, var(--cv-gold) 16%, transparent)" stroke="none" />}
      {rings.map(([n, k, off], ring) =>
        Array.from({ length: n }, (_, i) => {
          const rr = r * k;
          const deg = off + (360 / n) * i;
          return <ellipse key={`${ring}-${i}`} cx={0} cy={-rr * 0.42} rx={rr * 0.66} ry={rr * 0.58} transform={`rotate(${deg})`} fill={`color-mix(in srgb, var(--cv-paper) ${46 + ring * 11}%, var(--cv-deep))`} stroke="var(--cv-deep)" strokeOpacity="0.5" strokeWidth={0.35} />;
        }),
      )}
      {hero && <circle r={r * 0.3} fill="none" stroke="var(--cv-gold)" strokeWidth={0.6} />}
      <path d={`M0 0m${-r * 0.1} 0a${r * 0.1} ${r * 0.1} 0 1 1 ${r * 0.2} 0a${r * 0.2} ${r * 0.2} 0 1 1 ${-r * 0.4} 0`} fill="none" stroke={hero ? "var(--cv-gold)" : "var(--cv-deep)"} strokeOpacity="0.65" strokeWidth={0.4} />
    </g>
  );
}

const BLOOMS: Bloom[] = [
  { x: 50, y: 46, r: 20, rot: -8, d: 0.35, hero: true },
  { x: 28, y: 30, r: 11.5, rot: 18, d: 0.5 },
  { x: 72, y: 32, r: 12.5, rot: -16, d: 0.6 },
  { x: 18, y: 50, r: 6.5, rot: 30, d: 0.75 },
  { x: 82, y: 52, r: 7, rot: -24, d: 0.85 },
  { x: 52, y: 94, r: 4.5, rot: 12, d: 1 },
];

const LEAVES: [number, number, number][] = [
  [44, 16, -30], [56, 18, 30], [36, 34, 160], [64, 36, 20], [46, 70, 200], [55, 74, -20],
];

export function RoseClusterCover({ a, b, date, place, day, month, year }: CoverProps) {
  const parts = day && month && year ? [day, month, year] : null;
  return (
    <div className="cv-rose-cluster">
      <svg className="cv-rose-cluster__cascade" viewBox="0 0 100 178" aria-hidden="true">
        <g fill="none" stroke="var(--cv-gold)" strokeLinecap="round">
          <path d="M50 -4C47 12 53 26 50 44" strokeWidth="0.5" strokeOpacity="0.9" />
          <path d="M50 22C42 24 34 26 29 30" strokeWidth="0.4" strokeOpacity="0.7" />
          <path d="M50 24C58 26 66 28 71 32" strokeWidth="0.4" strokeOpacity="0.7" />
          <path d="M38 30C30 36 24 42 20 48" strokeWidth="0.35" strokeOpacity="0.6" />
          <path d="M62 32C70 38 76 44 80 50" strokeWidth="0.35" strokeOpacity="0.6" />
          <path d="M50 46C51 62 51 78 52 90" strokeWidth="0.4" strokeOpacity="0.7" />
          {LEAVES.map(([x, y, rot]) => (
            <path key={`${x}-${y}`} d="M0 0C3-2 7-2 9 0C7 2 3 2 0 0Z" transform={`translate(${x} ${y}) rotate(${rot}) scale(1.2)`} strokeWidth="0.35" fill="var(--cv-gold)" fillOpacity="0.16" strokeOpacity="0.7" />
          ))}
        </g>
        {BLOOMS.map(({ x, y, r, rot, d, hero }) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${rot})`}>
            <g className={`cv-rose-cluster__bloom${hero ? " cv-rose-cluster__bloom--hero" : ""}`} style={{ animationDelay: `${d}s` }}>
              <RoseShape r={r} hero={hero} />
            </g>
          </g>
        ))}
      </svg>
      <div className="cv-rose-cluster__text">
        <span className="cv-kicker cv-rose-cluster__kicker">TRÂN TRỌNG KÍNH MỜI</span>
        <p className="cv-names cv-rose-cluster__names">
          {b} <span className="cv-rose-cluster__amp">&amp;</span> {a}
        </p>
        <i className="cv-rose-cluster__rule" aria-hidden="true" />
        {parts ? (
          <p className="cv-date cv-rose-cluster__date cv-rose-cluster__date--cols" aria-label={date}>
            {parts.map((p, i) => (
              <span key={i} aria-hidden="true">
                {p}
              </span>
            ))}
          </p>
        ) : (
          <p className="cv-date cv-rose-cluster__date">{date}</p>
        )}
        {place && <p className="cv-place cv-rose-cluster__place">{place}</p>}
      </div>
    </div>
  );
}
