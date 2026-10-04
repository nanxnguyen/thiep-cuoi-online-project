import Image from "next/image";

// Photo slot shared by the new covers: same contract as the legacy Slot in
// ThiepPreview (sample photo, uploaded photo, or the empty drop-zone frame).
export function CoverSlot({ photo, caption, circle, eager }: { photo?: string; caption: string; circle?: boolean; eager?: boolean }) {
  if (photo?.startsWith("/photos/"))
    return (
      <Image
        className="cv-slot cv-slot--img"
        src={photo}
        alt={caption}
        fill
        sizes="(max-width: 640px) 50vw, 400px"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        style={circle ? { borderRadius: "50%" } : undefined}
      />
    );
  if (photo) return <img className="cv-slot cv-slot--img" src={photo} alt={caption} style={circle ? { borderRadius: "50%" } : undefined} />;
  return (
    <div className="cv-slot" style={circle ? { borderRadius: "50%" } : undefined} aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
      <div className="cv-slot__cap">{caption}</div>
      <i className="cv-slot__ring" style={circle ? { borderRadius: "50%" } : undefined} />
    </div>
  );
}
