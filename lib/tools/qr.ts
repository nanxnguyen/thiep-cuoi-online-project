// Builds a QR image URL from api.qrserver.com — the same free service PublishDialog.tsx already uses
// for the "share your invitation" QR, and already disclosed in /quyen-rieng-tu. No QR library added.
export function qrImageUrl(link: string, size = 480): string {
  const clamped = Math.min(1000, Math.max(120, Math.round(size)));
  return `https://api.qrserver.com/v1/create-qr-code/?size=${clamped}x${clamped}&margin=8&data=${encodeURIComponent(link)}`;
}
