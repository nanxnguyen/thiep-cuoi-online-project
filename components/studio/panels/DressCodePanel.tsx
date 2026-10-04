"use client";

import { Glyph, IconButton, PanelSection, TextField, useListFocus, type PanelProps } from "@/components/studio/fields";
import { MAX_DRESS_COLORS } from "@/lib/content";
import { colors } from "@/lib/templates";
import { move, removeAt, updateAt } from "@/lib/list";

// Trang phục gợi ý: mức độ trang trọng, ghi chú và tối đa 5 swatch màu.
// Mỗi swatch luôn đi cùng nhãn chữ — màu không bao giờ đứng một mình.
export function DressCodePanel({ content, onChange }: PanelProps) {
  const { dressCode } = content;
  const focus = useListFocus<HTMLUListElement>();

  const setDressCode = (next: typeof dressCode) =>
    onChange({ ...content, dressCode: next, sections: { ...content.sections, dressCode: next.enabled } });

  function addColor() {
    if (dressCode.colors.length >= MAX_DRESS_COLORS) return;
    setDressCode({ ...dressCode, colors: [...dressCode.colors, { value: colors.lam.deep, label: "" }] });
  }
  function shift(i: number, by: -1 | 1) {
    focus.focusNext(`${i}`, by < 0 ? "up" : "down");
    setDressCode({ ...dressCode, colors: move(dressCode.colors, i, i + by) });
  }
  function removeColor(i: number) {
    focus.focusNext(dressCode.colors.length > 1 ? `${i === 0 ? 1 : i - 1}` : null, "remove");
    setDressCode({ ...dressCode, colors: removeAt(dressCode.colors, i) });
  }

  return (
    <div className="pn-stack">
      <PanelSection
        title="Trang phục gợi ý"
        description="Cho khách biết nên mặc gì cho hợp không khí buổi tiệc. Bỏ trống nếu bạn không muốn gợi ý."
        action={<span className="pn-count">{dressCode.colors.length}/{MAX_DRESS_COLORS}</span>}
      >
        <TextField label="Mức độ trang trọng" value={dressCode.title} onChange={(title) => setDressCode({ ...dressCode, title })} maxLength={80} placeholder="VD: Trang trọng, lịch sự" />
        <TextField label="Ghi chú thêm" hint="Không bắt buộc, tối đa 300 ký tự." value={dressCode.note} onChange={(note) => setDressCode({ ...dressCode, note })} maxLength={300} placeholder="VD: Tiệc ngoài trời, bạn mang thêm áo khoác nhẹ" />
        <ul className="pn-photos" ref={focus.listRef}>
          {dressCode.colors.map((color, i) => (
            <li key={`${i}`} className="pn-photo" data-key={`${i}`}>
              <TextField label={`Tên màu gợi ý ${i + 1}`} value={color.label} onChange={(label) => setDressCode({ ...dressCode, colors: updateAt(dressCode.colors, i, { label }) })} maxLength={40} placeholder="VD: Xanh lam nhạt" />
              <label className="edf-field">
                Màu {i + 1}
                <input
                  type="color"
                  className="edf-input"
                  value={color.value}
                  aria-label={`Chọn màu gợi ý ${i + 1}`}
                  onChange={(e) => setDressCode({ ...dressCode, colors: updateAt(dressCode.colors, i, { value: e.target.value }) })}
                />
              </label>
              <div className="pn-photo__actions">
                <IconButton label={`Đưa màu ${i + 1} lên trước`} data-act="up" disabled={i === 0} onClick={() => shift(i, -1)}>
                  <Glyph name="up" />
                </IconButton>
                <IconButton label={`Đưa màu ${i + 1} ra sau`} data-act="down" disabled={i === dressCode.colors.length - 1} onClick={() => shift(i, 1)}>
                  <Glyph name="down" />
                </IconButton>
                <IconButton label={`Xóa màu ${i + 1}`} tone="danger" data-act="remove" onClick={() => removeColor(i)}>
                  <Glyph name="trash" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
        <div className="pn-actions">
          <button type="button" className="button-ghost pn-compact" onClick={addColor} disabled={dressCode.colors.length >= MAX_DRESS_COLORS}>
            <Glyph name="plus" size={18} />
            Thêm màu gợi ý
          </button>
        </div>
        {dressCode.colors.length >= MAX_DRESS_COLORS ? <p className="pn-hint">Đã đủ {MAX_DRESS_COLORS} màu. Xóa bớt để thêm màu mới.</p> : null}
      </PanelSection>
    </div>
  );
}
