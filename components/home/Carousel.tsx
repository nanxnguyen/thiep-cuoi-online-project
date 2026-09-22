"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";

// A swipeable, keyboard-friendly row (Embla). On wide screens everything fits and the arrows disappear; on phones the
// next card peeks in so people know to swipe. Children are the slides (give each one the class carousel__slide).
export function Carousel({ label, children }: { label: string; children: ReactNode }) {
  const [viewport, api] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", dragFree: true });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    if (!api) return;
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    sync();
    api.on("select", sync).on("reInit", sync).on("resize", sync);
    return () => {
      api.off("select", sync).off("reInit", sync).off("resize", sync);
    };
  }, [api, sync]);

  return (
    <div className="carousel" role="region" aria-roledescription="carousel" aria-label={label}>
      <div className="carousel__viewport" ref={viewport}>
        <div className="carousel__track">{children}</div>
      </div>
      <div className="carousel__nav" data-active={canPrev || canNext}>
        <button type="button" aria-label="Xem trước" disabled={!canPrev} onClick={() => api?.scrollPrev()}>
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <button type="button" aria-label="Xem tiếp" disabled={!canNext} onClick={() => api?.scrollNext()}>
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
