import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { auditMobile, diffSnapshots, type RouteSnapshot, type Snapshot } from "../lib/layout-audit.ts";
import { PUBLIC_ROUTES } from "../lib/route-inventory.ts";

const route = (over: Partial<RouteSnapshot> = {}): RouteSnapshot => ({
  route: "/", clientWidth: 375, scrollWidth: 375, broken: [], h1Lines: 4, els: [], taps: [], inputs: [], ...over,
});
const snap = (routes: RouteSnapshot[], vw = 375): Snapshot => ({ vw, vh: 844, props: ["font-size", "margin"], routes });

test("identical snapshots have no changes", () => {
  const s = snap([route({ els: [{ p: "main>h1", o: [0, 0, 300, 40], s: ["40px", "0px"] }] })], 1280);
  assert.deepEqual(diffSnapshots(s, structuredClone(s)), []);
});

test("a moved box and a changed style are reported with the property name", () => {
  const a = snap([route({ els: [{ p: "main>h1", o: [0, 0, 300, 40], s: ["40px", "0px"] }] })], 1280);
  const b = snap([route({ els: [{ p: "main>h1", o: [0, 0, 300, 52], s: ["44px", "0px"] }] })], 1280);
  assert.deepEqual(diffSnapshots(a, b).map((c) => c.what), ["box 0,0,300,40 → 0,0,300,52", "font-size: 40px → 44px"]);
});

test("added and removed elements count, dynamic content does not", () => {
  const a = snap([route({ els: [{ p: "main>p", o: [0, 0, 1, 1], s: ["1", "1"] }, { p: "div.hm-chip--days>span", o: [0, 0, 9, 9], s: ["1", "1"] }] })], 1280);
  const b = snap([route({ els: [{ p: "main>a", o: [0, 0, 1, 1], s: ["1", "1"] }, { p: "div.hm-chip--days>span", o: [0, 0, 20, 9], s: ["1", "1"] }] })], 1280);
  assert.deepEqual(diffSnapshots(a, b).map((c) => `${c.path} ${c.what}`), ["main>p removed", "main>a added"]);
});

test("elements without a box are ignored when added or removed", () => {
  const a = snap([route({ els: [] })], 1280);
  const b = snap([route({ els: [{ p: "a.sh__jump>span", o: [0, 0, 0, 0], s: ["1", "1"] }] })], 1280);
  assert.deepEqual(diffSnapshots(a, b), []);
});

test("an auto-centred margin that flips to or from 0px with the box unchanged is noise, a moved box is not", () => {
  const el = (margin: string, size: string, left = 0) => ({ p: "main.tdt", o: [left, 0, 5, 5], s: [size, margin] });
  const a = snap([route({ els: [el("0px 130px", "10px")] })], 1280);
  assert.deepEqual(diffSnapshots(a, snap([route({ els: [el("0px", "12px")] })], 1280)).map((c) => c.what), ["font-size: 10px → 12px"]);
  assert.deepEqual(diffSnapshots(a, snap([route({ els: [el("0px", "10px", 130)] })], 1280)).map((c) => c.what), ["box 0,0,5,5 → 130,0,5,5", "margin: 0px 130px → 0px"]);
  assert.deepEqual(diffSnapshots(a, snap([route({ els: [el("0px 40px", "10px")] })], 1280)).map((c) => c.what), ["margin: 0px 130px → 0px 40px"]);
});

test("a route missing from the second snapshot is a change", () => {
  assert.deepEqual(diffSnapshots(snap([route()]), snap([])).map((c) => c.what), ["route missing"]);
});

test("snapshots taken with different property lists cannot be compared", () => {
  const b = { ...snap([route()]), props: ["color"] };
  assert.throws(() => diffSnapshots(snap([route()]), b), /props/);
});

test("audit flags overflow, broken images, small taps, small inputs and a tall hero", () => {
  const findings = auditMobile(snap([route({
    scrollWidth: 390, broken: ["/x.jpg"], h1Lines: 6,
    taps: [{ p: "a.hm-btn-red", w: 150, h: 40, inText: false }],
    inputs: [{ p: "input.edf-input", fs: 14 }],
  })]));
  assert.deepEqual(findings.map((f) => f.rule), ["overflow", "broken-image", "tap-target", "input-font", "hero-lines"]);
});

test("audit lets inline text links pass and holds colour swatches to 24px", () => {
  const findings = auditMobile(snap([route({
    taps: [
      { p: "p>a", w: 40, h: 18, inText: true },
      { p: "div.gal-swatches>button:1", w: 26, h: 26, inText: false },
      { p: "div.gal-swatches>button:2", w: 18, h: 18, inText: false },
    ],
  })]));
  assert.deepEqual(findings.map((f) => f.detail), ["div.gal-swatches>button:2 18×18"]);
});

test("the pinned preview route is only checked for overflow and broken images", () => {
  const findings = auditMobile(snap([route({
    route: "/templates/x?preview=1", scrollWidth: 400,
    taps: [{ p: "button", w: 20, h: 20, inText: false }], inputs: [{ p: "input", fs: 13 }],
  })]));
  assert.deepEqual(findings.map((f) => f.rule), ["overflow"]);
});

test("the hero line budget is 5 below 375px and 4 from 375px", () => {
  assert.equal(auditMobile(snap([route({ h1Lines: 5 })], 320)).length, 0);
  assert.equal(auditMobile(snap([route({ h1Lines: 5 })], 375)).length, 1);
});

test("the browser probe covers every static public route", () => {
  const probe = readFileSync("scripts/layout-probe.js", "utf8");
  const statics = PUBLIC_ROUTES.filter((r) => !/^\/(templates|blog)\/./.test(r));
  assert.deepEqual(statics.filter((r) => !probe.includes(`"${r}"`)), []);
});
