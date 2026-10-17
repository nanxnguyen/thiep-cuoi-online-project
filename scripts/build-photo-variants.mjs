// Pre-generates responsive WebP copies of public/photos/*.{jpg,png} so next/image never needs the
// Cloudflare Images binding (CPU + free quota). Output: public/photos/w/<name>-<width>.webp.
// Run after adding or replacing a photo: node scripts/build-photo-variants.mjs
import { mkdirSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, parse } from "node:path";
import sharp from "sharp";

export const PHOTO_WIDTHS = [384, 640, 828, 1200];
const SRC = "public/photos";
const OUT = join(SRC, "w");
mkdirSync(OUT, { recursive: true });

let made = 0;
for (const file of readdirSync(SRC)) {
  const { name, ext } = parse(file);
  if (!/^\.(jpe?g|png)$/i.test(ext)) continue;
  const input = join(SRC, file);
  const { width: srcWidth = 0 } = await sharp(input).metadata();
  for (const w of PHOTO_WIDTHS) {
    const target = Math.min(w, srcWidth); // never upscale
    const out = join(OUT, `${name}-${w}.webp`);
    if (existsSync(out) && statSync(out).mtimeMs >= statSync(input).mtimeMs) continue;
    await sharp(input).resize({ width: target }).webp({ quality: 78 }).toFile(out);
    made += 1;
  }
}
console.log(`photo variants: ${made} written`);
