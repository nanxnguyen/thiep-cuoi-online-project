import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { MUSIC_LIBRARY, isLibraryMusicUrl } from "../lib/music.ts";

test("every built-in track is a real MP3 under public/music with a unique id and url", () => {
  assert.ok(MUSIC_LIBRARY.length >= 1);
  assert.equal(new Set(MUSIC_LIBRARY.map((t) => t.id)).size, MUSIC_LIBRARY.length);
  assert.equal(new Set(MUSIC_LIBRARY.map((t) => t.url)).size, MUSIC_LIBRARY.length);
  for (const t of MUSIC_LIBRARY) {
    assert.match(t.url, /^\/music\/[a-z0-9-]+\.mp3$/, t.url);
    assert.ok(t.title.length > 0 && t.title.length <= 80, t.id);
    assert.ok(existsSync(`public${t.url}`), `missing public${t.url}`);
    const head = readFileSync(`public${t.url}`).subarray(0, 3);
    const isMp3 = (head[0] === 0x49 && head[1] === 0x44 && head[2] === 0x33) || (head[0] === 0xff && (head[1] & 0xe0) === 0xe0);
    assert.ok(isMp3, `${t.url} is not an MP3`);
    assert.ok(readFileSync(`public${t.url}`).length <= 8 * 1024 * 1024, `${t.url} larger than the 8 MB upload limit`);
  }
});

test("isLibraryMusicUrl matches the exact built-in paths only", () => {
  assert.equal(isLibraryMusicUrl(MUSIC_LIBRARY[0].url), true);
  assert.equal(isLibraryMusicUrl("/music/other.mp3"), false);
  assert.equal(isLibraryMusicUrl("https://x.vn" + MUSIC_LIBRARY[0].url), false);
});
