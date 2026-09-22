"use client";

import { Glyph, IconButton } from "@/components/studio/fields";
import type { UploadItem, UploadStatus } from "@/components/studio/panels/useUploader";

const STATUS_TEXT: Record<UploadStatus, string> = {
  queued: "Đang chờ",
  compressing: "Đang thu nhỏ ảnh…",
  uploading: "Đang tải lên…",
  done: "Đã thêm",
  error: "Chưa tải được",
};

// Per-file status for an upload batch. The summary line is always mounted and only changes when a
// batch starts or ends, so screen readers hear two short messages instead of one per phase change.
export function UploadList({ items, onDismiss }: { items: UploadItem[]; onDismiss: (id: string) => void }) {
  const busy = items.some((it) => it.status === "queued" || it.status === "compressing" || it.status === "uploading");
  const done = items.filter((it) => it.status === "done").length;
  const failed = items.filter((it) => it.status === "error").length;
  const summary = busy ? "Đang tải lên, bạn chờ một chút nhé." : items.length ? `Đã tải lên ${done} file${failed ? `, ${failed} file bị lỗi` : ""}.` : "";
  return (
    <>
      <p className="pn-sr" aria-live="polite">
        {summary}
      </p>
      {items.length ? (
        <ul className="pn-uploads">
          {items.map((it) => (
            <li key={it.id} className={`pn-upload pn-upload--${it.status}`}>
              <span className="pn-upload__name">{it.name}</span>
              <span className="pn-upload__state">{STATUS_TEXT[it.status]}</span>
              {it.status === "compressing" || it.status === "uploading" ? <span className="pn-bar" aria-hidden="true" /> : null}
              {it.status === "error" ? (
                <span className="pn-upload__err" role="alert">
                  {it.error}
                </span>
              ) : null}
              {it.status === "done" || it.status === "error" ? (
                <span className="pn-upload__close">
                  <IconButton label={`Ẩn thông báo của ${it.name}`} onClick={() => onDismiss(it.id)}>
                    <Glyph name="close" size={16} />
                  </IconButton>
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
