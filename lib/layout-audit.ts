// Pure logic for the layout probe (scripts/layout-probe.js): diff two snapshots (desktop must not move) and audit a
// phone snapshot against the mobile-first criteria (docs/superpowers/specs/2026-10-07-mobile-first-design.md §6).

export type ElementRecord = { p: string; o: number[]; s: string[] };
export type TapRecord = { p: string; w: number; h: number; inText: boolean };
export type InputRecord = { p: string; fs: number };
export type RouteSnapshot = {
  route: string;
  clientWidth: number;
  scrollWidth: number;
  broken: string[];
  h1Lines: number | null;
  els: ElementRecord[];
  taps: TapRecord[];
  inputs: InputRecord[];
};
export type Snapshot = { vw: number; vh: number; props: string[]; routes: RouteSnapshot[] };
export type Change = { route: string; path: string; what: string };
export type Finding = { route: string; rule: "overflow" | "broken-image" | "tap-target" | "input-font" | "hero-lines"; detail: string };

// Content that moves on its own (countdown clock, marquee mounting in batches, typing and rotating text): never a
// layout regression, so the diff skips it.
export const DYNAMIC = /hm-marquee__track|hm-chip--days|hm-cd|hm-rsvp__bar|hm-wish|hm-invite__name|moc-|gal-rank__bar|lp-qr__scan/;
// Colour-swatch groups only need WCAG 2.5.8 AA (24×24): a row of 44px dots does not fit a two-column card.
export const SWATCH = /gal-swatches|gal-dots|tdt__colors|demo-color|pn-color-options|pq__swatches|edf-swatch/;
// /templates/[id]?preview=1 renders the same InvitationRenderer as the Studio frame (data-mode="preview"), whose
// design/ values are pinned (spec §2.1), so only overflow and broken images are checked there.
export const PINNED_PREVIEW = /[?&]preview=1/;
export const TAP = 44;
export const TAP_SWATCH = 24;

// A `margin: 0 auto` container reports its resolved side margins (0px or e.g. 130px) inconsistently between runs of
// the same build. The box (offsetLeft/Top/Width/Height) is what shows a real layout change, so a margin that flips
// to or from 0px while the box stays put is measurement noise (see diffSnapshots).

// Children of a display:none box are listed by the probe with a 0×0 box; adding or removing them changes nothing visible.
const hasBox = (e: ElementRecord) => e.o[2] > 0 || e.o[3] > 0;

export function diffSnapshots(before: Snapshot, after: Snapshot): Change[] {
  if (before.props.join() !== after.props.join()) throw new Error("snapshots were taken with different props");
  const changes: Change[] = [];
  const afterRoutes = new Map(after.routes.map((r) => [r.route, r]));
  for (const a of before.routes) {
    const b = afterRoutes.get(a.route);
    if (!b) {
      changes.push({ route: a.route, path: "", what: "route missing" });
      continue;
    }
    const bEls = new Map(b.els.map((e) => [e.p, e]));
    const seen = new Set<string>();
    for (const ea of a.els) {
      if (DYNAMIC.test(ea.p)) continue;
      seen.add(ea.p);
      const eb = bEls.get(ea.p);
      if (!eb) {
        if (!hasBox(ea)) continue;
        changes.push({ route: a.route, path: ea.p, what: "removed" });
        continue;
      }
      const sameBox = ea.o.join() === eb.o.join();
      if (!sameBox) changes.push({ route: a.route, path: ea.p, what: `box ${ea.o.join(",")} → ${eb.o.join(",")}` });
      ea.s.forEach((v, i) => {
        if (before.props[i] === "margin" && sameBox && (v === "0px" || eb.s[i] === "0px")) return;
        if (v !== eb.s[i]) changes.push({ route: a.route, path: ea.p, what: `${before.props[i]}: ${v} → ${eb.s[i]}` });
      });
    }
    for (const eb of b.els) if (!seen.has(eb.p) && !DYNAMIC.test(eb.p) && hasBox(eb)) changes.push({ route: a.route, path: eb.p, what: "added" });
  }
  return changes;
}

export function auditMobile(snap: Snapshot): Finding[] {
  const out: Finding[] = [];
  for (const r of snap.routes) {
    if (r.scrollWidth > r.clientWidth) out.push({ route: r.route, rule: "overflow", detail: `${r.scrollWidth} > ${r.clientWidth}` });
    for (const src of r.broken) out.push({ route: r.route, rule: "broken-image", detail: src });
    const pinned = PINNED_PREVIEW.test(r.route);
    for (const t of pinned ? [] : r.taps) {
      if (t.inText) continue;
      const min = SWATCH.test(t.p) ? TAP_SWATCH : TAP;
      if (t.w < min || t.h < min) out.push({ route: r.route, rule: "tap-target", detail: `${t.p} ${t.w}×${t.h}` });
    }
    for (const i of pinned ? [] : r.inputs) if (i.fs < 16) out.push({ route: r.route, rule: "input-font", detail: `${i.p} ${i.fs}px` });
    const budget = snap.vw < 375 ? 5 : 4;
    if (r.route === "/" && r.h1Lines !== null && r.h1Lines > budget) out.push({ route: r.route, rule: "hero-lines", detail: `${r.h1Lines} lines > ${budget}` });
  }
  return out;
}
