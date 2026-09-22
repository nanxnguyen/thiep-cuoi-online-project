import type { Content } from "@/lib/content";
import { AlbumGallery } from "../client/AlbumGallery";
import { Reveal } from "../client/Reveal";

export function Album({ content }: { content: Content }) {
  if (content.album.length === 0) return null;
  return (
    <section className="inv-section inv-albumsec" aria-labelledby="inv-album-h">
      <Reveal>
        <h2 className="inv-label" id="inv-album-h">
          Khoảnh khắc của chúng mình
        </h2>
        <AlbumGallery photos={content.album} />
      </Reveal>
    </section>
  );
}
