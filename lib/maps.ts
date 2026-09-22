// Keyless Google Maps links built from what the couple typed (no API key, no SDK).
type Place = { venue: string; address: string; mapUrl: string };

const placeText = (p: Pick<Place, "venue" | "address">) =>
  [p.venue, p.address]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");

export const hasPlace = (p: Pick<Place, "venue" | "address">) => placeText(p) !== "";

// The owner's own link (e.g. a pinned Maps share URL) wins over the generated one.
export function directionsUrl(p: Place): string | null {
  if (p.mapUrl) return p.mapUrl;
  const text = placeText(p);
  return text ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(text)}` : null;
}

// The iframe embed only understands a place query, so the owner's link is intentionally ignored.
export function embedUrl(p: Place): string | null {
  const text = placeText(p);
  return text ? `https://www.google.com/maps?q=${encodeURIComponent(text)}&output=embed` : null;
}
