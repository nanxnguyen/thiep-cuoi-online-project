import assert from "node:assert/strict";
import test from "node:test";
import { apiOpenApiDoc } from "../lib/api-docs.ts";

const doc = apiOpenApiDoc as unknown as {
  openapi: string;
  paths: Record<string, Record<string, { responses?: Record<string, unknown> }>>;
};

test("api docs là OpenAPI 3.x hợp lệ ở mức cơ bản", () => {
  assert.match(doc.openapi, /^3\.\d+\.\d+$/);
  assert.ok(Object.keys(doc.paths).length >= 19);
});

test("api docs bao phủ mọi route handler trong app/api", () => {
  const expected = [
    "/api/auth/register",
    "/api/auth/login",
    "/api/auth/me",
    "/api/auth/logout",
    "/api/account/invitations",
    "/api/account/invitations/claim",
    "/api/invitations",
    "/api/invitations/{id}",
    "/api/invitations/{id}/responses",
    "/api/invitations/{id}/guests",
    "/api/invitations/{id}/guests/import",
    "/api/invitations/{id}/guests/{guestId}",
    "/api/invitations/{id}/media",
    "/api/invitations/{id}/wishes/{wishId}",
    "/api/public/invitations/{slug}",
    "/api/public/invitations/{slug}/rsvp",
    "/api/public/invitations/{slug}/wishes",
    "/api/public/invitations/{slug}/guests/{token}",
    "/api/docs",
  ];
  for (const path of expected) assert.ok(doc.paths[path], `thiếu ${path}`);
  for (const [path, operations] of Object.entries(doc.paths)) {
    for (const [method, operation] of Object.entries(operations)) {
      assert.ok(operation.responses && Object.keys(operation.responses).length > 0, `${method} ${path} thiếu responses`);
    }
  }
});
