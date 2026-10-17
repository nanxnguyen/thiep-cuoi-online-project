import { readFileSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const MiB = 1024 * 1024;
// Workers Free hard limit is 3 MiB compressed; keep 20% headroom.
export const GZIP_BUDGET = 2.4 * MiB;

export function workerBudget(rawBytes, gzipBytes) {
  const f = (n) => (n / MiB).toFixed(2);
  const ok = gzipBytes <= GZIP_BUDGET;
  return { ok, message: `worker ${f(rawBytes)} MiB raw, ${f(gzipBytes)} MiB gzip (budget ${f(GZIP_BUDGET)} MiB, Free limit 3.00 MiB)` };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = ".open-next/server-functions/default/handler.mjs";
  if (!existsSync(file)) throw new Error(`${file} missing: run opennextjs-cloudflare build first`);
  const raw = readFileSync(file);
  const { ok, message } = workerBudget(raw.length, gzipSync(raw).length);
  console.log(message);
  if (!ok) process.exit(1);
}
