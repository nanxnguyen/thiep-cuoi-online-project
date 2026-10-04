import type { CoverProps } from "./types";

// Quán Quen — the regular café: a menu card whose "dishes" are the milestones,
// the photo sits as a coaster under a drawn cup. All labels are fixed words;
// nothing is dated except the cover date.
export function CafeCardCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-cafe-card">
      <div className="cv-cafe-card__menu">
        <span className="cv-kicker cv-cafe-card__kicker">QUÁN QUEN · THỰC ĐƠN</span>
        <div className="cv-cafe-card__coaster">{slot(0, "Ảnh cưới", true)}</div>
        <svg className="cv-cafe-card__cup" viewBox="0 0 60 50" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 18H44V30C44 38 38 44 26 44S8 38 8 30Z" fill="var(--cv-paper)" />
          <path d="M44 22H50C55 22 55 33 48 33H43" />
          <path d="M4 47H48" />
          <path className="cv-cafe-card__steam" d="M18 12C14 8 22 6 18 1M28 12C24 8 32 6 28 1M38 12C34 8 42 6 38 1" strokeWidth="1" />
        </svg>
        <p className="cv-names cv-cafe-card__names">
          {b} <span className="cv-cafe-card__amp">&amp;</span> {a}
        </p>
        <ul className="cv-cafe-card__items">
          <li>
            <span>Khai vị</span>
            <i />
            <b>lần đầu gặp nhau</b>
          </li>
          <li>
            <span>Món chính</span>
            <i />
            <b>bên nhau mỗi ngày</b>
          </li>
          <li>
            <span>Tráng miệng</span>
            <i />
            <b>ngày chung đôi</b>
          </li>
        </ul>
        <p className="cv-date cv-cafe-card__date">{date}</p>
        {place && <p className="cv-place cv-cafe-card__place">{place}</p>}
      </div>
    </div>
  );
}
