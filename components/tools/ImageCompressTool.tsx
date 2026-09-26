"use client";

import { useState } from "react";
import { compressImage } from "@/lib/image-compress";

type Result = { id: string; name: string; before: number; preview: string; after?: number; url?: string; type?: string; error?: string };

const fmtKb = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`);
const downloadName = (name: string, type?: string) => name.replace(/\.[^.]+$/, "") + (type === "image/webp" ? "-da-nen.webp" : "-da-nen.jpg");

// design/CC Nen Anh.dc.html: dashed drop zone (click or drop, many files) → grid of result cards.
export function ImageCompressTool() {
  const [items, setItems] = useState<Result[]>([]);
  const [over, setOver] = useState(false);

  async function addFiles(files: File[]) {
    const images = files.filter((f) => f.type.startsWith("image/"));
    const started: Result[] = images.map((f) => ({ id: `${f.name}-${f.size}-${Math.random()}`, name: f.name, before: f.size, preview: URL.createObjectURL(f) }));
    setItems((prev) => [...started, ...prev]);
    for (let i = 0; i < images.length; i++) {
      const item = started[i];
      try {
        const blob = await compressImage(images[i]);
        const url = URL.createObjectURL(blob);
        setItems((prev) => prev.map((r) => (r.id === item.id ? { ...r, after: blob.size, url, type: blob.type } : r)));
      } catch (e) {
        const message = e instanceof Error ? e.message : "Không nén được ảnh này.";
        setItems((prev) => prev.map((r) => (r.id === item.id ? { ...r, error: message } : r)));
      }
    }
  }

  return (
    <>
      <label
        className="tool-drop"
        data-over={over}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void addFiles(Array.from(e.dataTransfer.files));
        }}
      >
        <span>Chọn hoặc thả ảnh vào đây</span>
        <span>JPG, PNG — nhiều ảnh một lúc</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="tool-sr"
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (picked.length > 0) void addFiles(picked);
          }}
        />
      </label>
      <div className="tool-shots">
        {items.map((r) => (
            <div key={r.id}>
              <div className="tool-shots__img">
                <img src={r.preview} alt="" />
              </div>
              <div className="tool-shots__body">
                <span className="tool-shots__name">{r.name}</span>
                {r.error ? (
                  <p className="tool-error" role="alert">
                    {r.error}
                  </p>
                ) : r.after != null && r.url ? (
                  <>
                    <div className="tool-shots__size">
                      <span>{fmtKb(r.before)}</span>
                      <span>→ {fmtKb(r.after)}</span>
                    </div>
                    <a className="tool-dark-pill" href={r.url} download={downloadName(r.name, r.type)}>
                      Tải ảnh đã nén
                    </a>
                  </>
                ) : (
                  <span className="tool-spin" role="status" aria-label="Đang nén" />
                )}
              </div>
            </div>
        ))}
      </div>
    </>
  );
}
