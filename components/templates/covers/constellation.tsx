import type { CoverProps } from "./types";
import { r2 } from "./util";

// Duyên Tinh Tú — the wedding date seeds a seven-star constellation joined by
// thin gold lines; the photo is a moonlit planet on a tilted orbit ring and
// the names rest in a bottom-anchored block. An empty date renders field
// stars only (never a fabricated sky). Twinkle on the faint field is the one
// ambient motion.
function hashDate(s: string): number {
  let h = 7;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

const FIELD = Array.from({ length: 36 }, (_, i) => {
  const h = hashDate(`field#${i}`);
  return { x: r2(3 + (h % 94)), y: r2(3 + (hashDate(`field#${i}y`) % 100)), r: r2(0.25 + (h % 5) * 0.08) };
});

export function ConstellationCover({ a, b, date, place, slot }: CoverProps) {
  const trimmed = date.trim();
  const stars = trimmed
    ? Array.from({ length: 7 }, (_, i) => ({ x: 8 + (hashDate(`${trimmed}#${i}a`) % 84), y: 8 + (hashDate(`${trimmed}#${i}b`) % 88) }))
    : [];
  const path = stars.map((s, i) => `${i === 0 ? "M" : "L"}${s.x} ${s.y}`).join(" ");
  const long = a.length + b.length >= 22;
  return (
    <div className={`cv-constellation${long ? " cv-constellation--long" : ""}`}>
      <svg className="cv-constellation__sky" viewBox="0 0 100 178" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g className="cv-constellation__field" fill="var(--cv-paper)">
          {FIELD.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} />
          ))}
        </g>
        {stars.length > 0 && (
          <>
            <path
              className="cv-constellation__line"
              d={path}
              fill="none"
              stroke="var(--cv-gold)"
              strokeWidth="0.35"
              strokeDasharray="1.2 0.8"
              opacity="0.9"
            />
            {stars.map((s, i) => (
              <g key={i} className="cv-constellation__star" style={{ animationDelay: `${0.35 + i * 0.09}s` }}>
                <circle cx={s.x} cy={s.y} r={i === 0 ? 2.6 : 1.8} fill="var(--cv-gold)" opacity="0.35" />
                <circle cx={s.x} cy={s.y} r={i === 0 ? 1.1 : 0.75} fill="var(--cv-paper)" />
              </g>
            ))}
          </>
        )}
      </svg>
      <svg className="cv-constellation__orbit" viewBox="0 0 100 40" fill="none" stroke="var(--cv-gold)" strokeWidth="0.35" aria-hidden="true">
        <ellipse cx="50" cy="20" rx="46" ry="11" opacity="0.7" />
        <ellipse cx="50" cy="20" rx="40" ry="8.4" opacity="0.35" />
        <circle cx="94" cy="23" r="1.4" fill="var(--cv-gold)" stroke="none" />
      </svg>
      <div className="cv-constellation__planet">{slot(0, "Mẫu thiệp cưới Duyên Tinh Tú phong cách cổ điển chòm sao", true)}</div>
      <span className="cv-kicker cv-constellation__kicker">DUYÊN TINH TÚ</span>
      <div className="cv-constellation__text">
        <p className="cv-names cv-constellation__names">
          {b}
          <span className="cv-constellation__amp">&amp;</span>
          {a}
        </p>
        <p className="cv-date cv-constellation__date">{date}</p>
        {place && <p className="cv-place cv-constellation__place">{place}</p>}
      </div>
    </div>
  );
}
