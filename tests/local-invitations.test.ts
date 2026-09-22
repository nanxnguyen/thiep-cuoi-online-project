import { test } from "node:test";
import assert from "node:assert/strict";
import { createLocalStore, parseEditLink, editLink, invitationTitle } from "../lib/local-invitations.ts";

const memory = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};
const item = (id: string, updatedAt: string) => ({ id, slug: `s-${id}`, key: `k-${id}`, title: id, updatedAt });

test("upsert replaces by id and lists newest first", () => {
  const s = createLocalStore(memory());
  s.upsert(item("a", "2026-01-01T00:00:00Z"));
  s.upsert(item("b", "2026-02-01T00:00:00Z"));
  s.upsert({ ...item("a", "2026-03-01T00:00:00Z"), title: "A2" });
  assert.deepEqual(s.list().map((i) => i.id), ["a", "b"]);
  assert.equal(s.get("a")?.title, "A2");
});

test("remove deletes and get misses cleanly", () => {
  const s = createLocalStore(memory());
  s.upsert(item("a", "2026-01-01T00:00:00Z"));
  s.remove("a");
  assert.deepEqual(s.list(), []);
  assert.equal(s.get("a"), undefined);
});

test("corrupt or hostile storage yields an empty list, never throws", () => {
  const bad = {
    getItem: () => "{not json",
    setItem: () => {
      throw new Error("quota");
    },
  };
  const s = createLocalStore(bad);
  assert.deepEqual(s.list(), []);
  assert.doesNotThrow(() => s.upsert(item("a", "2026-01-01T00:00:00Z")));
  const wrongShape = createLocalStore({ getItem: () => JSON.stringify([{ id: 1 }, "x", null]), setItem: () => {} });
  assert.deepEqual(wrongShape.list(), []);
});

const ID = "0f8fad5b-d9cb-469f-a165-70867728950e";

test("parseEditLink reads id and key from a studio link, absolute or relative", () => {
  assert.deepEqual(parseEditLink(`https://x.example/studio/${ID}#k=abc_DEF-123`, "https://x.example"), { id: ID, key: "abc_DEF-123" });
  assert.deepEqual(parseEditLink(`  /studio/${ID}#k=abc  `, "https://x.example"), { id: ID, key: "abc" });
});

test("parseEditLink rejects links without a valid id or key", () => {
  assert.equal(parseEditLink("https://x.example/studio/not-a-uuid#k=abc", "https://x.example"), null);
  assert.equal(parseEditLink(`/studio/${ID}`, "https://x.example"), null);
  assert.equal(parseEditLink("", "https://x.example"), null);
  assert.equal(parseEditLink("http://[bad", "https://x.example"), null);
});

test("editLink builds the link the owner has to keep, and parseEditLink reads it back", () => {
  const link = editLink("https://x.example", ID, "k1");
  assert.equal(link, `https://x.example/studio/${ID}#k=k1`);
  assert.deepEqual(parseEditLink(link, "https://x.example"), { id: ID, key: "k1" });
});

test("invitationTitle joins the couple's names and falls back for empty drafts", () => {
  assert.equal(invitationTitle({ groom: { name: " Khoa " }, bride: { name: "Lan" } }), "Khoa & Lan");
  assert.equal(invitationTitle({ groom: { name: "" }, bride: { name: "" } }), "Thiệp chưa đặt tên");
  assert.equal(invitationTitle({ groom: { name: "Khoa" }, bride: { name: "" } }), "Khoa");
});
