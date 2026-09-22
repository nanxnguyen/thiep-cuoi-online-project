"use client";

import { useEffect, useRef, useState } from "react";
import { Glyph, SelectField, TextField } from "@/components/studio/fields";
import { formatDateVi } from "@/lib/datetime";
import { compressImage } from "@/lib/image-compress";

const W = 1080;
const H = 1350;

const PRESETS = {
  "lua-son": { name: "Lụa Son", bg: "#a3181f", text: "#f6ecd6", accent: "#d9b45f" },
  "thanh-ngoc": { name: "Thanh Ngọc", bg: "#2d5b4e", text: "#f6ecd6", accent: "#d9b45f" },
  nga: { name: "Ngà", bg: "#faf6ef", text: "#17100e", accent: "#a3181f" },
} as const;
type PresetId = keyof typeof PRESETS;

type Form = { groom: string; bride: string; date: string; preset: PresetId };

async function draw(canvas: HTMLCanvasElement, form: Form, photo: ImageBitmap | null) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const preset = PRESETS[form.preset];
  ctx.clearRect(0, 0, W, H);

  if (photo) {
    const scale = Math.max(W / photo.width, H / photo.height);
    const w = photo.width * scale;
    const h = photo.height * scale;
    ctx.drawImage(photo, (W - w) / 2, (H - h) / 2, w, h);
    const grad = ctx.createLinearGradient(0, H * 0.45, 0, H);
    grad.addColorStop(0, "rgba(10,6,4,0)");
    grad.addColorStop(1, "rgba(10,6,4,0.78)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = preset.bg;
    ctx.fillRect(0, 0, W, H);
  }

  const textColor = photo ? "#f6ecd6" : preset.text;
  const accentColor = photo ? "#d9b45f" : preset.accent;
  const cx = W / 2;
  const baseY = photo ? H - 340 : H / 2 - 60;

  ctx.textAlign = "center";
  ctx.fillStyle = accentColor;
  ctx.font = "600 32px Georgia, 'Times New Roman', serif";
  ctx.save();
  ctx.letterSpacing = "10px";
  ctx.fillText("SAVE THE DATE", cx, baseY);
  ctx.restore();

  ctx.fillStyle = textColor;
  ctx.font = "italic 96px Georgia, 'Times New Roman', serif";
  const groom = form.groom.trim() || "Chú rể";
  const bride = form.bride.trim() || "Cô dâu";
  ctx.fillText(`${groom} & ${bride}`, cx, baseY + 110, W - 120);

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 60, baseY + 150);
  ctx.lineTo(cx + 60, baseY + 150);
  ctx.stroke();

  const dateVi = formatDateVi(form.date.trim());
  ctx.font = "28px Georgia, 'Times New Roman', serif";
  ctx.fillText(dateVi || "Ngày cưới sẽ báo sau", cx, baseY + 200);
}

export function SaveTheDateTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [form, setForm] = useState<Form>({ groom: "", bride: "", date: "", preset: "lua-son" });
  const [photo, setPhoto] = useState<ImageBitmap | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (canvasRef.current) void draw(canvasRef.current, form, photo);
  }, [form, photo]);

  async function pickPhoto(file: File) {
    setBusy(true);
    setError("");
    try {
      const blob = await compressImage(file);
      const bitmap = await createImageBitmap(blob);
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
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
    <div className="card tool-result">
      <div className="pn-row">
        <TextField label="Tên chú rể" value={form.groom} onChange={(groom) => setForm((f) => ({ ...f, groom }))} maxLength={40} placeholder="Nam" />
        <TextField label="Tên cô dâu" value={form.bride} onChange={(bride) => setForm((f) => ({ ...f, bride }))} maxLength={40} placeholder="Lan" />
      </div>
      <div className="pn-row">
        <TextField label="Ngày cưới" hint="Không bắt buộc." type="date" value={form.date} onChange={(date) => setForm((f) => ({ ...f, date }))} />
        <SelectField
          label="Màu nền"
          hint="Chỉ áp dụng khi không chọn ảnh nền."
          value={form.preset}
          onChange={(preset) => setForm((f) => ({ ...f, preset: preset as PresetId }))}
          options={Object.entries(PRESETS).map(([value, p]) => ({ value, label: p.name }))}
        />
      </div>

      <div className="pn-drop">
        <Glyph name="image" size={28} />
        <p>Ảnh nền không bắt buộc — ảnh được nén ngay trên trình duyệt trước khi vẽ, không tải lên máy chủ nào.</p>
        <label className="button-ghost pn-compact" style={{ cursor: "pointer" }}>
          <Glyph name="upload" size={18} />
          {busy ? "Đang xử lý…" : "Chọn ảnh"}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void pickPhoto(file);
            }}
          />
        </label>
        {photo && (
          <button
            type="button"
            className="link-quiet"
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
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <canvas ref={canvasRef} width={W} height={H} style={{ width: "100%", height: "auto", aspectRatio: `${W}/${H}` }} aria-label="Bản xem trước ảnh save-the-date" />
      <button type="button" className="button-primary" onClick={download}>
        Tải ảnh
      </button>
    </div>
  );
}
