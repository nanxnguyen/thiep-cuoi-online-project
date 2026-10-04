import type { Content } from "@/lib/content";
import { t, type Locale } from "@/lib/i18n";
import type { SectionVariants } from "@/lib/section-profiles";

// Chuyện tình yêu: 2–6 cột mốc, không carousel. Ba biến thể chỉ đổi nhịp trình
// bày qua data-variant; nội dung và thứ tự thời gian giữ nguyên.
export function Story({ content, variant, locale = "vi" }: { content: Content; variant: SectionVariants["story"]; locale?: Locale }) {
  if (!content.story.enabled) return null;
  const dict = t(locale);
  const items = content.story.items.filter((i) => i.title.trim() || i.date.trim() || i.body.trim() || i.photo);
  return (
    <section className="inv-sec inv-story" data-variant={variant}>
      <span className="inv-k">{dict.storyTitle}</span>
      {items.length === 0 ? (
        <p className="inv-sec__empty">{dict.storyEmpty}</p>
      ) : variant === "editorial" ? (
        <ol className="inv-story__list">
          {items.map((item, n) => (
            <li key={item.id}>
              <span className="inv-story__num" aria-hidden="true">{String(n + 1).padStart(2, "0")}</span>
              <div>
                <p className="inv-story__date">{item.date}</p>
                <p className="inv-story__title">{item.title}</p>
                {item.body && <p className="inv-story__body">{item.body}</p>}
                {item.photo && <img className="inv-story__img" src={item.photo} alt={item.alt || item.title} loading="lazy" />}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <ol className="inv-story__list">
          {items.map((item) => (
            <li key={item.id}>
              {item.photo && <img className="inv-story__img" src={item.photo} alt={item.alt || item.title} loading="lazy" />}
              <div>
                <p className="inv-story__date">{item.date}</p>
                <p className="inv-story__title">{item.title}</p>
                {item.body && <p className="inv-story__body">{item.body}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
