"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { sampleContent } from "@/lib/content";
import { colors, templateSamples, templates, type ColorKey, type CoverFamily } from "@/lib/templates";
import { ThiepPreview } from "./ThiepPreview";

const familyLabels: Record<CoverFamily, string> = {
  A: "Song hỷ",
  B: "Nét mực",
  C: "Hoa nhài",
  D: "Hoàng gia",
  E: "Phong thư",
  F: "Bìa báo",
  G: "Đôi khung",
  H: "Hỷ sự",
  I: "Song phụng",
  J: "Song cửa",
};

const families = [...new Set(templates.map((template) => template.family))] as CoverFamily[];
const DEMO_NOW = new Date("2026-11-09T10:00:00+07:00");

export function PreviewDemo() {
  const [family, setFamily] = useState<CoverFamily>("A");
  const familyTemplates = useMemo(() => templates.filter((template) => template.family === family), [family]);
  const [color, setColor] = useState<ColorKey>(familyTemplates[0].colors[0]);
  const [showFull, setShowFull] = useState(false);
  const template = familyTemplates.find((item) => item.colors.includes(color)) ?? familyTemplates[0];
  const paletteKey = template.colors.includes(color) ? color : template.colors[0];
  const content = useMemo(() => ({ ...sampleContent(DEMO_NOW), paletteKey }), [paletteKey]);

  function selectFamily(nextFamily: CoverFamily) {
    const nextTemplate = templates.find((item) => item.family === nextFamily) ?? templates[0];
    setFamily(nextFamily);
    setColor(nextTemplate.colors[0]);
  }

  return (
    <>
      <section className="demo-hero wrap-read">
        <div>
          <p className="eyebrow">Thiep Preview · demo</p>
          <h1>Chạm vào từng kiểu bìa, <em>tìm ra chất riêng.</em></h1>
        </div>
        <div className="demo-hero__note">
          <p>Một bản xem thử đủ dài để cảm nhận nhịp của tấm thiệp: từ bìa, câu chuyện hai gia đình đến xác nhận tham dự và mừng cưới.</p>
          <span>10 kiểu bìa · nhiều bảng màu · một trình biên tập</span>
        </div>
      </section>

      <section className="demo-workbench wrap-read" aria-label="Trình xem thử thiệp">
        <div className="demo-workbench__preview">
          <div className="demo-preview__label">
            <span>{family} · {familyLabels[family]}</span>
            <span>9 : 16</span>
          </div>
          <div className="demo-cover-frame">
            <ThiepPreview fit maxW="100%" family={template.family} deep={colors[paletteKey].deep} paper={colors[paletteKey].paper} gold={colors[paletteKey].gold} a={templateSamples[template.id].a} b={templateSamples[template.id].b} date={templateSamples[template.id].date} place={templateSamples[template.id].place} />
          </div>
          <div className="demo-workbench__caption">
            <strong>{template.name}</strong>
            <span>{template.blurb}</span>
          </div>
        </div>

        <div className="demo-workbench__controls">
          <div className="demo-control-block">
            <p className="demo-control-block__label">01 · Chọn kiểu bìa</p>
            <div className="demo-family-grid" role="group" aria-label="Chọn kiểu bìa">
              {families.map((item) => (
                <button key={item} type="button" className="demo-family" aria-pressed={family === item} onClick={() => selectFamily(item)}>
                  <span>{item}</span>
                  <small>{familyLabels[item]}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="demo-control-block">
            <p className="demo-control-block__label">02 · Chọn sắc độ</p>
            <div className="demo-colors" role="group" aria-label="Chọn màu">
              {template.colors.map((key) => (
                <button key={key} type="button" className="demo-color" aria-label={colors[key].label} aria-pressed={paletteKey === key} onClick={() => setColor(key)}>
                  <i style={{ background: colors[key].deep }} />
                  <span>{colors[key].label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="demo-control-block demo-control-block--last">
            <p className="demo-control-block__label">03 · Đi tiếp</p>
            <button type="button" className="demo-full-toggle" aria-expanded={showFull} onClick={() => setShowFull((current) => !current)}>
              <span><strong>{showFull ? "Đang xem toàn bộ thiệp" : "Chỉ xem bìa"}</strong><small>{showFull ? "Các phần nội dung bên dưới đang mở." : "Mở để xem trải nghiệm đầy đủ."}</small></span>
              <i aria-hidden="true">{showFull ? "−" : "+"}</i>
            </button>
            <div className="demo-actions">
              <Link className="button-primary" href={`/studio?template=${template.id}&color=${paletteKey}`}>Dùng mẫu này</Link>
              <Link className="button-ghost" href={`/templates/${template.id}?color=${paletteKey}`}>Xem chi tiết mẫu</Link>
            </div>
          </div>
        </div>
      </section>

      {showFull && (
        <section className="demo-full wrap-read" aria-label="Toàn bộ thiệp xem thử">
          <div className="demo-full__intro">
            <p className="eyebrow">Bản xem thử đầy đủ</p>
            <h2>Không chỉ là một chiếc bìa.</h2>
            <p>Thay nội dung mẫu bằng câu chuyện của hai bạn trong Studio. Những phần như RSVP, lưu bút và mừng cưới sẽ sẵn sàng để khách tương tác.</p>
          </div>
          <div className="demo-full__frame">
            <InvitationRenderer mode="preview" gate={false} now={DEMO_NOW} template={template} content={content} />
          </div>
        </section>
      )}
    </>
  );
}
