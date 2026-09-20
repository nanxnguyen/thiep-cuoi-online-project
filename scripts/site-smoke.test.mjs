import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const script = fs.readFileSync(new URL('../dist/script.js', import.meta.url), 'utf8');
for (const page of ['studio.html', 'templates.html', 'invite.html']) {
  assert.ok(fs.existsSync(new URL(`../dist/${page}`, import.meta.url)), `${page} exists`);
}

assert.match(html, /id="templatesPage"/);
assert.match(html, /id="familyEditor"/);
assert.match(html, /id="scheduleEditor"/);
assert.match(html, /id="guestbookEditor"/);
assert.match(html, /id="giftEditor"/);
assert.match(html, /id="inviteSchedule"/);
assert.match(html, /id="inviteGuestbook"/);
assert.match(html, /id="inviteGift"/);
assert.match(script, /route === '#templates'/);
assert.match(script, /inviteSchedule/);

console.log('site smoke: requirements are present');
