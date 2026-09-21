"use client";

import { useState, type ReactNode } from "react";

type Option = { value: string; label: string };

// Filtering is CSS-only: the cards are server-rendered once and this component just sets data-filter on the
// grid, which hides the cards whose data-archetype does not match (see gallery.css).
export function ArchetypeFilter({ options, children }: { options: Option[]; children: ReactNode }) {
  const [filter, setFilter] = useState("all");
  return (
    <>
      <div className="tpl-filters" role="group" aria-label="Lọc theo phong cách">
        {[{ value: "all", label: "Tất cả" }, ...options].map((o) => (
          <button key={o.value} type="button" className="tpl-chip" aria-pressed={filter === o.value} onClick={() => setFilter(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
      <div className="tpl-grid" data-filter={filter}>
        {children}
      </div>
    </>
  );
}
