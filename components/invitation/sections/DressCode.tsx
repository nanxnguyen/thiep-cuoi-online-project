import type { Content } from "@/lib/content";
import { t, type Locale } from "@/lib/i18n";
import type { SectionVariants } from "@/lib/section-profiles";

// Trang phục gợi ý: tiêu đề, ghi chú và swatch màu. Mỗi swatch luôn đi cùng
// nhãn chữ — màu không bao giờ là kênh thông tin duy nhất.
export function DressCode({ content, locale = "vi" }: { content: Content; variant: SectionVariants["dressCode"]; locale?: Locale }) {
  if (!content.dressCode.enabled) return null;
  const dict = t(locale);
  const { title, note, colors } = content.dressCode;
  if (!title.trim() && !note.trim() && colors.length === 0) {
    return (
      <section className="inv-sec inv-dresscode">
        <span className="inv-k">{dict.dressCodeFallback}</span>
        <p className="inv-sec__empty">{dict.dressCodeEmpty}</p>
      </section>
    );
  }
  return (
    <section className="inv-sec inv-dresscode">
      <span className="inv-k">{title.trim() || dict.dressCodeFallback}</span>
      {note.trim() && <p className="inv-dresscode__note">{note}</p>}
      {colors.length > 0 && (
        <ul className="inv-dresscode__list">
          {colors.map((color, i) => (
            <li key={`${color.value}-${i}`}>
              <i aria-hidden="true" style={{ background: color.value }} />
              <span>{color.label}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
