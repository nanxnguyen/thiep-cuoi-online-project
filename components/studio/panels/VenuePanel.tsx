"use client";

import { useRef } from "react";
import { Glyph, PanelSection, TextField, type PanelProps } from "@/components/studio/fields";
import { UploadList } from "@/components/studio/panels/UploadList";
import { useApplyLater, useUploader, type MediaProps } from "@/components/studio/panels/useUploader";
import { updateAt } from "@/lib/list";

// Địa điểm chi tiết: ảnh nơi đãi tiệc, ghi chú đường đi và chỗ đỗ xe.
// Dữ liệu nằm trên event tiệc duy nhất — tên và địa chỉ vẫn do phần Tiệc cưới
// quản lý nên không bao giờ lệch nhau.
export function VenuePanel({ content, onChange, media }: PanelProps & { media: MediaProps }) {
  const uploader = useUploader(media);
  const applyLater = useApplyLater(content, onChange);
  const photoInput = useRef<HTMLInputElement>(null);

  const idx = content.events.findIndex((e) => e.kind === "reception");
  if (idx < 0) {
    return (
      <div className="pn-stack">
        <PanelSection title="Địa điểm chi tiết" description="Thêm phần Tiệc cưới trước, rồi quay lại đây để bổ sung ảnh và chỉ đường.">
          <p className="pn-hint">Thiệp này chưa có tiệc cưới nên chưa có gì để mô tả thêm.</p>
        </PanelSection>
      </div>
    );
  }
  const event = content.events[idx];
  const set = (patch: Partial<typeof event>) => onChange({ ...content, events: updateAt(content.events, idx, patch) });

  function pickPhoto(files: File[]) {
    if (!files[0]) return;
    void uploader.uploadFiles([files[0]], "image", (venuePhoto) => applyLater((c) => ({ ...c, events: updateAt(c.events, idx, { venuePhoto }) })));
  }

  return (
    <div className="pn-stack">
      <PanelSection title="Địa điểm chi tiết" description={`Bổ sung cho tiệc “${event.title || "Tiệc cưới"}”. Tên và địa chỉ vẫn sửa ở phần Tiệc cưới.`}>
        <TextField label="Tên nơi đãi tiệc" value={event.venue} onChange={(venue) => set({ venue })} maxLength={120} />
        <TextField label="Địa chỉ" value={event.address} onChange={(address) => set({ address })} maxLength={200} />
        <div className="pn-photo__frame">
          {event.venuePhoto ? <img className="pn-photo__img" src={event.venuePhoto} alt={`Ảnh ${event.venue || "nơi đãi tiệc"}`} loading="lazy" /> : null}
        </div>
        <div className="pn-actions">
          <button type="button" className="button-ghost pn-compact" onClick={() => photoInput.current?.click()} disabled={uploader.pending > 0}>
            <Glyph name="upload" size={18} />
            {uploader.pending > 0 ? "Đang tải lên…" : event.venuePhoto ? "Đổi ảnh địa điểm" : "Thêm ảnh địa điểm"}
          </button>
          {event.venuePhoto ? (
            <button type="button" className="button-ghost pn-compact pn-danger" onClick={() => set({ venuePhoto: "" })}>
              Xóa ảnh
            </button>
          ) : null}
        </div>
        <input
          ref={photoInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []);
            e.target.value = "";
            pickPhoto(picked);
          }}
        />
        <UploadList items={uploader.items} onDismiss={uploader.dismiss} />
        <TextField label="Chỉ đường" hint="Không bắt buộc, tối đa 300 ký tự." value={event.directionsNote} onChange={(directionsNote) => set({ directionsNote })} maxLength={300} placeholder="VD: Từ cổng chính đi thẳng 200m, rẽ phải ở hồ sen" />
        <TextField label="Chỗ đỗ xe" hint="Không bắt buộc, tối đa 300 ký tự." value={event.parkingNote} onChange={(parkingNote) => set({ parkingNote })} maxLength={300} placeholder="VD: Bãi xe miễn phí ngay cổng, sức chứa 100 ô tô" />
      </PanelSection>
    </div>
  );
}
