"use client";

export type DonutSegment = { label: string; value: number; color: string };

// Donut via conic-gradient + legend list (no chart lib).
export function Donut({ segments, ariaLabel }: { segments: readonly DonutSegment[]; ariaLabel: string }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let acc = 0;
  const stops = segments
    .map((s) => {
      const from = total === 0 ? 0 : (acc / total) * 100;
      acc += s.value;
      const to = total === 0 ? 0 : (acc / total) * 100;
      return `${s.color} ${from.toFixed(1)}% ${to.toFixed(1)}%`;
    })
    .join(", ");
  return (
    <div className="adm-donut-wrap">
      <div
        className="adm-donut"
        role="img"
        aria-label={ariaLabel}
        style={{ background: total === 0 ? "var(--line)" : `conic-gradient(${stops})` }}
      >
        <span className="adm-donut-total">{total}</span>
      </div>
      <ul className="adm-legend">
        {segments.map((s) => (
          <li key={s.label}>
            <span className="adm-legend-swatch" style={{ background: s.color }} aria-hidden="true" />
            <span className="adm-legend-label">{s.label}</span>
            <span className="adm-legend-val">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
