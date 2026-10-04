"use client";

import { Glyph, IconButton, PanelSection, TextField, useListFocus, type PanelProps } from "@/components/studio/fields";
import { UploadList } from "@/components/studio/panels/UploadList";
import { useApplyLater, useUploader, type MediaProps } from "@/components/studio/panels/useUploader";
import { MAX_STORY_ITEMS } from "@/lib/content";
import { move, newId, removeAt, updateAt } from "@/lib/list";

// Chuyện tình yêu: tối đa 6 cột mốc, mỗi mốc có ngày, tiêu đề, lời kể ngắn và
// ảnh tùy chọn. Nút thêm/xóa/sắp xếp đều là button thật nên dùng được bằng bàn phím.
export function StoryPanel({ content, onChange, media }: PanelProps & { media: MediaProps }) {
  const { story } = content;
  const photos = useUploader(media);
  const applyLater = useApplyLater(content, onChange);
  const focus = useListFocus<HTMLUListElement>();

  const setStory = (next: typeof story) => onChange({ ...content, story: next, sections: { ...content.sections, story: next.enabled } });
  const room = MAX_STORY_ITEMS - story.items.length - photos.pending;

  function addItem() {
    if (room <= 0) return;
    setStory({ ...story, items: [...story.items, { id: newId(), date: "", title: "", body: "", photo: "", alt: "" }] });
  }
  function shift(i: number, by: -1 | 1) {
    focus.focusNext(story.items[i].id, by < 0 ? "up" : "down");
    setStory({ ...story, items: move(story.items, i, i + by) });
  }
  function removeItem(i: number) {
    const neighbour = story.items[i + 1] ?? story.items[i - 1];
    focus.focusNext(neighbour ? neighbour.id : null, "remove");
    setStory({ ...story, items: removeAt(story.items, i) });
  }
  function pickPhoto(i: number, files: File[]) {
    if (!files[0]) return;
    void photos.uploadFiles([files[0]], "image", (url) =>
      applyLater((c) => ({ ...c, story: { ...c.story, items: updateAt(c.story.items, i, { photo: url }) } })),
    );
  }

  return (
    <div className="pn-stack">
      <PanelSection
        title="Chuyện tình yêu"
        description="Kể vài cột mốc đáng nhớ: lần đầu gặp, tỏ tình, cầu hôn… Mỗi mốc cần ít nhất ngày và tiêu đề."
        action={<span className="pn-count">{story.items.length}/{MAX_STORY_ITEMS}</span>}
      >
        <ul className="pn-photos" ref={focus.listRef}>
          {story.items.map((item, i) => (
            <li key={item.id} className="pn-photo" data-key={item.id}>
              <span className="pn-photo__num" aria-hidden="true">{i + 1}</span>
              <TextField label={`Ngày của mốc ${i + 1}`} value={item.date} onChange={(date) => setStory({ ...story, items: updateAt(story.items, i, { date }) })} maxLength={40} placeholder="VD: 14/02/2020" />
              <TextField label={`Tiêu đề mốc ${i + 1}`} value={item.title} onChange={(title) => setStory({ ...story, items: updateAt(story.items, i, { title }) })} maxLength={100} placeholder="VD: Lần đầu gặp nhau" />
              <TextField label={`Lời kể mốc ${i + 1}`} hint="Không bắt buộc, tối đa 500 ký tự." value={item.body} onChange={(body) => setStory({ ...story, items: updateAt(story.items, i, { body }) })} maxLength={500} />
              <TextField label={`Mô tả ảnh mốc ${i + 1}`} hint="Không bắt buộc, giúp trình đọc màn hình." value={item.alt} onChange={(alt) => setStory({ ...story, items: updateAt(story.items, i, { alt }) })} maxLength={120} />
              <div className="pn-photo__frame">
                {item.photo ? <img className="pn-photo__img" src={item.photo} alt={item.alt || `Ảnh mốc ${i + 1}`} loading="lazy" /> : null}
              </div>
              <div className="pn-actions">
                <label className="button-ghost pn-compact">
                  <Glyph name="upload" size={18} />
                  {item.photo ? "Đổi ảnh" : "Thêm ảnh"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const picked = Array.from(e.target.files ?? []);
                      e.target.value = "";
                      pickPhoto(i, picked);
                    }}
                  />
                </label>
                {item.photo ? (
                  <button type="button" className="button-ghost pn-compact pn-danger" onClick={() => setStory({ ...story, items: updateAt(story.items, i, { photo: "" }) })}>
                    Xóa ảnh
                  </button>
                ) : null}
              </div>
              <div className="pn-photo__actions">
                <IconButton label={`Đưa mốc ${i + 1} lên trước`} data-act="up" disabled={i === 0} onClick={() => shift(i, -1)}>
                  <Glyph name="up" />
                </IconButton>
                <IconButton label={`Đưa mốc ${i + 1} ra sau`} data-act="down" disabled={i === story.items.length - 1} onClick={() => shift(i, 1)}>
                  <Glyph name="down" />
                </IconButton>
                <IconButton label={`Xóa mốc ${i + 1}`} tone="danger" data-act="remove" onClick={() => removeItem(i)}>
                  <Glyph name="trash" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
        <UploadList items={photos.items} onDismiss={photos.dismiss} />
        <div className="pn-actions">
          <button type="button" className="button-ghost pn-compact" onClick={addItem} disabled={room <= 0}>
            <Glyph name="plus" size={18} />
            Thêm cột mốc
          </button>
        </div>
        {room <= 0 ? <p className="pn-hint">Đã đủ {MAX_STORY_ITEMS} cột mốc. Xóa bớt để thêm mốc mới.</p> : null}
      </PanelSection>
    </div>
  );
}
