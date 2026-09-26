"use client";

import { useRef, useState } from "react";

// Transfer details with one-tap copy and a small toast (design/Ung Ho.dc.html).
export function CopyRows({ rows }: { rows: readonly (readonly [string, string])[] }) {
  const [toast, setToast] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setToast(`Đã sao chép ${label.toLowerCase()}`);
    } catch {
      setToast("Không sao chép được, hãy chọn và sao chép tay");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 1800);
  }
  return (
    <>
      <dl className="donate-rows">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
            <button type="button" className="tool-copy" onClick={() => void copy(label, value)} aria-label={`Sao chép ${label.toLowerCase()}`}>
              Sao chép
            </button>
          </div>
        ))}
      </dl>
      <p className="donate-toast" role="status" aria-live="polite">
        {toast && <span key={toast}>{toast}</span>}
      </p>
    </>
  );
}
