"use client";

import { useId, useRef } from "react";
import { Glyph, PanelSection, TextAreaField, TextField, type PanelProps } from "@/components/studio/fields";
import { UploadList } from "@/components/studio/panels/UploadList";
import { useApplyLater, useUploader, type MediaProps } from "@/components/studio/panels/useUploader";
import { SAMPLE_NAMES, type Content } from "@/lib/content";

type Side = Content["family"]["groomSide"];

function FamilyGroup({ title, side, onChange, fatherHint, motherHint }: { title: string; side: Side; onChange: (patch: Partial<Side>) => void; fatherHint: string; motherHint: string }) {
  const id = useId();
  return (
    <div className="pn-item" role="group" aria-labelledby={id}>
      <div className="pn-item__head">
        <h4 id={id} className="pn-item__title">
          {title}
        </h4>
      </div>
      <div className="pn-item__body">
        <TextField label="Cha" value={side.father} onChange={(father) => onChange({ father })} maxLength={60} placeholder={fatherHint} />
        <TextField label="Mẹ" value={side.mother} onChange={(mother) => onChange({ mother })} maxLength={60} placeholder={motherHint} />
        <TextField label="Địa chỉ" value={side.address} onChange={(address) => onChange({ address })} maxLength={200} placeholder="Quận, thành phố" />
      </div>
    </div>
  );
}

export function CouplePanel({ content, onChange, media }: PanelProps & { media: MediaProps }) {
  const { couple, family, thanks } = content;
  const fileRef = useRef<HTMLInputElement>(null);
  const uploader = useUploader(media);
  const applyLater = useApplyLater(content, onChange);

  const setCouple = (patch: Partial<Content["couple"]>) => onChange({ ...content, couple: { ...couple, ...patch } });
  const setSide = (side: "groomSide" | "brideSide", patch: Partial<Side>) => onChange({ ...content, family: { ...family, [side]: { ...family[side], ...patch } } });

  function pickHero(files: File[]) {
    if (!files[0]) return;
    void uploader.uploadFiles([files[0]], "image", (url) => applyLater((c) => ({ ...c, couple: { ...c.couple, heroPhoto: url } })));
  }
  const bothSample = couple.groom.name.trim() === SAMPLE_NAMES.groom && couple.bride.name.trim() === SAMPLE_NAMES.bride;
  const uploading = uploader.pending > 0;

  return (
    <div className="pn-stack">
      <PanelSection title="Cô dâu và chú rể" description="Tên hai bạn sẽ hiện lớn trên trang bìa.">
        <TextField label="Tên chú rể" value={couple.groom.name} onChange={(name) => setCouple({ groom: { name } })} maxLength={60} placeholder="Ví dụ: Nguyễn Văn Minh" />
        <TextField label="Tên cô dâu" value={couple.bride.name} onChange={(name) => setCouple({ bride: { name } })} maxLength={60} placeholder="Ví dụ: Lê Thị An" />
        {bothSample ? <p className="pn-note">Hai tên này là tên mẫu. Nhớ đổi thành tên của hai bạn trước khi xuất bản.</p> : null}
      </PanelSection>

      <PanelSection title="Lời mời" description="Vài dòng gửi tới khách mời.">
        <TextAreaField label="Nội dung lời mời" value={couple.message} onChange={(message) => setCouple({ message })} maxLength={500} rows={5} />
      </PanelSection>

      <PanelSection title="Ảnh bìa" description="Chọn tấm ảnh đẹp nhất của hai bạn. Ảnh được tự thu nhỏ trước khi tải lên.">
        {couple.heroPhoto ? (
          <div className="pn-hero">
            <img className="pn-hero__img" src={couple.heroPhoto} alt="Ảnh bìa hiện tại" />
            <div className="pn-actions">
              <button type="button" className="button-ghost pn-compact" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <Glyph name="upload" size={18} />
                {uploading ? "Đang tải lên…" : "Đổi ảnh"}
              </button>
              <button type="button" className="button-ghost pn-compact pn-danger" onClick={() => setCouple({ heroPhoto: "" })}>
                <Glyph name="trash" size={18} />
                Xóa ảnh
              </button>
            </div>
          </div>
        ) : (
          <div className="pn-drop">
            <Glyph name="image" size={28} />
            <p>Chưa có ảnh bìa</p>
            <button type="button" className="button-ghost pn-compact" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Glyph name="upload" size={18} />
              {uploading ? "Đang tải lên…" : "Chọn ảnh"}
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []);
            e.target.value = ""; // lets the same file be picked again after a failure
            pickHero(picked);
          }}
        />
        <UploadList items={uploader.items} onDismiss={uploader.dismiss} />
      </PanelSection>

      <PanelSection title="Gia đình hai bên" description="Hiện ở phần “Hai họ” trên thiệp. Bên nào để trống thì thiệp bỏ qua bên đó.">
        <FamilyGroup title="Nhà trai" side={family.groomSide} onChange={(patch) => setSide("groomSide", patch)} fatherHint="Ví dụ: Ông Nguyễn Văn Hòa" motherHint="Ví dụ: Bà Trần Thị Lan" />
        <FamilyGroup title="Nhà gái" side={family.brideSide} onChange={(patch) => setSide("brideSide", patch)} fatherHint="Ví dụ: Ông Lê Quang Minh" motherHint="Ví dụ: Bà Phạm Thị Thu" />
      </PanelSection>

      <PanelSection title="Lời cảm ơn" description="Hiện ở cuối thiệp.">
        <TextAreaField label="Nội dung lời cảm ơn" value={thanks.message} onChange={(message) => onChange({ ...content, thanks: { message } })} maxLength={500} rows={4} />
      </PanelSection>
    </div>
  );
}
