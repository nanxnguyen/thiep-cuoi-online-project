"use client";

import { useEffect } from "react";

// The design pages' reveal-on-scroll (design/Bang Gia.dc.html and siblings): every [data-reveal] element that starts
// below 90% of the viewport is hidden 40px low, then eases in (optional data-delay ms) when it scrolls into view.
// Elements already on screen at load are left alone. Renders nothing.
// Pages differ slightly (Trang Chu: 36px offset and a `transform` transition, so the translate snaps while opacity fades).
export function ScrollReveal({
  threshold = 0.12,
  easeOpacity = false,
  offset = 40,
  transitionProp = "translate",
  delay = 80,
  all = false,
}: {
  threshold?: number;
  easeOpacity?: boolean;
  offset?: number;
  transitionProp?: "translate" | "transform";
  delay?: number;
  /** Cong Cu hides every card, even those already on screen. */
  all?: boolean;
}) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let io: IntersectionObserver | undefined;
    const t = setTimeout(() => {
      const ease = "cubic-bezier(.2,.7,.2,1)";
      io = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (!e.isIntersecting) return;
            const el = e.target as HTMLElement;
            const d = Number(el.dataset.delay || 0);
            el.style.transition = `opacity .9s ${d}ms${easeOpacity ? ` ${ease}` : ""}, ${transitionProp} .9s ${d}ms ${ease}`;
            el.style.opacity = "1";
            el.style.translate = "0 0";
            io?.unobserve(el);
          }),
        { threshold },
      );
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (!all && el.getBoundingClientRect().top < innerHeight * 0.9) return;
        el.style.opacity = "0";
        el.style.translate = `0 ${offset}px`;
        io?.observe(el);
      });
    }, delay);
    return () => {
      clearTimeout(t);
      io?.disconnect();
    };
  }, [threshold, easeOpacity, offset, transitionProp, delay, all]);
  return null;
}
