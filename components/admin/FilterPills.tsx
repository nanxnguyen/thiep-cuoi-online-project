"use client";

export type PillOption = { value: string; label: string; count?: number };

export type FilterPillsProps = {
  options: readonly PillOption[];
  active: string;
  onChange: (value: string) => void;
  ariaLabel: string;
};

export function FilterPills({ options, active, onChange, ariaLabel }: FilterPillsProps) {
  return (
    <div className="adm-pills" role="group" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={opt.value === active}
          className={opt.value === active ? "adm-pill adm-pill-active" : "adm-pill"}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
          {opt.count !== undefined ? <span className="adm-pill-count">{opt.count}</span> : null}
        </button>
      ))}
    </div>
  );
}
