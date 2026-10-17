import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("/studio is prerenderable: the page never awaits searchParams", () => {
  const src = read("app/studio/page.tsx");
  assert.doesNotMatch(src, /searchParams/);
  assert.match(src, /<Suspense/);
});

test("/templates/[id] is prerenderable: the page never awaits searchParams", () => {
  const src = read("app/templates/[id]/page.tsx");
  assert.doesNotMatch(src, /searchParams/);
  assert.match(src, /generateStaticParams/);
});

test("query-string readers are client components", () => {
  for (const p of ["components/studio/StudioHomeQuery.tsx", "components/templates/TemplateQuery.tsx"]) {
    const src = read(p);
    assert.match(src, /^"use client";/);
    assert.match(src, /useSearchParams/);
  }
});

test("every query `has` in next.config carries a value (OpenNext matches value-less ones on every request)", () => {
  const queryHas = read("next.config.ts").match(/\{[^{}]*type: "query"[^{}]*\}/g) ?? [];
  assert.ok(queryHas.length > 0);
  for (const h of queryHas) assert.match(h, /value: /, h);
});
