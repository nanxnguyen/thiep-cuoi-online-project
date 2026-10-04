"use client";

import { useRef, useState } from "react";
import { Glyph, PanelSection, TextField, isHttpUrl, type PanelProps } from "@/components/studio/fields";
import { UploadList } from "@/components/studio/panels/UploadList";
import { useApplyLater, useUploader, type MediaProps } from "@/components/studio/panels/useUploader";

// Video cưới: một video MP4/WebM (tải lên hoặc dán link https) kèm ảnh bìa bắt
// buộc. Bản xem thử trong panel không tự phát — khách bấm play mới chạy.
const isHttpsUrl = (v: string) => isHttpUrl(v) && v.toLowerCase().startsWith("https://");

export function VideoPanel({ content, onChange, media }: PanelProps & { media: MediaProps }) {
  const { video } = content;
  const clips = useUploader(media);
  const posters = useUploader(media);
  const applyLater = useApplyLater(content, onChange);
  const clipInput = useRef<HTMLInputElement>(null);
  const posterInput = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState("");
  const [urlTouched, setUrlTouched] = useState(false);
  const [playFailed, setPlayFailed] = useState(false);
  const clipBusy = clips.pending > 0;
  const posterBusy = posters.pending > 0;

  const setVideo = (next: typeof video) => onChange({ ...content, video: next, sections: { ...content.sections, video: next.enabled } });

  function pickClip(files: File[]) {
    if (!files[0]) return;
    setPlayFailed(false);
    void clips.uploadFiles([files[0]], "video", (url) => applyLater((c) => ({ ...c, video: { ...c.video, url } })));
  }
  function pickPoster(files: File[]) {
    if (!files[0]) return;
    void posters.uploadFiles([files[0]], "image", (posterUrl) => applyLater((c) => ({ ...c, video: { ...c.video, posterUrl } })));
  }
  function applyLink() {
    const url = urlDraft.trim();
    if (!isHttpsUrl(url)) {
      setUrlTouched(true);
      return;
    }
    setPlayFailed(false);
    setUrlDraft("");
    setUrlTouched(false);
    setVideo({ ...video, url });
  }
  const urlError = urlTouched && urlDraft.trim() !== "" && !isHttpsUrl(urlDraft.trim()) ? "Dán link bắt đầu bằng https:// và không có khoảng trắng." : undefined;

  return (
    <div className="pn-stack">
      <PanelSection title="Video cưới" description="Video ngắn phát ngay trên thiệp. Ảnh bìa hiện trước khi khách bấm play.">
        <TextField label="Tiêu đề video" hint="Không bắt buộc, giúp trình đọc màn hình." value={video.title} onChange={(title) => setVideo({ ...video, title })} maxLength={120} placeholder="VD: Hành trình của chúng mình" />
        {video.url ? (
          <div className="pn-music">
            <video key={video.url} controls preload="metadata" poster={video.posterUrl || undefined} aria-label={video.title || "Xem thử video cưới"} src={video.url} onError={() => setPlayFailed(true)} onPlay={() => setPlayFailed(false)} />
            <div className="pn-live" aria-live="polite">
              {playFailed ? <p className="pn-note pn-note--warn">Không phát được video này. Hãy kiểm tra link, hoặc tải lên file MP4/WebM thay thế.</p> : null}
            </div>
            <div className="pn-actions">
              <button type="button" className="button-ghost pn-compact pn-danger" onClick={() => { setPlayFailed(false); setVideo({ ...video, url: "" }); }}>
                <Glyph name="trash" size={18} />
                Xóa video
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="pn-drop">
              <Glyph name="upload" size={28} />
              <p>Tải lên video MP4 hoặc WebM, tối đa 50 MB</p>
              <button type="button" className="button-ghost pn-compact" onClick={() => clipInput.current?.click()} disabled={clipBusy}>
                <Glyph name="upload" size={18} />
                {clipBusy ? "Đang tải lên…" : "Chọn video"}
              </button>
            </div>
            <input
              ref={clipInput}
              type="file"
              accept=".mp4,.webm,video/mp4,video/webm"
              hidden
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []);
                e.target.value = "";
                pickClip(picked);
              }}
            />
            <p className="pn-or" aria-hidden="true">hoặc</p>
            <TextField
              label="Dán link video"
              hint="Link phải trỏ thẳng tới file MP4/WebM, ví dụ https://…/cuoi.mp4."
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
        <UploadList items={clips.items} onDismiss={clips.dismiss} />
      </PanelSection>
      <PanelSection title="Ảnh bìa video" description="Ảnh hiện trước khi khách bấm play. Dùng pipeline ảnh hiện có nên được tự thu nhỏ.">
          <div className="pn-photo__frame">
            {video.posterUrl ? <img className="pn-photo__img" src={video.posterUrl} alt="Ảnh bìa video cưới" loading="lazy" /> : null}
          </div>
          <div className="pn-actions">
            <button type="button" className="button-ghost pn-compact" onClick={() => posterInput.current?.click()} disabled={posterBusy}>
              <Glyph name="upload" size={18} />
              {posterBusy ? "Đang tải lên…" : video.posterUrl ? "Đổi ảnh bìa" : "Chọn ảnh bìa"}
            </button>
            {video.posterUrl ? (
              <button type="button" className="button-ghost pn-compact pn-danger" onClick={() => setVideo({ ...video, posterUrl: "" })}>
                Xóa ảnh bìa
              </button>
            ) : null}
          </div>
          <input
            ref={posterInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []);
              e.target.value = "";
              pickPoster(picked);
            }}
          />
          <UploadList items={posters.items} onDismiss={posters.dismiss} />
      </PanelSection>
    </div>
  );
}
