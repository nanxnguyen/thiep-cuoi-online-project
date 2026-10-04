import type { CoverProps } from "./types";
import { r2 } from "./util";

// Duyên Tinh Tú — a sky seeded by the real wedding date: the date string
// hashes to seven bright stars joined by thin lines, a fixed field of faint
// stars fills the rest, and the photo is a planet on a tilted orbit. An empty
// date renders no constellation (never a fabricated sky).
function hashDate(s: string): number {
  let h = 7;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

const FIELD = Array.from({ length: 36 }, (_, i) => {
  const h = hashDate(`field#${i}`);
  return { x: r2(3 + (h % 94)), y: r2(3 + (hashDate(`field#${i}y`) % 104)), r: r2(0.25 + (h % 5) * 0.08) };
});

export function ConstellationCover({ a, b, date, place, slot }: CoverProps) {
  const trimmed = date.trim();
  const stars = trimmed
    ? Array.from({ length: 7 }, (_, i) => ({ x: 8 + (hashDate(`${trimmed}#${i}a`) % 84), y: 8 + (hashDate(`${trimmed}#${i}b`) % 92) }))
    : [];
  const path = stars.map((s, i) => `${i === 0 ? "M" : "L"}${s.x} ${s.y}`).join(" ");
  return (
    <div className="cv-constellation">
      <svg className="cv-constellation__sky" viewBox="0 0 100 110" fill="none" aria-hidden="true">
        <defs>
          <filter id="cv-star-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>
        <g fill="var(--cv-paper)" opacity="0.6">
          {FIELD.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} />
          ))}
        </g>
        {stars.length > 0 && (
          <>
            <path d={path} stroke="var(--cv-gold)" strokeWidth="0.35" strokeDasharray="1.2 0.8" opacity="0.9" />
            {stars.map((s, i) => (
              <g key={i}>
                <circle cx={s.x} cy={s.y} r={i === 0 ? 3.2 : 2.2} fill="var(--cv-gold)" filter="url(#cv-star-glow)" opacity="0.9" />
                <circle cx={s.x} cy={s.y} r={i === 0 ? 1.4 : 0.95} fill="var(--cv-paper)" />
              </g>
            ))}
          </>
        )}
      </svg>
      <i className="cv-constellation__shoot" aria-hidden="true" />
      <svg className="cv-constellation__orbit" viewBox="0 0 100 40" fill="none" stroke="var(--cv-gold)" strokeWidth="0.35" aria-hidden="true">
        <ellipse cx="50" cy="20" rx="46" ry="11" opacity="0.7" />
        <ellipse cx="50" cy="20" rx="40" ry="8.4" opacity="0.35" />
        <circle cx="94" cy="23" r="1.4" fill="var(--cv-gold)" stroke="none" />
      </svg>
      <div className="cv-constellation__planet">{slot(0, "Ảnh cưới", true)}</div>
      <span className="cv-kicker cv-constellation__kicker">DUYÊN TINH TÚ</span>
      <p className="cv-names cv-constellation__names">
        {b}
        <span className="cv-constellation__amp">&amp;</span>
        {a}
      </p>
      <p className="cv-date cv-constellation__date">{date}</p>
      {place && <p className="cv-place cv-constellation__place">{place}</p>}
    </div>
  );
}
