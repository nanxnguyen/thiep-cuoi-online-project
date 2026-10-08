"use client";

export type StatDelta = { text: string; tone: "up" | "down" | "flat" };

export type StatCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  delta?: StatDelta;
  spark?: readonly number[];
};

// KPI card: label, serif value, optional sub-line, delta badge, SVG sparkline.
export function StatCard({ label, value, sub, delta, spark }: StatCardProps) {
  const points = spark && spark.length > 1 ? sparkline(spark) : null;
  return (
    <section className="adm-stat" aria-label={label}>
      <div className="adm-stat-label">{label}</div>
      <div className="adm-stat-value">{value}</div>
      {sub ? <div className="adm-stat-sub">{sub}</div> : null}
      <div className="adm-stat-foot">
        {delta ? (
          <span className={`adm-delta adm-delta-${delta.tone}`} aria-label={`Xu hướng: ${delta.text}`}>
            {delta.text}
          </span>
        ) : null}
        {points ? (
          <svg className="adm-spark" viewBox="0 0 96 28" aria-hidden="true" preserveAspectRatio="none">
            <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        ) : null}
      </div>
    </section>
  );
}

function sparkline(values: readonly number[]): string {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => `${((i / (values.length - 1)) * 92 + 2).toFixed(1)},${(26 - ((v - min) / span) * 24).toFixed(1)}`)
    .join(" ");
}
