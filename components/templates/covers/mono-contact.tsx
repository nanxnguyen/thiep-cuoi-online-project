import type { CoverProps } from "./types";

// Phòng Tối — a contact sheet from the darkroom: six numbered frames in black
// and white, one printed in colour and circled with a yellow grease pencil.
// Frames reuse the cover's three photo slots; nothing is invented.
const FRAMES: { n: string; slot: 0 | 1 | 2; pick?: boolean }[] = [
  { n: "1A", slot: 0 },
  { n: "2A", slot: 1 },
  { n: "3A", slot: 2 },
  { n: "4A", slot: 1 },
  { n: "5A", slot: 0, pick: true },
  { n: "6A", slot: 2 },
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
            <figcaption>{f.n}</figcaption>
          </figure>
        ))}
        <svg className="cv-mono-contact__mark" viewBox="0 0 100 60" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <path d="M18 34C16 14 56 6 84 14S96 52 62 54 8 50 20 28" />
        </svg>
        <span className="cv-mono-contact__note" aria-hidden="true">
          chọn tấm này
        </span>
      </div>
      <p className="cv-names cv-mono-contact__names">
        {b} &amp; {a}
      </p>
      {place && <p className="cv-place cv-mono-contact__place">{place}</p>}
    </div>
  );
}
