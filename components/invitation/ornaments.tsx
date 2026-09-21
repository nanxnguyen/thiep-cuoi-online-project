import type { Archetype } from "@/lib/templates";

// Original vector artwork, drawn for MỘC. Everything is `currentColor`/CSS-variable driven so each template
// recolors it, and every SVG is decorative (aria-hidden). Motifs come from Vietnamese weddings:
// lá trầu (betel leaf, the symbol of marriage), sen (lotus) and hồi văn (the square-spiral meander).

// Heart-shaped betel leaf, notch at the origin, tip pointing up.
const LEAF = "M0 0 C -4 8 -18 14 -26 4 C -34 -8 -26 -34 -10 -54 C -6 -62 -2 -70 0 -78 C 2 -70 6 -62 10 -54 C 26 -34 34 -8 26 4 C 18 14 4 8 0 0 Z";
const VEINS = "M0 0 L0 -68 M0 -18 Q -12 -24 -19 -30 M0 -18 Q 12 -24 19 -30 M0 -38 Q -8 -42 -14 -48 M0 -38 Q 8 -42 14 -48";

function Leaf({ x, y, rotate, scale = 1 }: { x: number; y: number; rotate: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <path d={LEAF} fill="currentColor" fillOpacity=".16" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d={VEINS} fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity=".7" />
    </g>
  );
}

export function Sprig({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 260" fill="none" aria-hidden="true" focusable="false">
      <path d="M30 252 C 40 172, 84 108, 152 40" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <Leaf x={44} y={204} rotate={-38} scale={0.85} />
      <Leaf x={58} y={156} rotate={42} scale={0.8} />
      <Leaf x={84} y={118} rotate={-34} scale={0.85} />
      <Leaf x={112} y={82} rotate={40} scale={0.75} />
      <Leaf x={152} y={40} rotate={14} scale={0.7} />
    </svg>
  );
}

// Lotus in one-weight line-art: seven petals fanned from a single point, resting on two ripple lines.
export function Lotus({ className = "" }: { className?: string }) {
  const petal = "M0 0 C -11 -14 -9 -34 0 -50 C 9 -34 11 -14 0 0 Z";
  const fan: [number, number][] = [[-78, 0.66], [78, 0.66], [-54, 0.86], [54, 0.86], [-28, 1], [28, 1], [0, 1.1]];
  return (
    <svg className={className} viewBox="0 0 140 96" fill="none" aria-hidden="true" focusable="false">
      <g transform="translate(70 80)" stroke="currentColor" strokeWidth="1" strokeLinejoin="round">
        {fan.map(([a, s]) => (
          <path key={a} d={petal} transform={`rotate(${a}) scale(${s})`} />
        ))}
      </g>
      <path d="M22 86 C 46 80, 94 80, 118 86" stroke="currentColor" strokeWidth=".9" strokeLinecap="round" opacity=".7" />
      <path d="M40 90 C 58 86, 82 86, 100 90" stroke="currentColor" strokeWidth=".9" strokeLinecap="round" opacity=".45" />
    </svg>
  );
}

// Corner piece: a square spiral (hồi văn, from the Chinese 回紋), three turns, drawn for the top-left corner.
// The parent flips it with CSS for the other three.
export function HoiVanCorner({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
      <path d="M6 6 H42 V42 H14 V14 H34 V34 H22 V22 H28" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
    </svg>
  );
}

export function Monogram({ groom, bride, className = "" }: { groom: string; bride: string; className?: string }) {
  const initial = (s: string) => (s.trim()[0] ?? "").toLocaleUpperCase("vi");
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true" focusable="false">
      <circle cx="60" cy="60" r="56" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth=".7" />
      <text
        x="60"
        y="72"
        textAnchor="middle"
        fill="currentColor"
        style={{ fontFamily: "var(--inv-font-display), Georgia, serif", fontSize: 30, fontStyle: "italic", fontWeight: 500 }}
      >
        {initial(groom)} &amp; {initial(bride)}
      </text>
    </svg>
  );
}

// Arch drawn for botanical covers that have no photo yet: a double arched window with one betel-leaf branch
// growing up its middle (leaves alternate left and right, smaller towards the top).
export function Arch({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 320" fill="none" aria-hidden="true" focusable="false">
      <path d="M8 316 V120 C 8 52, 62 8, 120 8 C 178 8, 232 52, 232 120 V316 Z" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity=".06" />
      <path d="M19 316 V122 C 19 60, 67 19, 120 19 C 173 19, 221 60, 221 122 V316" stroke="currentColor" strokeWidth=".7" opacity=".55" />
      <path d="M120 308 C 116 258, 124 190, 120 104" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <Leaf x={118} y={272} rotate={-58} scale={0.8} />
      <Leaf x={122} y={242} rotate={56} scale={0.82} />
      <Leaf x={122} y={208} rotate={-52} scale={0.8} />
      <Leaf x={120} y={176} rotate={50} scale={0.74} />
      <Leaf x={120} y={148} rotate={-46} scale={0.64} />
      <Leaf x={120} y={124} rotate={44} scale={0.56} />
      <Leaf x={120} y={106} rotate={0} scale={0.66} />
    </svg>
  );
}

// Decoration around the cover text, chosen by archetype. Editorial and minimal are type-only on purpose.
export function CoverOrnament({ archetype, groom, bride, hasPhoto }: { archetype: Archetype; groom: string; bride: string; hasPhoto: boolean }) {
  switch (archetype) {
    case "classic":
      return <Monogram groom={groom} bride={bride} className="inv-orn inv-orn--monogram" />;
    case "botanical":
      return (
        <>
          <Sprig className="inv-orn inv-orn--sprig-l" />
          <Sprig className="inv-orn inv-orn--sprig-r" />
          {!hasPhoto && <Arch className="inv-orn inv-orn--arch" />}
        </>
      );
    case "traditional":
      return (
        <>
          <HoiVanCorner className="inv-orn inv-orn--corner inv-orn--tl" />
          <HoiVanCorner className="inv-orn inv-orn--corner inv-orn--tr" />
          <HoiVanCorner className="inv-orn inv-orn--corner inv-orn--bl" />
          <HoiVanCorner className="inv-orn inv-orn--corner inv-orn--br" />
          <span className="xi inv-orn inv-orn--seal" aria-hidden="true">
            囍
          </span>
          {!hasPhoto && <Lotus className="inv-orn inv-orn--lotus" />}
        </>
      );
    case "korean":
      return !hasPhoto ? <Arch className="inv-orn inv-orn--arch" /> : null;
    default:
      return null;
  }
}
