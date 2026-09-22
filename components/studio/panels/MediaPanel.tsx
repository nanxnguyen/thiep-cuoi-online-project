"use client";

import { useRef, useState, type DragEvent } from "react";
import { Glyph, IconButton, PanelSection, TextField, isHttpUrl, useListFocus, type PanelProps } from "@/components/studio/fields";
import { UploadList } from "@/components/studio/panels/UploadList";
import { useApplyLater, useUploader, type MediaProps } from "@/components/studio/panels/useUploader";
import { MAX_ALBUM } from "@/lib/content";
import { move, removeAt, updateAt } from "@/lib/list";

// The invitation is served over https, and browsers block plain-http audio on an https page.
const isHttpsUrl = (v: string) => isHttpUrl(v) && v.toLowerCase().startsWith("https://");

// "Ngay_cuoi_cua_em.mp3" -> "Ngay cuoi cua em": a starting point the couple can edit.
const titleFromFile = (name: string) => name.replace(/\.[^.]+$/, "").replace(/_+/g, " ").trim().slice(0, 80);

export function MediaPanel({ content, onChange, media }: PanelProps & { media: MediaProps }) {
  const { album, music } = content;
  const photos = useUploader(media);
  const songs = useUploader(media);
  const applyLater = useApplyLater(content, onChange);
  const focus = useListFocus<HTMLUListElement>();
  const photoInput = useRef<HTMLInputElement>(null);
  const audioInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState("");
  const [urlDraft, setUrlDraft] = useState("");
  const [urlTouched, setUrlTouched] = useState(false);
  const [playFailed, setPlayFailed] = useState(false);

  // ---- album ----
  // Photos still uploading already count against the limit, so a second batch cannot overflow it.
  const room = MAX_ALBUM - album.length - photos.pending;
  const setAlbum = (next: typeof album) => onChange({ ...content, album: next });

  function addPhotos(files: File[]) {
    const accepted = files.slice(0, Math.max(0, room));
    const skipped = files.length - accepted.length;
    setNotice(skipped ? (room <= 0 ? `Album đã đủ ${MAX_ALBUM} ảnh. Xóa bớt ảnh để thêm ảnh mới.` : `Album chỉ chứa tối đa ${MAX_ALBUM} ảnh, nên ${skipped} ảnh đã được bỏ qua.`) : "");
    if (accepted.length === 0) return;
    // Only the URL the server returns ever reaches the content, never a blob: URL or a placeholder row.
    void photos.uploadFiles(accepted, "image", (url) => applyLater((c) => (c.album.length >= MAX_ALBUM ? c : { ...c, album: [...c.album, { url, alt: "" }] })));
  }
  function shift(i: number, by: -1 | 1) {
    focus.focusNext(album[i].url, by < 0 ? "up" : "down");
    setAlbum(move(album, i, i + by));
  }
  function removePhoto(i: number) {
    const neighbour = album[i + 1] ?? album[i - 1];
    focus.focusNext(neighbour ? neighbour.url : null, "remove");
    setAlbum(removeAt(album, i));
  }
  const dropProps = {
    onDragOver(e: DragEvent<HTMLDivElement>) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      setDragging(true);
    },
    onDragLeave(e: DragEvent<HTMLDivElement>) {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
    },
    onDrop(e: DragEvent<HTMLDivElement>) {
      e.preventDefault();
      setDragging(false);
      addPhotos(Array.from(e.dataTransfer.files));
    },
  };

  // ---- music ----
  function pickSong(files: File[]) {
    if (!files[0]) return;
    setPlayFailed(false);
    void songs.uploadFiles([files[0]], "audio", (url, file) => applyLater((c) => ({ ...c, music: { url, title: titleFromFile(file.name) } })));
  }
  function applyLink() {
    const url = urlDraft.trim();
    if (!isHttpsUrl(url)) {
      setUrlTouched(true); // shows the inline error
      return;
    }
    setPlayFailed(false);
    setUrlDraft("");
    setUrlTouched(false);
    onChange({ ...content, music: { url, title: "" } });
  }
  const urlError = urlTouched && urlDraft.trim() !== "" && !isHttpsUrl(urlDraft.trim()) ? "Dán link bắt đầu bằng https:// và không có khoảng trắng." : undefined;
  const songBusy = songs.pending > 0;

  return (
    <div className="pn-stack">
      <PanelSection
        title="Album ảnh"
        description="Ảnh hiện gọn trên thiệp, khách chạm vào để xem lớn từng tấm. Ảnh được tự thu nhỏ trước khi tải lên."
        action={<span className="pn-count">{album.length}/{MAX_ALBUM}</span>}
      >
        <div className={`pn-drop${dragging ? " pn-drop--over" : ""}`} {...dropProps}>
          <Glyph name="image" size={28} />
          <p>
            <strong>Kéo ảnh vào đây</strong> hoặc
          </p>
          <button type="button" className="button-ghost pn-compact" onClick={() => photoInput.current?.click()} disabled={room <= 0}>
            <Glyph name="upload" size={18} />
            Chọn ảnh
          </button>
          <small>{room <= 0 ? `Album đã đủ ${MAX_ALBUM} ảnh` : "Chọn được nhiều ảnh cùng lúc"}</small>
        </div>
        <input
          ref={photoInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []);
            e.target.value = "";
            addPhotos(picked);
          }}
        />
        <div className="pn-live" aria-live="polite">
          {notice ? <p className="pn-note">{notice}</p> : null}
        </div>
        <UploadList items={photos.items} onDismiss={photos.dismiss} />

        <ul className="pn-photos" ref={focus.listRef}>
          {album.map((photo, i) => (
            <li key={photo.url} className="pn-photo" data-key={photo.url}>
              <div className="pn-photo__frame">
                <img className="pn-photo__img" src={photo.url} alt={photo.alt || `Ảnh ${i + 1} trong album`} loading="lazy" />
                <span className="pn-photo__num" aria-hidden="true">
                  {i + 1}
                </span>
              </div>
              <TextField label={`Mô tả ảnh ${i + 1}`} value={photo.alt} onChange={(alt) => setAlbum(updateAt(album, i, { alt }))} maxLength={120} placeholder="Không bắt buộc" />
              <div className="pn-photo__actions">
                <IconButton label={`Đưa ảnh ${i + 1} lên trước`} data-act="up" disabled={i === 0} onClick={() => shift(i, -1)}>
                  <Glyph name="up" />
                </IconButton>
                <IconButton label={`Đưa ảnh ${i + 1} ra sau`} data-act="down" disabled={i === album.length - 1} onClick={() => shift(i, 1)}>
                  <Glyph name="down" />
                </IconButton>
                <IconButton label={`Xóa ảnh ${i + 1}`} tone="danger" data-act="remove" onClick={() => removePhoto(i)}>
                  <Glyph name="trash" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
        {album.length > 0 ? <p className="pn-hint">Mô tả ngắn giúp người dùng trình đọc màn hình biết trong ảnh có gì.</p> : null}
      </PanelSection>

      <PanelSection title="Nhạc nền" description="Nhạc bắt đầu khi khách bấm Mở thiệp và lặp lại. Khách có thể tắt bất cứ lúc nào.">
        {music ? (
          <div className="pn-music">
            <TextField label="Tên bài hát" hint="Không bắt buộc. Giúp trình đọc màn hình gọi tên bài nhạc." value={music.title} onChange={(title) => onChange({ ...content, music: { ...music, title } })} maxLength={80} />
            {/* Playing it here lets the couple check that a pasted link really is an audio file. */}
            <audio key={music.url} controls preload="none" aria-label="Nghe thử nhạc nền" src={music.url} onError={() => setPlayFailed(true)} onPlay={() => setPlayFailed(false)} />
            <div className="pn-live" aria-live="polite">
              {playFailed ? <p className="pn-note pn-note--warn">Không phát được nhạc này. Hãy kiểm tra link, hoặc tải lên file mp3 thay thế.</p> : null}
            </div>
            <p className="pn-music__url">{music.url}</p>
            <div className="pn-actions">
              <button type="button" className="button-ghost pn-compact pn-danger" onClick={() => { setPlayFailed(false); onChange({ ...content, music: null }); }}>
                <Glyph name="trash" size={18} />
                Xóa nhạc
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="pn-drop">
              <Glyph name="music" size={28} />
              <p>Tải lên file mp3, tối đa 8 MB</p>
              <button type="button" className="button-ghost pn-compact" onClick={() => audioInput.current?.click()} disabled={songBusy}>
                <Glyph name="upload" size={18} />
                {songBusy ? "Đang tải lên…" : "Chọn file mp3"}
              </button>
            </div>
            <input
              ref={audioInput}
              type="file"
              accept=".mp3,audio/mpeg"
              hidden
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []);
                e.target.value = "";
                pickSong(picked);
              }}
            />
            <p className="pn-or" aria-hidden="true">
              hoặc
            </p>
            <TextField
              label="Dán link nhạc"
              hint="Link phải trỏ thẳng tới file âm thanh, ví dụ https://…/bai-hat.mp3. Link YouTube hay Zing MP3 không dùng được."
              error={urlError}
              value={urlDraft}
              onChange={setUrlDraft}
              onBlur={() => setUrlTouched(true)}
              inputMode="url"
              maxLength={500}
              placeholder="https://"
            />
            <div className="pn-actions">
              <button type="button" className="button-ghost pn-compact" onClick={applyLink} disabled={urlDraft.trim() === ""}>
                Dùng link này
              </button>
            </div>
          </>
        )}
        <UploadList items={songs.items} onDismiss={songs.dismiss} />
      </PanelSection>
    </div>
  );
}
