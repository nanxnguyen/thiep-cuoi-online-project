"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Content } from "@/lib/content";
import { compressImage } from "@/lib/image-compress";
import { newId } from "@/lib/list";

export type MediaProps = { invitationId: string; editKey: string };
export type UploadKind = "image" | "audio";
export type UploadStatus = "queued" | "compressing" | "uploading" | "done" | "error";
// Uploads live only in this list. Nothing goes into the invitation content until the server has
// answered with a public URL, so a pending or failed file can never end up in `content`.
export type UploadItem = { id: string; name: string; status: UploadStatus; error?: string };

const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const isBusy = (s: UploadStatus) => s === "queued" || s === "compressing" || s === "uploading";

function friendlyError(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 401 || e.status === 403) return "Link chỉnh sửa không còn hiệu lực. Hãy mở lại thiệp bằng link chỉnh sửa của bạn.";
    if (e.status === 413) return "File nặng quá giới hạn cho phép. Hãy chọn file nhẹ hơn.";
    if (e.status === 400 || e.status === 415) return "Máy chủ không nhận file này. Ảnh cần là JPG, PNG hoặc WebP, nhạc cần là mp3.";
    if (e.status === 429) return "Bạn tải lên hơi nhanh. Chờ một chút rồi thử lại.";
    if (e.status === 503) return "Kho lưu trữ chưa sẵn sàng. Bạn thử lại sau ít phút nhé.";
    return `Không tải lên được (lỗi ${e.status}). Bạn thử lại nhé.`;
  }
  // fetch() rejects with a TypeError when the network is down or the server is unreachable.
  if (e instanceof TypeError) return "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.";
  if (e instanceof Error) return e.message; // our own Vietnamese messages (compressImage, size checks)
  return "Không tải lên được. Bạn thử lại nhé.";
}

const baseName = (name: string) => name.replace(/\.[^.]+$/, "") || "anh";

// Keeps a ref pointing at the newest value. A layout effect (not a passive one) so the ref is current
// before any other task, such as an upload finishing, can run after a commit.
function useLatest<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

// Applies `update` to the NEWEST content and reports it through onChange. Meant for async callbacks
// (an upload that finishes seconds later): results that arrive before React re-renders stack up
// instead of overwriting each other, and edits made in the meantime are not lost.
export function useApplyLater(content: Content, onChange: (next: Content) => void) {
  const latest = useLatest(content);
  const emit = useLatest(onChange);
  return useCallback(
    (update: (c: Content) => Content) => {
      const next = update(latest.current);
      latest.current = next;
      emit.current(next);
    },
    [latest, emit],
  );
}

export function useUploader({ invitationId, editKey }: MediaProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const patch = useCallback((id: string, p: Partial<UploadItem>) => {
    if (alive.current) setItems((all) => all.map((it) => (it.id === id ? { ...it, ...p } : it)));
  }, []);

  // Uploads the files one after another, so the results reach `onUrl` in the order they were picked
  // (album order) and only one photo is decoded in memory at a time. A failed file never stops the rest.
  // If the panel is closed mid-way the remaining files are skipped and `onUrl` is not called again,
  // because by then the content it would build on may be out of date.
  const uploadFiles = useCallback(
    async (files: File[], kind: UploadKind, onUrl: (url: string, file: File) => void) => {
      const entries = files.map((file) => ({ file, id: newId() }));
      setItems((all) => [...all.filter((it) => it.status !== "done"), ...entries.map(({ file, id }) => ({ id, name: file.name, status: "queued" as const }))]);
      for (const { file, id } of entries) {
        if (!alive.current) return;
        try {
          let body: Blob = file;
          let filename = file.name;
          if (kind === "image") {
            if (file.type && !file.type.startsWith("image/")) throw new Error("File này không phải ảnh. Hãy chọn ảnh JPG, PNG hoặc WebP.");
            patch(id, { status: "compressing" });
            body = await compressImage(file);
            filename = `${baseName(file.name)}.${body.type === "image/webp" ? "webp" : "jpg"}`;
          } else {
            if (file.type !== "audio/mpeg" && !/\.mp3$/i.test(file.name)) throw new Error("Chỉ nhận file mp3. Hãy đổi định dạng rồi thử lại.");
            if (file.size > MAX_AUDIO_BYTES) throw new Error("File nhạc nặng hơn 8 MB. Hãy chọn bản mp3 nhẹ hơn.");
          }
          patch(id, { status: "uploading" });
          const { url } = await api.uploadMedia(invitationId, editKey, kind, body, filename);
          if (!alive.current) return;
          patch(id, { status: "done" });
          onUrl(url, file);
        } catch (e) {
          patch(id, { status: "error", error: friendlyError(e) });
        }
      }
    },
    [invitationId, editKey, patch],
  );

  const dismiss = useCallback((id: string) => setItems((all) => all.filter((it) => it.id !== id)), []);

  return { items, uploadFiles, dismiss, pending: items.filter((it) => isBusy(it.status)).length };
}
