// Usage: node scripts/layout-diff.ts diff <before.json> <after.json>   desktop guard, must print "0 change(s)"
//        node scripts/layout-diff.ts audit <phone.json>                 mobile criteria (spec §6.2), "0 finding(s)"
import { readFileSync } from "node:fs";
import { auditMobile, diffSnapshots, type Snapshot } from "../lib/layout-audit.ts";

// evaluate_script may save the bare return value or wrap it; accept both.
const read = (file: string): Snapshot => {
  const json = JSON.parse(readFileSync(file, "utf8"));
  return json.routes ? json : (json.result ?? json.value);
};

const [mode, a, b] = process.argv.slice(2);
const rows =
  mode === "diff" && a && b ? diffSnapshots(read(a), read(b)).map((c) => `${c.route}  ${c.path}  ${c.what}`)
  : mode === "audit" && a ? auditMobile(read(a)).map((f) => `${f.route}  [${f.rule}]  ${f.detail}`)
  : null;
if (!rows) {
  console.error("usage: node scripts/layout-diff.ts diff <before.json> <after.json> | audit <phone.json>");
  process.exit(2);
}
console.log(rows.slice(0, 200).join("\n"));
console.log(`${rows.length} ${mode === "diff" ? "change(s)" : "finding(s)"}`);
process.exit(rows.length ? 1 : 0);
