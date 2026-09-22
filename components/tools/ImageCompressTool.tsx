"use client";

import { useRef, useState } from "react";
import { Glyph } from "@/components/studio/fields";
import { compressImage } from "@/lib/image-compress";

type Result = { id: string; name: string; before: number; after?: number; url?: string; type?: string; error?: string };

const fmtKb = (bytes: number) => `${(bytes / 1024).toFixed(0)} KB`;

export function ImageCompressTool() {
  const [items, setItems] = useState<Result[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function addFiles(files: File[]) {
    const started: Result[] = files.map((f) => ({ id: `${f.name}-${f.size}-${Math.random()}`, name: f.name, before: f.size }));
    setItems((prev) => [...started, ...prev]);
    for (let i = 0; i < files.length; i++) {
      const item = started[i];
      try {
        const blob = await compressImage(files[i]);
        const url = URL.createObjectURL(blob);
        setItems((prev) => prev.map((r) => (r.id === item.id ? { ...r, after: blob.size, url, type: blob.type } : r)));
      } catch (e) {
        const message = e instanceof Error ? e.message : "Không nén được ảnh này.";
        setItems((prev) => prev.map((r) => (r.id === item.id ? { ...r, error: message } : r)));
      }
    }
  }

  const downloadName = (name: string, type?: string) => name.replace(/\.[^.]+$/, "") + (type === "image/webp" ? "-da-nen.webp" : "-da-nen.jpg");

  return (
    <div className="card tool-result">
      <div className="pn-drop">
        <Glyph name="image" size={28} />
        <p>
          <strong>Chọn ảnh</strong> để thu nhỏ còn tối đa 1600px và 2MB, ngay trên trình duyệt — ảnh không được tải lên máy chủ nào.
        </p>
        <button type="button" className="button-ghost pn-compact" onClick={() => inputRef.current?.click()}>
          <Glyph name="upload" size={18} />
          Chọn ảnh
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const picked = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (picked.length > 0) void addFiles(picked);
        }}
      />
      {items.length > 0 && (
        <ul className="pn-list">
          {items.map((r) => (
            <li key={r.id} className="pn-item">
              <div className="pn-item__head">
                <h3 className="pn-item__title">{r.name}</h3>
                {r.url && (
                  <a className="link-quiet" href={r.url} download={downloadName(r.name, r.type)}>
                    Tải ảnh đã nén
                  </a>
                )}
              </div>
              {r.error ? (
                <p className="form-error" role="alert">
                  {r.error}
                </p>
              ) : r.after != null ? (
                <p className="tool-result__meta">
                  <span>{fmtKb(r.before)} → {fmtKb(r.after)}</span>
                  <span>Giảm {Math.round((1 - r.after / r.before) * 100)}%</span>
                </p>
              ) : (
                <p className="pn-empty">Đang nén…</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
