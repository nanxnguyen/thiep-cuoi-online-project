import { test } from "node:test";
import assert from "node:assert/strict";
import { isNavActive, NAV_LINKS, FOOTER_LINKS } from "../lib/navigation.ts";
import { PUBLIC_ROUTES } from "../lib/route-inventory.ts";

test("primary navigation exposes the complete product discovery routes", () => {
  assert.deepEqual(
    NAV_LINKS.map((link) => link.href),
    ["/templates", "/thiet-ke-thiep-rieng", "/cong-cu-dam-cuoi", "/ung-ho"],
  );
});

test("shared navigation links and generated content routes are in the public route inventory", () => {
  const routes = new Set(PUBLIC_ROUTES);
  assert.ok(NAV_LINKS.every((link) => routes.has(link.href)));
  assert.ok(FOOTER_LINKS.every((link) => routes.has(link.href)));
  assert.ok(routes.has("/templates/song-hy"));
});

test("navigation marks a section active for its index and nested routes", () => {
  assert.equal(isNavActive("/templates", "/templates"), true);
  assert.equal(isNavActive("/templates/lua-son", "/templates"), true);
  assert.equal(isNavActive("/bang-gia", "/templates"), false);
});

test("footer links every SEO landing page and every free tool, not just the featured ones", () => {
  const hrefs = FOOTER_LINKS.map((link) => link.href);
  for (const href of [
    "/blog",
    "/thiep-cuoi-online-mien-phi",
    "/tao-thiep-cuoi",
    "/qr-tien-mung",
    "/tin-nhan-moi-cuoi",
    "/cong-cu/tao-qr",
    "/cong-cu/nen-anh",
    "/cong-cu/nen-video",
    "/cong-cu/tin-nhan-moi",
  ]) {
    assert.ok(hrefs.includes(href), `footer missing ${href}`);
  }
});
