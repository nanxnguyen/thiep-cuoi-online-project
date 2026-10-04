"use client";

import { useRef, useState, type ReactNode } from "react";
import { ThiepPreview } from "@/components/templates/ThiepPreview";
import { UploadList } from "@/components/studio/panels/UploadList";
import { useApplyLater, useUploader, type MediaProps } from "@/components/studio/panels/useUploader";
import { MediaPanel } from "@/components/studio/panels/MediaPanel";
import { StoryPanel } from "@/components/studio/panels/StoryPanel";
import { VideoPanel } from "@/components/studio/panels/VideoPanel";
import { DressCodePanel } from "@/components/studio/panels/DressCodePanel";
import { VenuePanel } from "@/components/studio/panels/VenuePanel";
import { BANKS } from "@/lib/banks";
import type { Content, EventItem } from "@/lib/content";
import { move, newId, removeAt, updateAt } from "@/lib/list";
import { colors, templates } from "@/lib/templates";

// One form per part, value for value from the form column of design/Studio Editor v3.dc.html. Only the fields the
// design shows; the drag-onto-the-card photo slots also get an explicit upload button so they work without a mouse.
type Props = {
  sec: string;
  content: Content;
  onChange: (c: Content) => void;
  templateId: string;
  onTemplate: (id: string) => void;
  media: MediaProps;
  guests: readonly string[];
  guestIdx: number;
  onGuest: (i: number) => void;
  onResponses: () => void;
};

const GREETINGS = ["Trân trọng kính mời", "Thân mời", "Hân hạnh được đón tiếp"];
const RANKS_GROOM = ["Trưởng nam", "Thứ nam", "Út nam", "Con trai"];
const RANKS_BRIDE = ["Trưởng nữ", "Thứ nữ", "Út nữ", "Con gái"];
const CEREMONIES = ["Lễ Vu Quy", "Lễ Thành Hôn", "Lễ Tân Hôn", "Lễ Đính Hôn"];
const FONTS = [
  ["playfair", "var(--display)"],
  ["cormorant", "var(--script)"],
  ["vibes", "var(--hand)"],
] as const;
const DESIGN_BANKS = ["Vietcombank", "Techcombank", "TPBank", "MB Bank", "VietinBank", "BIDV", "ACB", "VPBank"].map((n) => BANKS.find((b) => b.name === n)!);
const EXTRA_QUESTIONS = [
  ["veg", "Ăn chay / dị ứng", "Vegetarian / allergies"],
  ["bus", "Cần xe đưa đón", "Need a shuttle"],
] as const;
const THANKS = [
  "Cảm ơn bạn đã dành thời gian quý báu để chung vui cùng chúng mình. Sự hiện diện của bạn là món quà ý nghĩa nhất.",
  "Hành trình mới của chúng mình trọn vẹn hơn khi có bạn bên cạnh. Hẹn gặp bạn trong ngày vui nhé!",
  "Từ tận đáy lòng, hai gia đình xin gửi lời cảm ơn chân thành vì đã đến và chúc phúc cho chúng mình.",
];

function Chips<T extends string>({ options, value, onPick, small, label = (v) => v }: { options: readonly T[]; value: string; onPick: (v: T) => void; small?: boolean; label?: (v: T) => string }) {
  return (
    <div className="edf-chips">
      {options.map((o) => (
        <button type="button" key={o} className={small ? "edf-chip edf-chip--s" : "edf-chip"} aria-pressed={o === value} onClick={() => onPick(o)}>
          {label(o)}
        </button>
      ))}
    </div>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="edf-field">
      {label}
      {children}
    </label>
  );
}
function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="edf-group">
      <span className="edf-group__label">{label}</span>
      {children}
    </div>
  );
}
function Switch({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" role="switch" className="ed-switch edf-switch" aria-checked={on} aria-label={label} onClick={onClick}>
      <i />
    </button>
  );
}
function ToggleRow({ title, sub, on, onClick }: { title: string; sub?: string; on: boolean; onClick: () => void }) {
  return (
    <div className="edf-toggle">
      <div>
        <span>{title}</span>
        {sub && <small>{sub}</small>}
      </div>
      <Switch on={on} onClick={onClick} label={title} />
    </div>
  );
}
const Tip = ({ children }: { children: ReactNode }) => <div className="edf-tip">{children}</div>;

function PhotoButton({ label, url, busy, onPick, onClear }: { label: string; url: string; busy: boolean; onPick: (f: File) => void; onClear: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="edf-photo">
      <span className="edf-photo__thumb">{url ? <img src={url} alt="Ảnh đã tải lên" /> : null}</span>
      <span className="edf-photo__label">{label}</span>
      <button type="button" className="edf-mini" onClick={() => input.current?.click()} disabled={busy}>
        {busy ? "Đang tải…" : url ? "Đổi ảnh" : "Chọn ảnh"}
      </button>
      {url && (
        <button type="button" className="edf-mini edf-mini--danger" onClick={onClear} aria-label={`Xoá ${label.toLowerCase()}`}>
          ×
        </button>
      )}
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) onPick(f);
        }}
      />
    </div>
  );
}

const blank = (kind: EventItem["kind"], title: string): EventItem => ({ id: newId(), kind, title, date: "", time: "", arrivalTime: "", lunar: "", venue: "", address: "", mapUrl: "", venuePhoto: "", directionsNote: "", parkingNote: "" });

export function SectionForm({ sec, content: c, onChange, templateId, onTemplate, media, guests, guestIdx, onGuest, onResponses }: Props) {
  const uploader = useUploader(media);
  const applyLater = useApplyLater(c, onChange);
  const [thanksIdx, setThanksIdx] = useState(-1);
  const busy = uploader.pending > 0;

  const upload = (f: File, apply: (url: string, c: Content) => Content) => void uploader.uploadFiles([f], "image", (url) => applyLater((cur) => apply(url, cur)));
  const setEvent = (kind: "ceremony" | "reception", patch: Partial<EventItem>) => {
    const i = c.events.findIndex((e) => e.kind === kind);
    if (i >= 0) onChange({ ...c, events: updateAt(c.events, i, patch) });
    else onChange({ ...c, events: [...c.events, { ...blank(kind, kind === "ceremony" ? "Lễ Thành Hôn" : "Tiệc cưới"), ...patch }] });
  };
  const ceremony = c.events.find((e) => e.kind === "ceremony") ?? blank("ceremony", "Lễ Thành Hôn");
  const party = c.events.find((e) => e.kind === "reception") ?? blank("reception", "Tiệc cưới");
  const input = (value: string, set: (v: string) => void, extra: Partial<React.InputHTMLAttributes<HTMLInputElement>> = {}) => (
    <input className="edf-input" value={value} onChange={(e) => set(e.target.value)} {...extra} />
  );

  switch (sec) {
    case "envelope":
      return (
        <>
          <Group label="Lời mời trên phong bì">
            <Chips options={GREETINGS} value={c.envelope.greeting} onPick={(greeting) => onChange({ ...c, envelope: { greeting } })} />
            {input(c.envelope.greeting, (greeting) => onChange({ ...c, envelope: { greeting } }), { maxLength: 120, "aria-label": "Lời mời trên phong bì" })}
          </Group>
          <Group label="Xem thử với tên khách">
            <div className="edf-chips">
              {guests.map((g, i) => (
                <button type="button" key={g} className="edf-chip" aria-pressed={i === guestIdx} onClick={() => onGuest(i)}>
                  {g}
                </button>
              ))}
            </div>
          </Group>
          <Tip>Mỗi khách nhận một đường link riêng, tên của họ hiện ngay trên phong bì khi mở thiệp.</Tip>
        </>
      );

    case "template": {
      const key = c.paletteKey || templates.find((t) => t.id === templateId)?.colors[0] || "do";
      const current = templates.find((t) => t.id === templateId);
      const date = (() => {
        const [y = "", m = "", d = ""] = (party.date || ceremony.date).split("-");
        return y ? `${d} · ${m} · ${y}` : "";
      })();
      return (
        <>
          <div className="edf-tpls">
            {templates.map((t) => {
              const k = t.colors.includes(key as never) ? (key as keyof typeof colors) : t.colors[0];
              const p = colors[k];
              return (
                <button type="button" key={t.id} className="edf-tpl" aria-pressed={t.id === templateId} aria-label={t.name} onClick={() => onTemplate(t.id)}>
                  <ThiepPreview fit maxW="100%" radius="8px" family={t.family} deep={p.deep} paper={p.paper} gold={p.gold} tint={`${p.deep}14`} a={c.couple.bride.name} b={c.couple.groom.name} date={date} place="HÀ NỘI" />
                </button>
              );
            })}
          </div>
          {current && current.colors.length > 1 && (
            <Group label="Màu">
              <div className="edf-chips">
                {current.colors.map((k) => (
                  <button type="button" key={k} className="edf-chip edf-chip--s edf-swatch" aria-pressed={k === key} onClick={() => onChange({ ...c, paletteKey: k })}>
                    <i style={{ background: colors[k].deep }} />
                    {colors[k].label}
                  </button>
                ))}
              </div>
            </Group>
          )}
          <Group label="Kiểu chữ tiêu đề">
            <div className="edf-fonts">
              {FONTS.map(([k, font]) => (
                <button type="button" key={k} aria-pressed={c.nameFont === k} style={{ fontFamily: font }} onClick={() => onChange({ ...c, nameFont: k })}>
                  Aa
                </button>
              ))}
            </div>
          </Group>
        </>
      );
    }

    case "couple": {
      const { groom, bride } = c.couple;
      const setPerson = (who: "groom" | "bride", patch: Partial<typeof groom>) => onChange({ ...c, couple: { ...c.couple, [who]: { ...c.couple[who], ...patch } } });
      return (
        <>
          <div className="edf-group">
            <Field label="Chú rể">{input(groom.name, (name) => setPerson("groom", { name }), { maxLength: 60 })}</Field>
            <Chips small options={RANKS_GROOM} value={groom.rank} onPick={(rank) => setPerson("groom", { rank: groom.rank === rank ? "" : rank })} />
          </div>
          <div className="edf-group">
            <Field label="Cô dâu">{input(bride.name, (name) => setPerson("bride", { name }), { maxLength: 60 })}</Field>
            <Chips small options={RANKS_BRIDE} value={bride.rank} onPick={(rank) => setPerson("bride", { rank: bride.rank === rank ? "" : rank })} />
          </div>
          <Tip>Kéo thả ảnh cô dâu, chú rể trực tiếp vào khung ảnh trên thiệp bên cạnh.</Tip>
          <div className="edf-photos">
            <PhotoButton label="Ảnh bìa" url={c.couple.heroPhoto} busy={busy} onPick={(f) => upload(f, (url, cur) => ({ ...cur, couple: { ...cur.couple, heroPhoto: url } }))} onClear={() => onChange({ ...c, couple: { ...c.couple, heroPhoto: "" } })} />
            <PhotoButton label="Ảnh chú rể" url={groom.photo} busy={busy} onPick={(f) => upload(f, (url, cur) => ({ ...cur, couple: { ...cur.couple, groom: { ...cur.couple.groom, photo: url } } }))} onClear={() => setPerson("groom", { photo: "" })} />
            <PhotoButton label="Ảnh cô dâu" url={bride.photo} busy={busy} onPick={(f) => upload(f, (url, cur) => ({ ...cur, couple: { ...cur.couple, bride: { ...cur.couple.bride, photo: url } } }))} onClear={() => setPerson("bride", { photo: "" })} />
          </div>
          <UploadList items={uploader.items} onDismiss={uploader.dismiss} />
        </>
      );
    }

    case "family": {
      const side = (key: "groomSide" | "brideSide", title: string) => {
        const s = c.family[key];
        const set = (patch: Partial<typeof s>) => onChange({ ...c, family: { ...c.family, [key]: { ...s, ...patch } } });
        return (
          <div className="edf-card">
            <span className="edf-card__k">{title}</span>
            <Field label="Bố">{input(s.father, (father) => set({ father }), { maxLength: 60 })}</Field>
            <Field label="Mẹ">{input(s.mother, (mother) => set({ mother }), { maxLength: 60 })}</Field>
            <Field label="Địa chỉ">{input(s.address, (address) => set({ address }), { maxLength: 200, placeholder: "Không bắt buộc" })}</Field>
          </div>
        );
      };
      return (
        <>
          {side("groomSide", "NHÀ TRAI")}
          {side("brideSide", "NHÀ GÁI")}
        </>
      );
    }

    case "ceremony":
      return (
        <>
          <Group label="Loại lễ">
            <Chips options={CEREMONIES} value={ceremony.title} onPick={(title) => setEvent("ceremony", { title })} />
          </Group>
          <div className="edf-two">
            <Field label="Ngày">{input(ceremony.date, (date) => setEvent("ceremony", { date }), { type: "date" })}</Field>
            <Field label="Giờ">{input(ceremony.time, (time) => setEvent("ceremony", { time }), { type: "time" })}</Field>
          </div>
          <Field label="Ngày âm lịch">{input(ceremony.lunar, (lunar) => setEvent("ceremony", { lunar }), { maxLength: 60 })}</Field>
          <Field label="Địa điểm làm lễ">{input(ceremony.venue, (venue) => setEvent("ceremony", { venue }), { maxLength: 120 })}</Field>
        </>
      );

    case "party":
      return (
        <>
          <Field label="Ngày tiệc">{input(party.date, (date) => setEvent("reception", { date }), { type: "date" })}</Field>
          <div className="edf-two">
            <Field label="Đón khách">{input(party.arrivalTime, (arrivalTime) => setEvent("reception", { arrivalTime }), { type: "time" })}</Field>
            <Field label="Khai tiệc">{input(party.time, (time) => setEvent("reception", { time }), { type: "time" })}</Field>
          </div>
          <Field label="Nhà hàng">{input(party.venue, (venue) => setEvent("reception", { venue }), { maxLength: 120 })}</Field>
          <Field label="Địa chỉ">{input(party.address, (address) => setEvent("reception", { address }), { maxLength: 200 })}</Field>
          <Field label="Link Google Maps">{input(party.mapUrl, (mapUrl) => setEvent("reception", { mapUrl }), { maxLength: 500, inputMode: "url", placeholder: "Dán link để khách bấm Chỉ đường" })}</Field>
        </>
      );

    case "schedule":
      return (
        <>
          <div className="edf-sched">
            {c.schedule.map((s, i) => (
              <div className="edf-sched__row" key={s.id}>
                <input className="edf-sched__t" type="time" value={s.time} aria-label={`Giờ mốc ${i + 1}`} onChange={(e) => onChange({ ...c, schedule: updateAt(c.schedule, i, { time: e.target.value }) })} />
                <input className="edf-sched__n" value={s.title} maxLength={80} aria-label={`Tên mốc ${i + 1}`} onChange={(e) => onChange({ ...c, schedule: updateAt(c.schedule, i, { title: e.target.value }) })} />
                <div className="edf-sched__acts">
                  <button type="button" title="Lên" aria-label={`Đưa mốc ${i + 1} lên`} disabled={i === 0} onClick={() => onChange({ ...c, schedule: move(c.schedule, i, i - 1) })}>
                    ↑
                  </button>
                  <button type="button" title="Xuống" aria-label={`Đưa mốc ${i + 1} xuống`} disabled={i === c.schedule.length - 1} onClick={() => onChange({ ...c, schedule: move(c.schedule, i, i + 1) })}>
                    ↓
                  </button>
                  <button type="button" title="Xoá" aria-label={`Xoá mốc ${i + 1}`} data-danger="" onClick={() => onChange({ ...c, schedule: removeAt(c.schedule, i) })}>
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          {c.schedule.length < 8 && (
            <button type="button" className="edf-add" onClick={() => onChange({ ...c, schedule: [...c.schedule, { id: newId(), time: "22:00", title: "Mốc mới" }] })}>
              + Thêm mốc thời gian
            </button>
          )}
        </>
      );

    case "countdown": {
      const [y, m, d] = party.date.split("-");
      return (
        <>
          <ToggleRow title="Nút thêm vào lịch" sub="Google Calendar và Apple Calendar" on={c.sections.calendar} onClick={() => onChange({ ...c, sections: { ...c.sections, calendar: !c.sections.calendar } })} />
          <Tip>
            Đồng hồ đếm đến giờ đón khách của tiệc cưới ({party.arrivalTime || party.time || "—"}, {y ? `${d}/${m}/${y}` : "—"}).
          </Tip>
        </>
      );
    }

    case "album":
      return (
        <>
          <Group label="Số ảnh hiển thị">
            <div className="edf-three">
              {([3, 6, 9] as const).map((n) => (
                <button type="button" key={n} className="edf-chip edf-chip--block" aria-pressed={c.albumCount === n} onClick={() => onChange({ ...c, albumCount: n })}>
                  {n} ảnh
                </button>
              ))}
            </div>
          </Group>
          <Tip>Kéo thả ảnh vào từng ô trên thiệp. Khách bấm vào ảnh để xem toàn màn hình.</Tip>
          <MediaPanel only="album" content={c} onChange={onChange} media={media} />
        </>
      );

    case "music":
      return (
        <>
          <MediaPanel only="music" content={c} onChange={onChange} media={media} />
          <span className="edf-note">Nhạc tự phát khi khách mở phong bì. Khách có thể tắt bằng nút ở góc thiệp.</span>
        </>
      );

    case "story":
      return <StoryPanel content={c} onChange={onChange} media={media} />;

    case "video":
      return <VideoPanel content={c} onChange={onChange} media={media} />;

    case "dressCode":
      return <DressCodePanel content={c} onChange={onChange} />;

    case "venue":
      return <VenuePanel content={c} onChange={onChange} media={media} />;

    case "rsvp": {
      const has = (id: string) => c.rsvp.questions.some((q) => q.id === id);
      const toggleQ = ([id, label, labelEn]: (typeof EXTRA_QUESTIONS)[number]) =>
        onChange({ ...c, rsvp: { ...c.rsvp, questions: has(id) ? c.rsvp.questions.filter((q) => q.id !== id) : [...c.rsvp.questions, { id, label, labelEn, type: "yesno" as const }].slice(0, 3) } });
      return (
        <>
          <Field label="Hạn phản hồi">{input(c.rsvp.deadline, (deadline) => onChange({ ...c, rsvp: { ...c.rsvp, deadline } }), { type: "date" })}</Field>
          <Group label="Câu hỏi thêm">
            <div className="edf-list">
              <div className="edf-list__row">
                <span>Số người đi cùng</span>
                <Switch on={c.rsvp.plusOnes} label="Số người đi cùng" onClick={() => onChange({ ...c, rsvp: { ...c.rsvp, plusOnes: !c.rsvp.plusOnes } })} />
              </div>
              {EXTRA_QUESTIONS.map((q) => (
                <div className="edf-list__row" key={q[0]}>
                  <span>{q[1]}</span>
                  <Switch on={has(q[0])} label={q[1]} onClick={() => toggleQ(q)} />
                </div>
              ))}
            </div>
          </Group>
          <button type="button" className="edf-link" onClick={onResponses}>
            Xem danh sách phản hồi →
          </button>
        </>
      );
    }

    case "guestbook":
      return (
        <ToggleRow
          title="Duyệt trước khi hiển thị"
          sub="Lời chúc chỉ hiện sau khi bạn đồng ý"
          on={c.guestbook.moderate}
          onClick={() => onChange({ ...c, guestbook: { ...c.guestbook, moderate: !c.guestbook.moderate } })}
        />
      );

    case "gift": {
      const card = (holder: "groom" | "bride", title: string) => {
        const i = c.gift.accounts.findIndex((a) => a.holder === holder);
        const a = c.gift.accounts[i] ?? { holder, bankCode: "", accountNumber: "", accountName: "" };
        const set = (patch: Partial<typeof a>) => {
          const next = { ...a, ...patch };
          onChange({ ...c, gift: { ...c.gift, accounts: i >= 0 ? updateAt(c.gift.accounts, i, patch) : [...c.gift.accounts, next] } });
        };
        return (
          <div className="edf-card">
            <span className="edf-card__k">{title}</span>
            <div className="edf-chips">
              {DESIGN_BANKS.map((b) => (
                <button type="button" key={b.bin} className="edf-chip edf-chip--s" aria-pressed={a.bankCode === b.bin} onClick={() => set({ bankCode: b.bin })}>
                  {b.name}
                </button>
              ))}
            </div>
            {input(a.accountNumber, (v) => set({ accountNumber: v.replace(/\D/g, "").slice(0, 20) }), { placeholder: "Số tài khoản", inputMode: "numeric", "aria-label": `Số tài khoản ${title.toLowerCase()}`, className: holder === "groom" && !a.accountNumber ? "edf-input edf-input--missing" : "edf-input" })}
            {input(a.accountName, (v) => set({ accountName: v.toUpperCase() }), { placeholder: "Tên chủ tài khoản", maxLength: 80, className: "edf-input edf-input--upper", "aria-label": `Tên chủ tài khoản ${title.toLowerCase()}` })}
          </div>
        );
      };
      return (
        <>
          {card("groom", "CHÚ RỂ")}
          {card("bride", "CÔ DÂU")}
          <span className="edf-note">Mã VietQR được tạo tự động từ số tài khoản khi xuất bản.</span>
        </>
      );
    }

    case "thanks":
      return (
        <>
          <textarea className="edf-textarea" rows={6} maxLength={500} aria-label="Lời cảm ơn" value={c.thanks.message} onChange={(e) => onChange({ ...c, thanks: { ...c.thanks, message: e.target.value } })} />
          <button
            type="button"
            className="edf-suggest"
            onClick={() => {
              const next = (thanksIdx + 1) % THANKS.length;
              setThanksIdx(next);
              onChange({ ...c, thanks: { ...c.thanks, message: THANKS[next] } });
            }}
          >
            ✦ Gợi ý lời khác
          </button>
        </>
      );

    default:
      return null;
  }
}
