// Client-side photo shrinking before upload (spec 6.5): longest edge <= 1600px, WebP, <= 2 MB.
// Node-safe on purpose: nothing here touches `document` or `createImageBitmap` at import time, so the
// pure parts can be unit tested; the browser-only parts run inside compressImage().

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const QUALITIES = [0.82, 0.7, 0.6];

const MSG_NO_SUPPORT = "Trình duyệt này chưa hỗ trợ xử lý ảnh. Hãy thử Chrome, Safari hoặc Edge bản mới.";
const MSG_UNREADABLE = "Không đọc được ảnh này. Hãy chọn ảnh JPG, PNG hoặc WebP.";
const MSG_ENCODE = "Không xử lý được ảnh này. Hãy thử một ảnh khác.";
const MSG_TOO_BIG = "Ảnh này vẫn nặng hơn 2 MB sau khi thu nhỏ. Hãy chọn ảnh khác hoặc chụp lại ở độ phân giải thấp hơn.";

// Keeps the aspect ratio, never upscales, always returns whole pixels of at least 1.
export function fitWithin(width: number, height: number, maxEdge: number): { width: number; height: number } {
  if (![width, height, maxEdge].every((n) => Number.isFinite(n) && n > 0)) {
    throw new RangeError("Kích thước ảnh không hợp lệ");
  }
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width: Math.round(width), height: Math.round(height) };
  return {
    width: Math.max(1, Math.round((width * maxEdge) / longest)),
    height: Math.max(1, Math.round((height * maxEdge) / longest)),
  };
}

type Mime = "image/webp" | "image/jpeg";
export type Encode = (mime: Mime, quality: number) => Promise<Blob | null>;

// Walks the quality ladder until the file fits. A browser that cannot encode WebP answers a WebP
// request with a PNG, so that case switches the rest of the ladder to JPEG.
export async function encodeWithinLimit(encode: Encode, limit = MAX_IMAGE_BYTES): Promise<Blob> {
  let mime: Mime = "image/webp";
  for (const quality of QUALITIES) {
    let blob = await encode(mime, quality);
    if (blob && mime === "image/webp" && blob.type !== "image/webp") {
      mime = "image/jpeg";
      blob = await encode(mime, quality);
    }
    if (!blob) throw new Error(MSG_ENCODE);
    if (blob.size <= limit) return blob;
  }
  throw new Error(MSG_TOO_BIG);
}

const canvasToBlob = (canvas: HTMLCanvasElement, mime: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));

export async function compressImage(file: File, maxEdge = 1600): Promise<Blob> {
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") throw new Error(MSG_NO_SUPPORT);
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file); // honours EXIF rotation in current browsers
  } catch {
    throw new Error(MSG_UNREADABLE);
  }
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height, maxEdge);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error(MSG_ENCODE);
    // Paint white first: JPEG has no alpha, so a transparent PNG would otherwise come out black.
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);
    return await encodeWithinLimit((mime, quality) => canvasToBlob(canvas, mime, quality));
  } finally {
    bitmap.close();
  }
}
