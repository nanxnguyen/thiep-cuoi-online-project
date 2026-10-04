import type { Content } from "@/lib/content";
import { t, type Locale } from "@/lib/i18n";
import { directionsUrl } from "@/lib/maps";
import type { SectionVariants } from "@/lib/section-profiles";

// Địa điểm mở rộng: tách thông tin nơi đãi tiệc khỏi card sự kiện để có ảnh,
// ghi chú đường đi/đỗ xe và CTA chỉ đường rõ hơn. Tên và địa chỉ vẫn lấy từ
// event tiệc — không tạo địa chỉ thứ hai có thể lệch.
export function Venue({ content, variant, locale = "vi" }: { content: Content; variant: SectionVariants["venue"]; locale?: Locale }) {
  if (!content.sections.venue) return null;
  const dict = t(locale);
  const reception = content.events.find((e) => e.kind === "reception") ?? content.events[0];
  if (!reception) {
    return (
      <section className="inv-sec inv-venue">
        <span className="inv-k">{dict.venueTitle}</span>
        <p className="inv-sec__empty">{dict.venueEmpty}</p>
      </section>
    );
  }
  const directions = directionsUrl(reception);
  return (
    <section className="inv-sec inv-venue" data-variant={variant}>
      <span className="inv-k">{dict.venueTitle}</span>
      <p className="inv-venue__name">{reception.venue}</p>
      <p className="inv-venue__addr">{reception.address}</p>
      {reception.venuePhoto && <img className="inv-venue__img" src={reception.venuePhoto} alt={reception.venue || dict.venueTitle} loading="lazy" />}
      {reception.directionsNote.trim() && (
        <p className="inv-venue__note">
          <strong>{dict.venueDirections}: </strong>
          {reception.directionsNote}
        </p>
      )}
      {reception.parkingNote.trim() && (
        <p className="inv-venue__note">
          <strong>{dict.venueParking}: </strong>
          {reception.parkingNote}
        </p>
      )}
      {directions && (
        <a className="inv-party__map" href={directions} target="_blank" rel="noopener noreferrer">
          {dict.directions}
        </a>
      )}
    </section>
  );
}
