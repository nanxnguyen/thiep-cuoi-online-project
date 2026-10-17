// Usage: node scripts/cf-cpu-probe.mjs https://taothiepcuoimienphi.raystudio.com.vn [rounds]
// Runs `wrangler tail --format json`, requests each route `rounds` times (sequentially, so a
// tail event maps to one request) and prints cpuTime per route.
// PROBE_EXTRA="/invite/<slug>,/invite/<slug>?g=<token>" adds guest URLs.
import { spawn } from "node:child_process";

const base = process.argv[2];
const rounds = Number(process.argv[3] ?? 5);
if (!base) throw new Error("base URL required");

const ROUTES = [
  "/", "/templates", "/templates/song-hy", "/studio", "/ung-ho", "/bang-gia", "/blog",
  "/cong-cu/tao-qr", "/admin/login", "/api/auth/me", "/api/admin/me",
];
for (const extra of (process.env.PROBE_EXTRA ?? "").split(",").filter(Boolean)) ROUTES.push(extra);

// wrangler prints each event as a pretty-printed JSON object: split by brace depth.
const events = [];
let buf = "";
function drain() {
  let depth = 0, start = -1, inStr = false, esc = false;
  for (let i = 0; i < buf.length; i += 1) {
    const c = buf[i];
    if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === "{") { if (depth === 0) start = i; depth += 1; }
    else if (c === "}") {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        try { events.push(JSON.parse(buf.slice(start, i + 1))); } catch { /* skip */ }
        buf = buf.slice(i + 1);
        return drain();
      }
    }
  }
}

const tail = spawn("npx", ["wrangler", "tail", "thiep-cuoi-online", "--format", "json"], { stdio: ["ignore", "pipe", "inherit"] });
tail.stdout.on("data", (chunk) => { buf += chunk; drain(); });

await new Promise((r) => setTimeout(r, 8000)); // let the tail connect
const rows = [];
for (const route of ROUTES) {
  const start = events.length;
  for (let n = 0; n < rounds; n += 1) {
    await fetch(base + route, { redirect: "manual" }).then((r) => r.arrayBuffer());
    await new Promise((r) => setTimeout(r, 900));
  }
  await new Promise((r) => setTimeout(r, 2000));
  const want = new URL(route, base);
  const mine = events.slice(start).filter((e) => {
    const u = e.event?.request?.url;
    if (!u) return false;
    const got = new URL(u);
    return got.pathname === want.pathname && got.search === want.search;
  });
  const cpu = mine.map((e) => e.cpuTime).filter((v) => typeof v === "number").sort((a, b) => a - b);
  const exceeded = mine.filter((e) => /exceeded/i.test(e.outcome ?? "")).length;
  rows.push({ route, n: cpu.length, p50: cpu[Math.floor(cpu.length / 2)] ?? "n/a", max: cpu.at(-1) ?? "n/a", exceeded });
}
tail.kill();
console.table(rows);
