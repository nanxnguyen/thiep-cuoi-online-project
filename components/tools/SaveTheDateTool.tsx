"use client";

import { useEffect, useRef, useState } from "react";
import { compressImage } from "@/lib/image-compress";
import { colors } from "@/lib/templates";

// design/CC Save The Date.dc.html: form on the left, 4:5 canvas on the right. The design draws at 640×800; this draws
// the same layout at 1080×1350 (×1.6875) so the PNG is sharp enough for social posts.
const W = 1080;
const H = 1350;
const K = W / 640;

type Form = { bride: string; groom: string; date: string; place: string };

// next/font hashes family names; read the real ones from the CSS variables set on <html> by app/layout.tsx.
const family = (cssVar: string, fallback: string) => {
  const name = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  return name ? `${name}, ${fallback}` : fallback;
};

async function draw(canvas: HTMLCanvasElement, form: Form, photo: ImageBitmap | null) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const sans = family("--font-sans", "sans-serif");
  const display = family("--font-display", "serif");
  const hand = family("--font-hand", "cursive");
  // Great Vibes is not preloaded site-wide; make sure it is in before painting the names.
  await Promise.all([document.fonts.load(`${64 * K}px ${hand}`), document.fonts.load(`${28 * K}px ${display}`)]).catch(() => undefined);

  ctx.clearRect(0, 0, W, H);
  if (photo) {
    const scale = Math.max(W / photo.width, H / photo.height);
    const w = photo.width * scale;
    const h = photo.height * scale;
    ctx.drawImage(photo, (W - w) / 2, (H - h) / 2, w, h);
    ctx.fillStyle = "rgba(26,20,18,.42)";
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = colors.do.deep;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = colors.do.paper;
  const cx = W / 2;
  ctx.font = `${24 * K}px ${sans}`;
  ctx.fillText("SAVE THE DATE", cx, 210 * K);
  ctx.font = `${64 * K}px ${hand}`;
  ctx.fillText(`${form.bride.trim() || "Cô dâu"} & ${form.groom.trim() || "Chú rể"}`, cx, 400 * K, W - 80);
  const [y, m, d] = form.date.split("-");
  ctx.font = `${28 * K}px ${display}`;
  ctx.fillText(form.date ? `${d}.${m}.${y}` : "Ngày cưới", cx, 470 * K);
  ctx.font = `${18 * K}px ${sans}`;
  ctx.fillText(form.place.trim().toUpperCase(), cx, 510 * K, W - 120);
}

export function SaveTheDateTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [form, setForm] = useState<Form>({ bride: "", groom: "", date: "", place: "" });
  const [photo, setPhoto] = useState<ImageBitmap | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  useEffect(() => {
    if (canvasRef.current) void draw(canvasRef.current, form, photo);
  }, [form, photo]);

  async function pickPhoto(file: File) {
    setBusy(true);
    setError("");
    try {
      const bitmap = await createImageBitmap(await compressImage(file));
      setPhoto((old) => {
        old?.close();
        return bitmap;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không dùng được ảnh này.");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "save-the-date.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  return (
    <div className="tool-std">
      <div className="tool-std__form">
        <label className="tool-field">
          Tên cô dâu
          <input className="input" value={form.bride} onChange={set("bride")} maxLength={40} placeholder="Hạ Vy" />
        </label>
        <label className="tool-field">
          Tên chú rể
          <input className="input" value={form.groom} onChange={set("groom")} maxLength={40} placeholder="Minh Khôi" />
        </label>
        <label className="tool-field">
          Ngày cưới
          <input className="input" type="date" value={form.date} onChange={set("date")} />
        </label>
        <label className="tool-field">
          Địa điểm
          <input className="input" value={form.place} onChange={set("place")} maxLength={60} placeholder="Hà Nội" />
        </label>
        <div className="tool-field">
          Ảnh nền {busy && "(đang xử lý…)"}
          <input
            type="file"
            accept="image/*"
            aria-label="Ảnh nền"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void pickPhoto(file);
            }}
          />
          {photo && (
            <button
              type="button"
              className="tool-link"
              onClick={() => {
                photo.close();
                setPhoto(null);
              }}
            >
              Bỏ ảnh nền
            </button>
          )}
        </div>
        {error && (
          <p className="tool-error" role="alert">
            {error}
          </p>
        )}
        <button type="button" className="button-primary" onClick={download}>
          Tải ảnh PNG
        </button>
      </div>
      <div className="tool-std__preview">
        <canvas ref={canvasRef} width={W} height={H} aria-label="Bản xem trước ảnh save the date" />
      </div>
    </div>
  );
}
