"use client";

import { useEffect, useState } from "react";
import { remaining } from "@/lib/datetime";
import { t, type Locale } from "@/lib/i18n";

const pad = (n: number) => String(n).padStart(2, "0");

// The first render uses the server's `nowIso` so hydration matches; the real clock takes over after mount.
export function CountdownClock({ targetIso, nowIso, locale = "vi" }: { targetIso: string; nowIso: string; locale?: Locale }) {
  const dict = t(locale);
  const target = new Date(targetIso);
  const [now, setNow] = useState(() => new Date(nowIso));

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const r = remaining(target, now);
  const cells: [string, number][] = [
    [dict.days, r.days],
    [dict.hours, r.hours],
    [dict.minutes, r.minutes],
    [dict.seconds, r.seconds],
  ];

  return (
    <div className="inv-clock" role="timer">
      <p className="inv-sr-only">{dict.srCountdown(r.days)}</p>
      {cells.map(([label, value]) => (
        <div className="inv-clock__cell" key={label} aria-hidden="true">
          <span className="inv-clock__num" key={value}>{label === dict.days ? value : pad(value)}</span>
          <span className="inv-clock__label">{label}</span>
        </div>
      ))}
    </div>
  );
}
