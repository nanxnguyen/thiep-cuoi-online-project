"use client";

import { useEffect, useRef, useState } from "react";

// Nút nổi cho khách tự cuộn thiệp từ đầu đến cuối: cuộn mượt ~140px/s,
// chạm/wheel/phím bất kỳ là dừng. Ẩn hẳn khi prefers-reduced-motion.
const SPEED = 140;

export function AutoScroll({ startLabel, stopLabel }: { startLabel: string; stopLabel: string }) {
  const [running, setRunning] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const raf = useRef(0);
  const last = useRef(0);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAllowed(!query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => () => window.cancelAnimationFrame(raf.current), []);

  function stop() {
    window.cancelAnimationFrame(raf.current);
    setRunning(false);
  }

  function tick(now: number) {
    const dy = ((now - last.current) / 1000) * SPEED;
    last.current = now;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY + dy >= max - 2) {
      window.scrollTo({ top: max });
      setRunning(false);
      return;
    }
    window.scrollBy({ top: dy });
    raf.current = window.requestAnimationFrame(tick);
  }

  function toggle() {
    if (running) return stop();
    last.current = performance.now();
    setRunning(true);
    const cancel = () => stop();
    window.addEventListener("pointerdown", cancel, { once: true });
    window.addEventListener("wheel", cancel, { once: true, passive: true });
    window.addEventListener("touchmove", cancel, { once: true, passive: true });
    window.addEventListener("keydown", cancel, { once: true });
    raf.current = window.requestAnimationFrame(tick);
  }

  if (!allowed) return null;
  return (
    <button
      type="button"
      className="inv-autoscroll"
      data-running={running}
      onClick={toggle}
      aria-pressed={running}
      aria-label={running ? stopLabel : startLabel}
      title={running ? stopLabel : startLabel}
    >
      <span aria-hidden="true">{running ? "❚❚" : "↓"}</span>
    </button>
  );
}
