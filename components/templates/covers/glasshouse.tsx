import type { CoverProps } from "./types";

// Vườn Kính — a gabled greenhouse seen straight on: photo behind glazing
// bars, glare bands, a climbing vine and two potted plants. The gable (not an
// arch) is the silhouette so it never reads as another arched-photo cover.
function Pot({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 44) scale(0.75)`}>
      <path d="M-5 168h10l-1.6 8h-6.8Z" fill="currentColor" opacity="0.85" />
      <path d="M0 168C-8 160-9 152-4 146 0 152 0 160 0 168ZM0 168C8 158 10 150 5 144 1 150 0 158 0 168ZM0 168C-2 156 0 146 0 138 3 146 3 158 0 168Z" fill="currentColor" opacity="0.5" />
    </g>
  );
}

export function GlasshouseCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-glasshouse">
      <span className="cv-kicker cv-glasshouse__kicker">VƯỜN KÍNH · TIỆC SÂN VƯỜN</span>
      <div className="cv-glasshouse__house">
        <div className="cv-glasshouse__photo">{slot(0, "Ảnh cưới")}</div>
        <div className="cv-glasshouse__glare" aria-hidden="true" />
        <svg className="cv-glasshouse__bars" viewBox="0 0 72 106" fill="none" stroke="white" strokeWidth="0.9" aria-hidden="true">
          <path d="M0 27.5L36 0L72 27.5V106H0Z" strokeWidth="1.6" />
          <path d="M18 14V106M36 0V106M54 14V106" opacity="0.9" />
          <path d="M0 52H72M0 76H72" opacity="0.9" />
          <path d="M0 27.5H72" opacity="0.9" />
        </svg>
        <svg className="cv-glasshouse__vine" viewBox="0 0 30 106" fill="currentColor" aria-hidden="true">
          <path d="M4 106C2 80 10 64 6 40S10 10 12 0" fill="none" stroke="currentColor" strokeWidth="0.9" />
          <path d="M6 88c-5-1-8-5-8-9 5 0 8 4 8 9ZM10 70c6-1 10-5 10-9-6 0-10 4-10 9ZM5 54c-5-1-8-5-8-9 5 0 8 4 8 9ZM9 36c6-1 10-5 10-9-6 0-10 4-10 9ZM7 20c-5-1-8-5-8-9 5 0 8 4 8 9Z" opacity="0.75" />
        </svg>
      </div>
      <p className="cv-names cv-glasshouse__names">
        {b} <span className="cv-glasshouse__amp">&amp;</span> {a}
      </p>
      <p className="cv-date cv-glasshouse__date">{date}</p>
      <p className="cv-place cv-glasshouse__place">{place}</p>
      <svg className="cv-glasshouse__ground" viewBox="0 0 100 178" aria-hidden="true">
        <path d="M6 168H94" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        <Pot x={8} />
        <Pot x={92} />
      </svg>
    </div>
  );
}
