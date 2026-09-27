import type { Content } from "@/lib/content";
import { t, type Locale } from "@/lib/i18n";
import { AlbumGallery } from "../client/AlbumGallery";

export function Album({ content, locale = "vi" }: { content: Content; locale?: Locale }) {
  if (!content.sections.album || content.album.length === 0) return null;
  const dict = t(locale);
  return (
    <section id="album" className="inv-sec inv-albumsec">
      <h2 className="inv-albumsec__title inv-name-font">{dict.albumTitle}</h2>
      <AlbumGallery photos={content.album.slice(0, content.albumCount)} locale={locale} />
    </section>
  );
}
