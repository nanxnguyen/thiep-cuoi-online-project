import type { CoverProps } from "./types";

// Chung Một Hành Trình — a paper city map and one dashed route through three
// pins: where they met, where they got engaged, the wedding. Map furniture is
// fixed line-art; the last (gold) pin carries the photo.
const BLOCKS: [number, number, number, number][] = [
  [4, 22, 16, 10], [26, 18, 14, 14], [62, 24, 16, 12], [82, 30, 14, 9], [6, 56, 14, 12],
  [78, 54, 16, 12], [8, 92, 14, 10], [80, 90, 14, 12], [30, 100, 14, 9], [66, 104, 12, 10],
];

function Pin({ x, y, label, n }: { x: number; y: number; label: string; n: number }) {
  return (
    <g className={`cv-route-map__pin cv-route-map__pin--${n}`} transform={`translate(${x} ${y})`}>
      <g className="cv-route-map__pinbody">
        <path d="M0 0C-6-7-7.5-12-7.5-15A7.5 7.5 0 1 1 7.5-15C7.5-12 6-7 0 0Z" fill="var(--cv-deep)" />
        <circle cy="-15" r="2.8" fill="var(--cv-paper)" />
        <rect x="-15" y="2.5" width="30" height="6.4" rx="1.2" fill="var(--cv-paper)" stroke="var(--cv-deep)" strokeWidth="0.35" />
        <text x="0" y="7" textAnchor="middle" fontSize="3" fill="var(--cv-deep)" letterSpacing="0.12">
          {label}
        </text>
      </g>
    </g>
  );
}

export function RouteMapCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-route-map">
      <svg className="cv-route-map__map" viewBox="0 0 100 178" aria-hidden="true">
        <rect width="100" height="178" fill="color-mix(in srgb, var(--cv-gold) 12%, var(--cv-paper))" />
        <path d="M-4 66C22 52 34 82 56 70S90 54 104 66" fill="none" stroke="color-mix(in srgb, var(--cv-gold) 45%, var(--cv-paper))" strokeWidth="8" strokeLinecap="round" />
        <path d="M-4 66C22 52 34 82 56 70S90 54 104 66" fill="none" stroke="var(--cv-paper)" strokeWidth="0.6" strokeDasharray="3 3" />
        {BLOCKS.map(([x, y, w, h]) => (
          <g key={`${x}-${y}`} fill="var(--cv-paper)" stroke="var(--cv-deep)" strokeOpacity="0.28" strokeWidth="0.35">
            <rect x={x} y={y} width={w} height={h} rx="0.8" />
            <path d={`M${x + 2} ${y + 2}H${x + w - 2}M${x + 2} ${y + h / 2}H${x + w - 2}`} />
          </g>
        ))}
        <path
          className="cv-route-map__route"
          pathLength="1"
          d="M24 40C54 34 76 48 62 64S20 74 30 92S66 98 66 112"
          fill="none"
          stroke="var(--cv-deep)"
          strokeWidth="1.2"
          strokeDasharray="0.02 0.014"
          strokeLinecap="round"
        />
        <Pin x={24} y={40} label="NƠI GẶP NHAU" n={1} />
        <Pin x={62} y={64} label="LỜI CẦU HÔN" n={2} />
        <g transform="translate(88 12)" fill="none" stroke="var(--cv-deep)" strokeWidth="0.5">
          <circle r="5.5" />
          <path d="M0-6.5V6.5M-6.5 0H6.5" />
          <path d="M0-4.5l1.4 4.5L0 4.5l-1.4-4.5Z" fill="var(--cv-deep)" />
        </g>
      </svg>
      <div className="cv-route-map__stop">
        <div className="cv-route-map__photo">{slot(0, "Mẫu thiệp cưới Chung Một Hành Trình phong cách tuyến đường", true)}</div>
        <span className="cv-route-map__flag">NGÀY CƯỚI</span>
      </div>
      <div className="cv-route-map__card">
        <span className="cv-route-map__code">{date}</span>
        <p className="cv-names cv-route-map__names">
          {b} &amp; {a}
        </p>
        {place && <p className="cv-place cv-route-map__place">{place}</p>}
      </div>
    </div>
  );
}
