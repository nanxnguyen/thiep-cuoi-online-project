"use client";

import { useId } from "react";
import { Glyph, PanelSection } from "@/components/studio/fields";
import { templates } from "@/lib/templates";

// Native radio inputs stretched over each card: arrow keys, Tab and the checked state come from the browser.
export function TemplatePanel({ templateId, onTemplate }: { templateId: string; onTemplate: (id: string) => void }) {
  const group = useId();
  return (
    <div className="pn-stack">
      <PanelSection title="Chọn mẫu thiệp" description="Đổi mẫu lúc nào cũng được. Nội dung bạn đã nhập vẫn được giữ nguyên.">
        <div className="pn-tpl-grid" role="radiogroup" aria-label="Mẫu thiệp">
          {templates.map((t) => {
            const p = t.palette;
            return (
              <label key={t.id} className="pn-tpl">
                <input type="radio" className="pn-tpl__input" name={group} value={t.id} checked={t.id === templateId} onChange={() => onTemplate(t.id)} />
                <span className="pn-tpl__card">
                  <span className="pn-tpl__swatches" aria-hidden="true">
                    {[p.bg, p.surface, p.ink, p.muted, p.accent, p.accentInk].map((color, i) => (
                      <i key={i} style={{ background: color }} />
                    ))}
                  </span>
                  <span className="pn-tpl__name">{t.name}</span>
                  <span className="pn-tpl__blurb">{t.blurb}</span>
                  <span className="pn-tpl__tick" aria-hidden="true">
                    <Glyph name="check" size={14} />
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </PanelSection>
    </div>
  );
}
