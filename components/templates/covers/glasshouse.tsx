import type { CoverProps } from "./types";

// Vườn Kính — a tall arched glasshouse seen straight on: photo behind a 4x6
// glazing grid, a one-off glare sweep, big vines climbing both walls over the
// glass, and the names on a stone plinth at its foot.
const LEAVES_L: [number, number, number][] = [
  [100, 6, 0], [86, 14, 180], [72, 5, 0], [58, 15, 180], [44, 6, 0], [30, 13, 180], [16, 7, 0],
];

function Vine({ side }: { side: "l" | "r" }) {
  return (
    <svg className={`cv-glasshouse__vine cv-glasshouse__vine--${side}`} viewBox="0 0 22 110" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
      <path d="M6 110C2 92 12 82 7 66S11 36 8 20C7 12 9 6 12 0" strokeWidth="0.7" />
      {LEAVES_L.map(([y, x, flip]) => (
        <path
          key={y}
          d="M0 0C5-3 11-1 13 5 7 7 2 5 0 0Z"
          fill="currentColor"
          fillOpacity="0.8"
          strokeWidth="0.3"
          transform={`translate(${x} ${y}) rotate(${flip ? 200 : -20})`}
        />
      ))}
    </svg>
  );
}

function Pot({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M-4 0h8l-1.4 7h-5.2Z" fill="currentColor" opacity="0.85" />
      <path d="M0 0C-7-6-8-13-3-18 0-12 0-6 0 0ZM0 0C7-8 9-15 4-20 1-14 0-8 0 0Z" fill="currentColor" opacity="0.55" />
    </g>
  );
}

export function GlasshouseCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-glasshouse">
      <span className="cv-kicker cv-glasshouse__kicker">VƯỜN KÍNH · TIỆC SÂN VƯỜN</span>
      <div className="cv-glasshouse__house">
        <div className="cv-glasshouse__photo">{slot(0, "Mẫu thiệp cưới Vườn Kính phong cách sân vườn vòm kính")}</div>
        <div className="cv-glasshouse__glare" aria-hidden="true">
          <i />
        </div>
        <svg className="cv-glasshouse__bars" viewBox="0 0 84 112" fill="none" stroke="white" aria-hidden="true">
          <defs>
            <clipPath id="cv-gh-arch">
              <path d="M0 112V42A42 42 0 0 1 84 42V112Z" />
            </clipPath>
          </defs>
          <g clipPath="url(#cv-gh-arch)" strokeWidth="0.7" opacity="0.92">
            <path d="M21 0V112M42 0V112M63 0V112" />
            <path d="M0 22H84M0 42H84M0 62H84M0 82H84M0 100H84" />
            <path d="M42 0V22M21 6V22M63 6V22" />
          </g>
          <path d="M0 112V42A42 42 0 0 1 84 42V112" strokeWidth="1.8" />
        </svg>
        <Vine side="l" />
        <Vine side="r" />
      </div>
      <svg className="cv-glasshouse__ground" viewBox="0 0 100 20" aria-hidden="true">
        <path d="M2 18H98" stroke="currentColor" strokeWidth="0.6" opacity="0.6" />
        <Pot x={5} />
        <Pot x={95} />
      </svg>
      <div className="cv-glasshouse__plinth">
        <p className="cv-names cv-glasshouse__names">
          {b} <span className="cv-glasshouse__amp">&amp;</span> {a}
        </p>
        <p className="cv-date cv-glasshouse__date">{date}</p>
        {place && <p className="cv-place cv-glasshouse__place">{place}</p>}
      </div>
    </div>
  );
}
