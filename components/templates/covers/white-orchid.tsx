import type { CoverProps } from "./types";

// Mai Lan — one big orchid branch running from the top-right corner down to
// mid-left, seven blooms and two buds along it; the bottom-left stays empty
// for the names. The bloom is one <symbol> reused at different sizes.
const BLOOMS: [number, number, number, number][] = [
  [90, 16, 26, 15],
  [76, 36, 32, -12],
  [62, 54, 36, 8],
  [44, 70, 34, -18],
  [28, 86, 32, 12],
  [14, 104, 28, -8],
  [54, 36, 20, 24],
];

function Petal({ rot }: { rot: number }) {
  return <path d="M20 20C13 14 13 5 20 0 27 5 27 14 20 20Z" transform={`rotate(${rot} 20 20)`} />;
}

export function WhiteOrchidCover({ a, b, date, place, day, month, year }: CoverProps) {
  const parts = day && month && year ? [day, month, year] : null;
  return (
    <div className="cv-white-orchid">
      <svg className="cv-white-orchid__branch" viewBox="0 0 100 178" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
        <defs>
          <symbol id="cv-orchid" viewBox="0 0 40 40" overflow="visible">
            <g className="cv-white-orchid__petal" strokeWidth="0.45" strokeLinejoin="round">
              <Petal rot={0} />
              <Petal rot={72} />
              <Petal rot={144} />
              <Petal rot={216} />
              <Petal rot={288} />
            </g>
            <path d="M20 20C18 24 19 28 20 30 21 28 22 24 20 20Z" className="cv-white-orchid__lip" strokeWidth="0.3" />
            <circle cx="20" cy="20" r="2.2" fill="var(--cv-gold)" stroke="none" />
          </symbol>
        </defs>
        <g className="cv-white-orchid__grow">
          <g strokeWidth="0.5" fill="currentColor" fillOpacity="0.12">
            <path d="M100 -2C80 10 62 6 50 22 64 20 84 18 100 -2Z" />
            <path d="M66 52C46 46 34 56 22 76 42 70 56 66 66 52Z" />
            <path d="M34 88C16 82 6 94 0 114 18 108 28 102 34 88Z" />
            <path d="M80 30C94 36 100 50 98 66 86 58 80 46 80 30Z" />
          </g>
          <path d="M104 -4C82 14 74 38 56 62S18 98 4 126" strokeWidth="0.9" />
          <path d="M56 62C58 74 52 84 44 92" strokeWidth="0.5" />
          <ellipse cx="46" cy="94" rx="2.4" ry="4" className="cv-white-orchid__petal" strokeWidth="0.4" transform="rotate(25 46 94)" />
          <path d="M20 94C22 104 20 112 14 118" strokeWidth="0.5" />
          <ellipse cx="14" cy="120" rx="2.2" ry="3.6" className="cv-white-orchid__petal" strokeWidth="0.4" transform="rotate(20 14 120)" />
        </g>
        {BLOOMS.map(([x, y, size, rot], i) => (
          <use
            key={`${x}-${y}`}
            className="cv-white-orchid__bloom"
            style={{ animationDelay: `${0.5 + i * 0.1}s`, transformOrigin: `${x}px ${y}px` }}
            href="#cv-orchid"
            x={x - size / 2}
            y={y - size / 2}
            width={size}
            height={size}
            transform={`rotate(${rot} ${x} ${y})`}
          />
        ))}
      </svg>
      <span className="cv-kicker cv-white-orchid__kicker">THIỆP MỜI</span>
      <div className="cv-white-orchid__text">
        <p className="cv-names cv-white-orchid__names">
          {b} <span className="cv-white-orchid__amp">&amp;</span> {a}
        </p>
        {parts ? (
          <p className="cv-date cv-white-orchid__date cv-white-orchid__date--cols" aria-label={date}>
            {parts.map((p, i) => (
              <span key={i} aria-hidden="true">
                {p}
              </span>
            ))}
          </p>
        ) : (
          <p className="cv-date cv-white-orchid__date">{date}</p>
        )}
        {place && <p className="cv-place cv-white-orchid__place">{place}</p>}
      </div>
    </div>
  );
}
