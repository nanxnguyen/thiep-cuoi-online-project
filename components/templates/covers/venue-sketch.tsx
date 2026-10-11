import type { CoverProps } from "./types";

// Nơi Mình Hẹn — the venue as a line drawing: a columned pavilion with an
// arched doorway (the photo sits in it), steps, two trees, a rising sun and
// drifting clouds. Names sit on the sky above; the date is a nameplate below.
export function VenueSketchCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-venue-sketch">
      <span className="cv-kicker cv-venue-sketch__kicker">NƠI MÌNH HẸN</span>
      <div className="cv-venue-sketch__sky">
        <p className="cv-names cv-venue-sketch__names">
          {b} <span className="cv-venue-sketch__amp">&amp;</span> {a}
        </p>
      </div>
      <i className="cv-venue-sketch__cloud cv-venue-sketch__cloud--a" aria-hidden="true" />
      <i className="cv-venue-sketch__cloud cv-venue-sketch__cloud--b" aria-hidden="true" />
      <i className="cv-venue-sketch__sun" aria-hidden="true" />
      <svg className="cv-venue-sketch__art" viewBox="0 0 100 88" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <g fill="currentColor" fillOpacity="0.1" stroke="none">
          <ellipse cx="7" cy="46" rx="9" ry="12" />
          <ellipse cx="93" cy="46" rx="9" ry="12" />
        </g>
        <path d="M14 30L50 6L86 30Z M14 30H86V74H14Z" fill="var(--cv-paper)" stroke="none" />
        <path d="M33 74V50A17 17 0 0 1 67 50V74Z" fill="currentColor" fillOpacity="0.14" stroke="none" />
        <g className="cv-venue-sketch__draw" strokeWidth="0.6">
          <path pathLength="1" d="M12 30L50 6L88 30Z" />
          <path pathLength="1" d="M14 30H86M14 34H86" />
          <path pathLength="1" d="M20 34V74M30 34V74M70 34V74M80 34V74" />
          <path pathLength="1" d="M33 74V50A17 17 0 0 1 67 50V74" />
          <path pathLength="1" d="M10 74H90M6 78H94M2 82H98" />
          <path pathLength="1" d="M7 82V58M93 82V58" />
          <path pathLength="1" d="M7 58C-3 58-3 38 7 34 17 38 17 58 7 58ZM93 58C83 58 83 38 93 34 103 38 103 58 93 58Z" />
          <circle pathLength="1" cx="50" cy="20" r="3.4" />
        </g>
      </svg>
      <div className="cv-venue-sketch__photo">{slot(0, "Mẫu thiệp cưới Nơi Mình Hẹn phong cách line-art địa điểm", true)}</div>
      <div className="cv-venue-sketch__foot">
        <p className="cv-date cv-venue-sketch__date">{date}</p>
        {place && <p className="cv-place cv-venue-sketch__place">{place}</p>}
      </div>
    </div>
  );
}
