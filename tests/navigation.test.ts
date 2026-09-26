import { test } from "node:test";
import assert from "node:assert/strict";
import { isNavActive, NAV_LINKS, FOOTER_LINKS } from "../lib/navigation.ts";
import { PUBLIC_ROUTES } from "../lib/route-inventory.ts";

test("primary navigation exposes the complete product discovery routes", () => {
  assert.deepEqual(
    NAV_LINKS.map((link) => link.href),
    ["/templates", "/tinh-nang", "/cong-cu-dam-cuoi", "/ung-ho"],
  );
});

test("shared navigation links and generated content routes are in the public route inventory", () => {
  const routes = new Set(PUBLIC_ROUTES);
  assert.ok(NAV_LINKS.every((link) => routes.has(link.href)));
  assert.ok(FOOTER_LINKS.every((link) => routes.has(link.href)));
  assert.ok(routes.has("/templates/song-hy"));
  assert.ok(routes.has("/tinh-nang/xac-nhan-tham-du"));
});

test("navigation marks a section active for its index and nested routes", () => {
  assert.equal(isNavActive("/templates", "/templates"), true);
  assert.equal(isNavActive("/templates/lua-son", "/templates"), true);
  assert.equal(isNavActive("/bang-gia", "/templates"), false);
});
