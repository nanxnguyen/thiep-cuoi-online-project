import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const TOKENS = "app/styles/tokens.css";
const tokens = (): Map<string, string> => {
  const css = readFileSync(TOKENS, "utf8");
  return new Map([...css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
};

// Values copied from design/Wedding Design System.dc.html + design/design.md; deviations documented in the plan.
const EXPECTED: Record<string, string> = {
  "--paper": "#f8f4ee", "--paper-alt": "#efe6d9", "--paper-soft": "#f4f0e9", "--surface": "#ffffff",
  "--ink": "#1a1412", "--muted": "#5e534b", "--faint": "#6b5f57", "--faint-deco": "#8a7d72",
  "--line": "#e8dfd3", "--line-strong": "#ddd2c4",
  "--accent": "#a3161c", "--accent-hover": "#7d0f14", "--accent-deep": "#8e1b1f",
  "--gold": "#c9a86a", "--gold-deep": "#8a6425", "--gold-light": "#e0bb74",
  "--night": "#1c1012", "--on-dark": "#f1e7d6", "--on-dark-muted": "#a8998c", "--line-on-dark": "#4a3a36",
  "--on-dark-body": "#d8cbbb", "--on-dark-soft": "#b8ab9b", "--on-dark-faint": "#8f8277", "--line-on-dark-soft": "#2e2522",
  "--ok-bg": "#e7eee6", "--ok-fg": "#24493a", "--warn-bg": "#f5efe0", "--warn-fg": "#7a5a22",
  "--neutral-bg": "#efe6d9", "--danger-bg": "#f5e3e1", "--danger-fg": "#8e1b1f",
  "--radius-s": "8px", "--radius": "14px", "--radius-l": "24px", "--radius-full": "999px",
  "--wrap": "1280px",
};

test("tokens match the design system", () => {
  const t = tokens();
  for (const [k, v] of Object.entries(EXPECTED)) assert.equal(t.get(k)?.toLowerCase(), v, k);
  for (const fam of ["red", "gold", "ink"])
    for (const s of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) assert.ok(t.has(`--${fam}-${s}`), `--${fam}-${s}`);
});

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const resolve = (t: Map<string, string>, v: string): string => { const m = /^var\((--[a-z0-9-]+)\)$/.exec(v); return m ? resolve(t, t.get(m[1])!) : v; };

test("site text pairs pass WCAG AA (4.5:1)", () => {
  const t = tokens();
  const pairs: [string, string][] = [
    ["--ink", "--paper"], ["--muted", "--paper"], ["--faint", "--paper"], ["--faint", "--paper-alt"], ["--muted", "--surface"],
    ["--gold-deep", "--paper"], ["--accent", "--paper"], ["--surface", "--accent"], ["--surface", "--accent-hover"],
    ["--on-dark", "--night"], ["--on-dark-muted", "--night"], ["--gold", "--night"], ["--on-dark-body", "--night"], ["--on-dark-soft", "--night"], ["--on-dark-faint", "--night"],
    ["--ok-fg", "--ok-bg"], ["--warn-fg", "--warn-bg"], ["--neutral-fg", "--neutral-bg"], ["--danger-fg", "--danger-bg"],
  ];
  for (const [fg, bg] of pairs) {
    const r = ratio(resolve(t, t.get(fg)!), resolve(t, t.get(bg)!));
    assert.ok(r >= 4.5, `${fg} on ${bg} = ${r.toFixed(2)}`);
  }
});

// Raw colours belong in tokens.css. Template palettes, canvas drawing and the invitation renderer own theirs.
const ALLOWED = [/^app\/styles\/tokens\.css$/, /^components\/invitation\//];

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const HEX_CSS = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/;
const HEX_TSX = /["'`(\s:]#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/;

test("no raw hex colours outside tokens.css", () => {
  const offenders: string[] = [];
  for (const f of [...walk("app"), ...walk("components")]) {
    const re = f.endsWith(".css") ? HEX_CSS : /\.tsx?$/.test(f) ? HEX_TSX : null;
    if (!re || ALLOWED.some((a) => a.test(f))) continue;
    const has = re.test(readFileSync(f, "utf8"));
    if (has) offenders.push(`${f}: raw hex — use a var(--token)`);
  }
  assert.deepEqual(offenders, []);
});
