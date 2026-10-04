import type { CoverProps } from "./types";

// Cắt Giấy — four sheets of cut paper stacked with scalloped edges and soft
// drop shadows; leaf silhouettes are cut into the middle sheets and the photo
// sits in an oval window on the top sheet. Depth is shadow, not gradient.
function Sprig({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 40 90" fill="currentColor" aria-hidden="true">
      <path d="M20 90C18 70 22 50 20 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M20 78C8 76 2 68 2 58C14 60 20 68 20 78ZM20 62C32 60 38 52 38 42C26 44 20 52 20 62ZM20 46C10 44 4 38 4 28C14 30 20 36 20 46ZM20 32C30 30 34 24 34 16C26 18 20 24 20 32ZM20 24C16 16 18 8 22 2C26 8 24 16 20 24Z" />
    </svg>
  );
}

export function PaperCutCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-paper-cut">
      <div className="cv-paper-cut__sheet cv-paper-cut__sheet--2">
        <Sprig className="cv-paper-cut__sprig cv-paper-cut__sprig--l" />
        <Sprig className="cv-paper-cut__sprig cv-paper-cut__sprig--r" />
      </div>
      <div className="cv-paper-cut__sheet cv-paper-cut__sheet--3" />
      <div className="cv-paper-cut__sheet cv-paper-cut__sheet--4">
        <span className="cv-kicker cv-paper-cut__kicker">TRÂN TRỌNG KÍNH MỜI</span>
        <div className="cv-paper-cut__photo">{slot(0, "Ảnh cưới")}</div>
        <p className="cv-names cv-paper-cut__names">
          {b} <span className="cv-paper-cut__amp">&amp;</span> {a}
        </p>
        <p className="cv-date cv-paper-cut__date">{date}</p>
        {place && <p className="cv-place cv-paper-cut__place">{place}</p>}
      </div>
    </div>
  );
}
