import { test } from "node:test";
import assert from "node:assert/strict";
import { TEMPLATE_ASSETS, productionAssets, validateTemplateAsset } from "../lib/template-assets.ts";

test("manifest starts empty so no unreviewed asset can ship", () => {
  assert.deepEqual(TEMPLATE_ASSETS, []);
  assert.deepEqual(productionAssets(), []);
});

test("reference-only refs assets are rejected from production", () => {
  assert.throws(
    () =>
      validateTemplateAsset({
        path: "/templates/lacquer-seal/seal.svg",
        family: "lacquer-seal",
        source: "refs/site-03/page.html",
        status: "reference-only",
        licenseNote: "",
      }),
    /reference-only/,
  );
});

test("production asset without a source is rejected", () => {
  assert.throws(
    () =>
      validateTemplateAsset({
        path: "/templates/lacquer-seal/seal.svg",
        family: "lacquer-seal",
        source: "",
        status: "original",
        licenseNote: "",
      }),
    /source/,
  );
});

test("licensed asset without a license note is rejected", () => {
  assert.throws(
    () =>
      validateTemplateAsset({
        path: "/templates/glasshouse/arch.svg",
        family: "glasshouse",
        source: "licensed pack",
        status: "licensed",
        licenseNote: "",
      }),
    /license/,
  );
});

test("owned, licensed and original assets with provenance pass", () => {
  for (const status of ["owned", "licensed", "original"] as const) {
    validateTemplateAsset({
      path: "/templates/lacquer-seal/seal.svg",
      family: "lacquer-seal",
      source: "drawn in-house",
      status,
      licenseNote: status === "licensed" ? "license ref" : "",
    });
  }
});
