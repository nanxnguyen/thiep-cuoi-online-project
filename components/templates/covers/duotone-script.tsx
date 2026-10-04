import type { CoverProps } from "./types";

// Sắc Đôi — the photo is printed in two inks (deep for shadows, gold for
// lights), set against a solid column that carries the date upright. Large
// handwritten words overlap the seam between column and photo.
export function DuotoneScriptCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-duotone-script">
      <div className="cv-duotone-script__column" aria-hidden="true">
        <span>{date}</span>
      </div>
      <div className="cv-duotone-script__photo">{slot(0, "Ảnh cưới")}</div>
      <p className="cv-duotone-script__script" aria-hidden="true">
        Ngày
        <br />
        cưới
      </p>
      <div className="cv-duotone-script__text">
        <p className="cv-names cv-duotone-script__names">
          {b} <span className="cv-duotone-script__amp">&amp;</span> {a}
        </p>
        {place && <p className="cv-place cv-duotone-script__place">{place}</p>}
      </div>
    </div>
  );
}
