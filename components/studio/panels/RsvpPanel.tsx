"use client";

import { useState } from "react";
import { AddButton, Glyph, IconButton, PanelSection, SelectField, TextField, ToggleField, useListFocus, type PanelProps } from "@/components/studio/fields";
import { MAX_QUESTIONS, type Content } from "@/lib/content";
import { newId, removeAt, updateAt } from "@/lib/list";

type Question = Content["rsvp"]["questions"][number];

const TYPE_OPTIONS = [
  { value: "text", label: "Trả lời ngắn" },
  { value: "yesno", label: "Có hoặc không" },
];
const asType = (v: string): Question["type"] => (v === "yesno" ? "yesno" : "text");

export function RsvpPanel({ content, onChange }: PanelProps) {
  const { rsvp, guestbook } = content;
  const [freshId, setFreshId] = useState<string | null>(null); // question just added: its field takes focus
  const focus = useListFocus<HTMLOListElement>();

  const setRsvp = (patch: Partial<Content["rsvp"]>) => onChange({ ...content, rsvp: { ...rsvp, ...patch } });
  const setQuestions = (questions: Question[]) => setRsvp({ questions });

  function add() {
    const q: Question = { id: newId(), label: "", labelEn: "", type: "text" };
    setFreshId(q.id);
    setQuestions([...rsvp.questions, q]);
  }
  function remove(i: number) {
    const neighbour = rsvp.questions[i + 1] ?? rsvp.questions[i - 1];
    focus.focusNext(neighbour ? neighbour.id : null, "remove");
    setQuestions(removeAt(rsvp.questions, i));
  }

  return (
    <div className="pn-stack">
      <PanelSection title="Xác nhận tham dự" description="Khách điền tên, số người đi và lời nhắn ngay trên thiệp. Bạn xem kết quả ở mục Phản hồi.">
        <ToggleField label="Cho khách xác nhận tham dự" hint="Tắt nếu bạn không cần khách báo trước." checked={rsvp.enabled} onChange={(enabled) => setRsvp({ enabled })} />
        {rsvp.enabled ? (
          <>
            <TextField label="Hạn trả lời" type="date" hint="Không bắt buộc. Thiệp sẽ nhắc khách báo trước ngày này." value={rsvp.deadline} onChange={(deadline) => setRsvp({ deadline })} />
            <div className="pn-subhead">
              <h4>Câu hỏi thêm</h4>
              <span className="pn-count">
                {rsvp.questions.length}/{MAX_QUESTIONS}
              </span>
            </div>
            {rsvp.questions.length === 0 ? <p className="pn-empty">Chưa có câu hỏi nào. Bạn có thể hỏi thêm, ví dụ khách có ăn chay không.</p> : null}
            <ol className="pn-list" ref={focus.listRef}>
              {rsvp.questions.map((q, i) => (
                <li key={q.id} className="pn-item" data-key={q.id}>
                  <div className="pn-item__head">
                    <h4 className="pn-item__title">Câu hỏi {i + 1}</h4>
                    <div className="pn-item__actions">
                      <IconButton label={`Xóa câu hỏi ${i + 1}`} tone="danger" data-act="remove" onClick={() => remove(i)}>
                        <Glyph name="trash" />
                      </IconButton>
                    </div>
                  </div>
                  <div className="pn-item__body">
                    <TextField label="Nội dung câu hỏi" hint="Nhập nội dung, hoặc xóa câu hỏi nếu bạn không dùng." value={q.label} onChange={(label) => setQuestions(updateAt(rsvp.questions, i, { label }))} maxLength={120} placeholder="Bạn có ăn chay không?" autoFocus={q.id === freshId} />
                    <TextField label="Bản Anh (tuỳ chọn)" hint="Hiện khi khách xem thiệp bằng tiếng Anh. Để trống nếu không cần." value={q.labelEn} onChange={(labelEn) => setQuestions(updateAt(rsvp.questions, i, { labelEn }))} maxLength={120} placeholder="Do you eat vegetarian food?" />
                    <SelectField label="Kiểu trả lời" value={q.type} onChange={(v) => setQuestions(updateAt(rsvp.questions, i, { type: asType(v) }))} options={TYPE_OPTIONS} />
                  </div>
                </li>
              ))}
            </ol>
            <AddButton onClick={add} disabled={rsvp.questions.length >= MAX_QUESTIONS}>
              {rsvp.questions.length >= MAX_QUESTIONS ? `Đã đủ ${MAX_QUESTIONS} câu hỏi` : "Thêm câu hỏi"}
            </AddButton>
          </>
        ) : null}
      </PanelSection>

      <PanelSection title="Sổ lưu bút" description="Khách để lại lời chúc ngay trên thiệp. Bạn có thể ẩn từng lời chúc ở mục Phản hồi.">
        <ToggleField label="Cho khách gửi lời chúc" hint="Tắt nếu bạn không muốn nhận lời chúc trên thiệp." checked={guestbook.enabled} onChange={(enabled) => onChange({ ...content, guestbook: { enabled } })} />
      </PanelSection>
    </div>
  );
}
