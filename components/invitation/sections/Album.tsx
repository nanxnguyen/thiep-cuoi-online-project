import type { Content } from "@/lib/content";
import { t, type Locale } from "@/lib/i18n";
import { AlbumGallery } from "../client/AlbumGallery";
import { Reveal } from "../client/Reveal";

export function Album({ content, locale = "vi" }: { content: Content; locale?: Locale }) {
  if (content.album.length === 0) return null;
  const dict = t(locale);
  return (
    <section id="album" className="inv-section inv-albumsec" aria-labelledby="inv-album-h">
      <Reveal>
        <h2 className="inv-label" id="inv-album-h">
          {dict.albumTitle}
        </h2>
        <AlbumGallery photos={content.album} locale={locale} />
      </Reveal>
    </section>
  );
}
