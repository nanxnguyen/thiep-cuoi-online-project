"use client";

export type BarDatum = { label: string; value: number };

// Fluid bar column chart (div bars, % heights — no chart lib).
export function BarChart({ data, ariaLabel }: { data: readonly BarDatum[]; ariaLabel: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="adm-bars" role="img" aria-label={ariaLabel}>
      {data.map((d) => (
        <div key={d.label} className="adm-bar-col" title={`${d.label}: ${d.value}`}>
          <div className="adm-bar-track">
            <div className="adm-bar-fill" style={{ height: `${Math.round((d.value / max) * 100)}%` }} />
          </div>
          <span className="adm-bar-val">{d.value}</span>
          <span className="adm-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
