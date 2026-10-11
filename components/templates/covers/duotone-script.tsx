import type { CoverProps } from "./types";

// Sắc Đôi — the photo is printed in two inks (deep for shadows, gold for
// lights) beside a solid column that carries the date upright. A giant script
// of the two given names writes across the seam; the full names sit below.
const given = (full: string) => full.trim().split(/\s+/).pop() ?? "";
const scriptSize = (n: number) => (n <= 4 ? 32 : n <= 6 ? 26 : n <= 9 ? 20 : 15);

export function DuotoneScriptCover({ a, b, date, place, slot }: CoverProps) {
  const gb = given(b);
  const ga = given(a);
  const size = scriptSize(Math.max(gb.length, ga.length + 2));
  return (
    <div className="cv-duotone-script">
      <div className="cv-duotone-script__column" aria-hidden="true">
        <span>{date}</span>
      </div>
      <div className="cv-duotone-script__photo">{slot(0, "Mẫu thiệp cưới Sắc Đôi phong cách hiện đại ảnh hai tông")}</div>
      <i className="cv-duotone-script__scrim" aria-hidden="true" />
      <i className="cv-duotone-script__dot" aria-hidden="true" />
      <p className="cv-duotone-script__script" aria-hidden="true" style={{ fontSize: `${size}cqw` }}>
        <span>{gb}</span>
        <span>&amp; {ga}</span>
      </p>
      <div className="cv-duotone-script__text">
        <p className="cv-kicker cv-duotone-script__kicker">THE WEDDING OF</p>
        <p className="cv-names cv-duotone-script__names">
          {b} <span className="cv-duotone-script__amp">&amp;</span> {a}
        </p>
        {place && <p className="cv-place cv-duotone-script__place">{place}</p>}
      </div>
    </div>
  );
}
