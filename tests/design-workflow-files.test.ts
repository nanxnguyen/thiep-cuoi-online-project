import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("the workflow has one public npm command", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.scripts.design, "node scripts/design-workflow.mjs");
  assert.equal(Object.keys(pkg.scripts).filter((name) => name.startsWith("design")).length, 1);
});

test("business and process documents define the workflow inputs and gates", () => {
  const business = read("business.md");
  const process = read("process.md");

  for (const heading of ["Mục tiêu sản phẩm", "Khách hàng chính", "KPI", "Ngoài phạm vi"]) {
    assert.match(business, new RegExp(`## ${heading}`));
  }

  assert.match(process, /npm run design/);
  assert.match(process, /Planning/);
  assert.match(process, /Security/);
  assert.match(process, /SEO 100/);
  assert.match(process, /QC\/QA/);
  assert.match(process, /Codex/);
  assert.match(process, /Claude Code/);
  assert.match(process, /OpenCode/);
  assert.match(process, /tự nhận diện agent/);
});

test("agent output schemas are strict JSON objects", () => {
  for (const name of ["plan", "implementation", "review"]) {
    const schema = JSON.parse(read(`scripts/schemas/design-${name}.schema.json`));
    assert.equal(schema.type, "object");
    assert.equal(schema.additionalProperties, false);
    assert.ok(schema.required.length > 0);
  }
});

test("the conversion guide has a durable verified-lessons section", () => {
  assert.match(read("Guide-convert-html-design-to-code.md"), /## 6\. Sai lầm đã gặp và cách phòng tránh/);
});
