"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";

type Photo = { url: string; alt: string };

const labels = {
  Close: "Đóng",
  Previous: "Ảnh trước",
  Next: "Ảnh sau",
  "Zoom in": "Phóng to",
  "Zoom out": "Thu nhỏ",
  Lightbox: "Xem ảnh",
};

// The grid of thumbnails; tapping one opens yet-another-react-lightbox, which brings swipe, pinch/double-tap zoom,
// keyboard arrows, a focus trap and focus restoration, so none of that is hand-written here.
export function AlbumGallery({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(-1);
  const alt = (p: Photo, i: number) => p.alt || `Ảnh cưới ${i + 1}`;

  return (
    <>
      <ul className="inv-album">
        {photos.map((p, i) => (
          <li key={`${p.url}-${i}`}>
            <button type="button" className="inv-photo" aria-label={`Xem ảnh ${i + 1} trên ${photos.length}`} onClick={() => setIndex(i)}>
              {/* Plain <img>: album URLs are user-uploaded storage URLs, not known to next/image. */}
              <img src={p.url} alt={alt(p, i)} loading="lazy" decoding="async" />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={photos.map((p, i) => ({ src: p.url, alt: alt(p, i) }))}
        plugins={[Counter, Zoom]}
        controller={{ closeOnBackdropClick: true }}
        labels={labels}
        styles={{ container: { backgroundColor: "rgba(12, 10, 9, 0.95)" } }}
      />
    </>
  );
}
