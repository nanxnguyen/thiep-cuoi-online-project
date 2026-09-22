"use client";

import { useState } from "react";
import { AddButton, Glyph, IconButton, PanelSection, SelectField, TextField, isHttpUrl, useListFocus, type PanelProps } from "@/components/studio/fields";
import { EVENT_KINDS, MAX_EVENTS, type EventItem } from "@/lib/content";
import { move, newId, removeAt, updateAt } from "@/lib/list";

const KIND_LABELS: Record<EventItem["kind"], string> = {
  engagement: "Lễ đính hôn",
  ceremony: "Lễ thành hôn",
  reception: "Tiệc cưới",
  custom: "Sự kiện khác",
};
const KIND_OPTIONS = EVENT_KINDS.map((k) => ({ value: k, label: KIND_LABELS[k] }));
// What the invitation prints when the title is left empty (same defaults as components/invitation/sections/Events.tsx).
const DEFAULT_TITLE: Record<EventItem["kind"], string> = { ...KIND_LABELS, custom: "Sự kiện" };
const asKind = (v: string): EventItem["kind"] => EVENT_KINDS.find((k) => k === v) ?? "custom";

const mapUrlProblem = (v: string) => (v !== "" && !isHttpUrl(v) ? "Link cần bắt đầu bằng http:// hoặc https:// và không có khoảng trắng." : undefined);

const blankEvent = (): EventItem => ({ id: newId(), kind: "custom", title: "", date: "", time: "", lunar: "", venue: "", address: "", mapUrl: "" });

export function EventsPanel({ content, onChange }: PanelProps) {
  const { events } = content;
  const [confirmId, setConfirmId] = useState<string | null>(null); // event waiting for "Xóa" / "Giữ lại"
  const [freshId, setFreshId] = useState<string | null>(null); // event just added: its first field takes focus
  const focus = useListFocus<HTMLOListElement>();

  const setEvents = (next: EventItem[]) => onChange({ ...content, events: next });
  const patch = (i: number, p: Partial<EventItem>) => setEvents(updateAt(events, i, p));

  function shift(i: number, by: -1 | 1) {
    focus.focusNext(events[i].id, by < 0 ? "up" : "down");
    setEvents(move(events, i, i + by));
  }
  function add() {
    const ev = blankEvent();
    setFreshId(ev.id);
    setEvents([...events, ev]);
  }
  function remove(i: number) {
    const neighbour = events[i + 1] ?? events[i - 1];
    focus.focusNext(neighbour ? neighbour.id : null, "remove");
    setConfirmId(null);
    setEvents(removeAt(events, i));
  }
  function keep(id: string) {
    focus.focusNext(id, "remove");
    setConfirmId(null);
  }

  const full = events.length >= MAX_EVENTS;
  return (
    <div className="pn-stack">
      <PanelSection
        title="Sự kiện"
        description="Thứ tự ở đây là thứ tự hiện trên thiệp. Bạn có thể thêm lễ đính hôn, lễ thành hôn, tiệc cưới hoặc sự kiện khác."
        action={<span className="pn-count">{events.length}/{MAX_EVENTS}</span>}
      >
        {events.length === 0 ? <p className="pn-empty">Chưa có sự kiện nào. Thêm một sự kiện để khách biết ngày, giờ và địa điểm.</p> : null}
        <ol className="pn-list" ref={focus.listRef}>
          {events.map((ev, i) => (
            <li key={ev.id} className="pn-item" data-key={ev.id}>
              <div className="pn-item__head">
                <h4 className="pn-item__title">
                  {i + 1}. {ev.title.trim() || DEFAULT_TITLE[ev.kind]}
                </h4>
                <div className="pn-item__actions">
                  <IconButton label={`Đưa sự kiện ${i + 1} lên trước`} data-act="up" disabled={i === 0} onClick={() => shift(i, -1)}>
                    <Glyph name="up" />
                  </IconButton>
                  <IconButton label={`Đưa sự kiện ${i + 1} xuống sau`} data-act="down" disabled={i === events.length - 1} onClick={() => shift(i, 1)}>
                    <Glyph name="down" />
                  </IconButton>
                  <IconButton label={`Xóa sự kiện ${i + 1}`} tone="danger" data-act="remove" onClick={() => setConfirmId(ev.id)}>
                    <Glyph name="trash" />
                  </IconButton>
                </div>
              </div>
              {confirmId === ev.id ? (
                <div className="pn-confirm" role="group" aria-label={`Xác nhận xóa sự kiện ${i + 1}`}>
                  <p>Xóa sự kiện này? Nội dung bạn đã nhập sẽ mất.</p>
                  <button type="button" className="button-ghost pn-compact pn-danger" onClick={() => remove(i)}>
                    Xóa sự kiện
                  </button>
                  <button type="button" className="button-ghost pn-compact" autoFocus onClick={() => keep(ev.id)}>
                    Giữ lại
                  </button>
                </div>
              ) : null}
              <div className="pn-item__body">
                <SelectField label="Loại sự kiện" value={ev.kind} onChange={(v) => patch(i, { kind: asKind(v) })} options={KIND_OPTIONS} autoFocus={ev.id === freshId} />
                <TextField label="Tên hiển thị" hint="Để trống thì thiệp dùng tên của loại sự kiện." value={ev.title} onChange={(title) => patch(i, { title })} maxLength={80} placeholder={DEFAULT_TITLE[ev.kind]} />
                <div className="pn-row">
                  <TextField label="Ngày" type="date" value={ev.date} onChange={(date) => patch(i, { date })} />
                  <TextField label="Giờ" type="time" value={ev.time} onChange={(time) => patch(i, { time })} />
                </div>
                <TextField label="Ngày âm lịch" hint="Không bắt buộc." value={ev.lunar} onChange={(lunar) => patch(i, { lunar })} maxLength={60} placeholder="Tức ngày 28 tháng 9 năm Bính Ngọ" />
                <TextField label="Tên địa điểm" value={ev.venue} onChange={(venue) => patch(i, { venue })} maxLength={120} placeholder="Nhà hàng Hoa Sen" />
                <TextField label="Địa chỉ" value={ev.address} onChange={(address) => patch(i, { address })} maxLength={200} placeholder="45 Lê Lợi, Quận 1, TP. Hồ Chí Minh" />
                <TextField
                  label="Link Google Maps"
                  inputMode="url"
                  hint="Không bắt buộc. Bỏ trống thì thiệp tự tìm đường theo địa chỉ."
                  error={mapUrlProblem(ev.mapUrl)}
                  value={ev.mapUrl}
                  onChange={(mapUrl) => patch(i, { mapUrl })}
                  maxLength={500}
                  placeholder="https://maps.app.goo.gl/…"
                />
              </div>
            </li>
          ))}
        </ol>
        <AddButton onClick={add} disabled={full}>
          {full ? `Đã đủ ${MAX_EVENTS} sự kiện` : "Thêm sự kiện"}
        </AddButton>
      </PanelSection>
    </div>
  );
}
