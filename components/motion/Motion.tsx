"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import * as m from "motion/react-m";
import type { ReactNode } from "react";

// One provider per page: loads only the DOM animation features (a small subset of Motion) and turns transform
// animations off for people whose system asks for reduced motion.
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>{children}</LazyMotion>
    </MotionConfig>
  );
}

const ease = [0.2, 0.7, 0.2, 1] as const;
const viewport = { once: true, margin: "0px 0px -70px 0px" } as const;

// Fades and lifts its content in the first time it scrolls into view. Only used below the fold.
export function FadeUp({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <m.div className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: 0.75, delay, ease }}>
      {children}
    </m.div>
  );
}

// Same, but renders an <article> so a grid item keeps its own styling and semantics.
export function FadeUpArticle({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <m.article className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: 0.75, delay, ease }}>
      {children}
    </m.article>
  );
}
