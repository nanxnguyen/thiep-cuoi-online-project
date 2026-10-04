import type { CoverProps } from "./types";

// Chung Một Hành Trình — a paper city map and one dashed route through three
// pins: where they met, where they got engaged, the wedding. Map furniture is a
// fixed list of blocks, a river and a park; the last pin carries the photo.
const BLOCKS: [number, number, number, number][] = [
  [4, 14, 18, 10], [26, 10, 14, 14], [60, 12, 16, 12], [80, 16, 16, 9], [8, 40, 14, 12], [28, 44, 12, 9],
  [72, 40, 20, 12], [6, 70, 16, 12], [30, 74, 18, 10], [74, 72, 18, 14], [10, 104, 20, 10], [66, 108, 24, 12],
];

function Pin({ x, y, label, flip }: { x: number; y: number; label: string; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0C-5-6-6-11-6-14A6 6 0 1 1 6-14C6-11 5-6 0 0Z" fill="var(--cv-deep)" />
      <circle cy="-14" r="2.2" fill="var(--cv-paper)" />
      <rect x={flip ? -34 : 9} y="-19" width="25" height="7.2" rx="1.2" fill="var(--cv-paper)" stroke="var(--cv-deep)" strokeWidth="0.35" />
      <text x={flip ? -21.5 : 21.5} y="-14.2" textAnchor="middle" fontSize="2.6" fill="var(--cv-deep)" letterSpacing="0.1">
        {label}
      </text>
    </g>
  );
}

export function RouteMapCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-route-map">
      <svg className="cv-route-map__map" viewBox="0 0 100 178" aria-hidden="true">
        <rect width="100" height="178" fill="color-mix(in srgb, var(--cv-deep) 8%, var(--cv-paper))" />
        <path d="M-4 80C20 70 34 92 56 82S92 64 104 76" fill="none" stroke="color-mix(in srgb, var(--cv-deep) 22%, var(--cv-paper))" strokeWidth="9" strokeLinecap="round" />
        <ellipse cx="82" cy="140" rx="14" ry="9" fill="color-mix(in srgb, var(--cv-gold) 38%, var(--cv-paper))" />
        {BLOCKS.map(([x, y, w, h]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="1" fill="var(--cv-paper)" stroke="var(--cv-deep)" strokeOpacity="0.2" strokeWidth="0.3" />
        ))}
        <path className="cv-route-map__route" d="M22 112C34 100 20 92 40 86S70 90 70 76S58 62 52 50" fill="none" stroke="var(--cv-deep)" strokeWidth="1.1" strokeDasharray="2.4 2" strokeLinecap="round" />
        <Pin x={22} y={112} label="NƠI GẶP NHAU" />
        <Pin x={70} y={76} label="LỜI CẦU HÔN" flip />
        <g transform="translate(86 20)" fill="none" stroke="var(--cv-deep)" strokeWidth="0.5">
          <circle r="6" />
          <path d="M0-7V7M-7 0H7" />
          <path d="M0-5l1.6 5L0 5l-1.6-5Z" fill="var(--cv-deep)" />
        </g>
      </svg>
      <div className="cv-route-map__stop">
        <div className="cv-route-map__photo">{slot(0, "Ảnh cưới", true)}</div>
        <span className="cv-route-map__flag">NGÀY CƯỚI</span>
      </div>
      <div className="cv-route-map__card">
        <p className="cv-names cv-route-map__names">
          {b} &amp; {a}
        </p>
        <p className="cv-date cv-route-map__date">{date}</p>
        {place && <p className="cv-place cv-route-map__place">{place}</p>}
      </div>
    </div>
  );
}
