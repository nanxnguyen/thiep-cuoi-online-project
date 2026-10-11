import type { CoverProps } from "./types";

// Phòng Tối — a contact sheet from the darkroom: five small frames in black
// and white around one frame printed in colour at 2x2 and circled with a
// grease pencil. Frames reuse the cover's three photo slots; nothing is invented.
const FRAMES: { n: string; slot: 0 | 1 | 2; pick?: boolean }[] = [
  { n: "10A", slot: 1 },
  { n: "11A", slot: 2 },
  { n: "12A", slot: 1 },
  { n: "13A", slot: 0, pick: true },
  { n: "14A", slot: 2 },
  { n: "15A", slot: 1 },
];

export function MonoContactCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-mono-contact">
      <div className="cv-mono-contact__head">
        <span>PHÒNG TỐI · CUỘN 01</span>
        <span>{date}</span>
      </div>
      <div className="cv-mono-contact__sheet">
        {FRAMES.map((f) => (
          <figure key={f.n} className={`cv-mono-contact__frame${f.pick ? " cv-mono-contact__frame--pick" : ""}`}>
            <div className="cv-mono-contact__img">{slot(f.slot, `Khung ${f.n}`)}</div>
            <figcaption>
              {f.n}
              {f.pick && <em aria-hidden="true">chọn tấm này</em>}
            </figcaption>
            {f.pick && (
              <svg className="cv-mono-contact__mark" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" aria-hidden="true">
                <path d="M12 58C4 24 46 4 80 14S98 66 60 90 8 84 16 38" />
              </svg>
            )}
          </figure>
        ))}
      </div>
      <div className="cv-mono-contact__text">
        <p className="cv-names cv-mono-contact__names">
          {b} &amp; {a}
        </p>
        {place && <p className="cv-place cv-mono-contact__place">{place}</p>}
      </div>
    </div>
  );
}
