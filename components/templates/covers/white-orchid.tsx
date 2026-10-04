import type { CoverProps } from "./types";

// Mai Lan — one orchid branch arching across the whole page, five blooms and
// buds along a single stem. The bloom is one <symbol> reused at different
// sizes; fills use the `white` keyword so the flower stays pale on any paper.
const BLOOMS: [number, number, number, number][] = [
  [22, 114, 38, -20],
  [40, 94, 33, 10],
  [56, 76, 29, -8],
  [69, 58, 24, 16],
  [78, 43, 18, -12],
];

export function WhiteOrchidCover({ a, b, date, place }: CoverProps) {
  return (
    <div className="cv-white-orchid">
      <svg className="cv-white-orchid__branch" viewBox="0 0 100 178" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
        <defs>
          <symbol id="cv-orchid" viewBox="0 0 40 40">
            <g fill="white" strokeWidth="0.9">
              <ellipse cx="20" cy="8.5" rx="5" ry="8.5" />
              <ellipse cx="20" cy="8.5" rx="5" ry="8.5" transform="rotate(120 20 20)" />
              <ellipse cx="20" cy="8.5" rx="5" ry="8.5" transform="rotate(-120 20 20)" />
              <ellipse cx="9.5" cy="18" rx="9" ry="7.2" transform="rotate(-18 9.5 18)" />
              <ellipse cx="30.5" cy="18" rx="9" ry="7.2" transform="rotate(18 30.5 18)" />
              <path d="M20 21c-5 1-6 7-4 10 3 2 5 1 4-2 1 3 3 4 5 2 2-3 1-9-5-10Z" />
            </g>
            <circle cx="20" cy="21" r="2" fill="var(--cv-gold)" stroke="none" />
          </symbol>
        </defs>
        <g strokeWidth="1.2" fill="currentColor" fillOpacity="0.14">
          <path d="M10 176C8 164 14 150 22 142 18 156 14 166 10 176Z" />
          <path d="M14 176C20 166 30 158 42 156 32 164 22 170 14 176Z" />
          <path d="M8 176C2 166 4 152 12 142 12 156 12 168 8 176Z" />
        </g>
        <path d="M10 176C8 140 22 118 40 100S72 74 82 38" strokeWidth="1.3" />
        <path d="M82 38C84 30 90 24 94 20" strokeWidth="1" />
        <ellipse cx="86" cy="30" rx="2" ry="3.4" fill="white" strokeWidth="0.8" transform="rotate(30 86 30)" />
        <ellipse cx="92" cy="22" rx="1.5" ry="2.6" fill="white" strokeWidth="0.8" transform="rotate(38 92 22)" />
        {BLOOMS.map(([x, y, size, rot]) => (
          <use key={`${x}-${y}`} href="#cv-orchid" x={x - size / 2} y={y - size / 2} width={size} height={size} transform={`rotate(${rot} ${x} ${y})`} />
        ))}
      </svg>
      <span className="cv-kicker cv-white-orchid__kicker">THIỆP MỜI</span>
      <div className="cv-white-orchid__text">
        <p className="cv-names cv-white-orchid__names">
          {b} <span className="cv-white-orchid__amp">&amp;</span> {a}
        </p>
        <p className="cv-date cv-white-orchid__date">{date}</p>
        <p className="cv-place cv-white-orchid__place">{place}</p>
      </div>
    </div>
  );
}
