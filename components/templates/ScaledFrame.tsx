"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

// Shows content that is laid out for a phone (designWidth px) shrunk to fit whatever width the wrapper gets.
// The scale is measured, not guessed, so it stays sharp from a 2-column phone grid to a wide desktop grid.
// The caller styles the wrapper (size, radius, shadow) through className.
export function ScaledFrame({ designWidth = 390, className, children }: { designWidth?: number; className?: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / designWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, [designWidth]);

  return (
    <div className={className} ref={box} aria-hidden="true" style={{ position: "relative", overflow: "hidden" }}>
      <div
        style={{ position: "absolute", top: 0, left: 0, width: designWidth, transformOrigin: "top left", transform: `scale(${scale})`, pointerEvents: "none" }}
      >
        {children}
      </div>
    </div>
  );
}
