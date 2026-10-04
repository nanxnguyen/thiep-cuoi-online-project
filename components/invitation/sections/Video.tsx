import type { Content } from "@/lib/content";
import { t, type Locale } from "@/lib/i18n";

// Video cưới: một video duy nhất, native controls, poster bắt buộc khi có video,
// không autoplay. Fallback link khi trình duyệt không phát được.
export function Video({ content, locale = "vi" }: { content: Content; preview?: boolean; locale?: Locale }) {
  if (!content.video.enabled) return null;
  const dict = t(locale);
  if (!content.video.url) {
    return (
      <section className="inv-sec inv-video">
        <span className="inv-k">{dict.videoTitle}</span>
        <p className="inv-sec__empty">{dict.videoEmpty}</p>
      </section>
    );
  }
  return (
    <section className="inv-sec inv-video">
      <span className="inv-k">{dict.videoTitle}</span>
      {content.video.title && <p className="inv-video__title">{content.video.title}</p>}
      <video className="inv-video__player" controls preload="metadata" poster={content.video.posterUrl || undefined} aria-label={content.video.title || dict.videoTitle}>
        <source src={content.video.url} type={content.video.url.endsWith(".webm") ? "video/webm" : "video/mp4"} />
        {dict.videoFallback}{" "}
        <a href={content.video.url} target="_blank" rel="noopener noreferrer">
          {dict.videoOpenLink}
        </a>
      </video>
    </section>
  );
}
