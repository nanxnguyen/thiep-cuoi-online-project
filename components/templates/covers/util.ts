/** First letter of a name, upper-cased with Vietnamese rules ("đức" → "Đ"). Empty when the name is empty. */
export const initial = (name: string): string => [...name.trim()][0]?.toLocaleUpperCase("vi") ?? "";

/** Points of a regular polygon as an SVG points string. */
export const polygonPoints = (cx: number, cy: number, r: number, n: number, startDeg = -90): string =>
  Array.from({ length: n }, (_, i) => {
    const t = ((startDeg + (360 / n) * i) * Math.PI) / 180;
    return `${(cx + r * Math.cos(t)).toFixed(2)},${(cy + r * Math.sin(t)).toFixed(2)}`;
  }).join(" ");

/** Round to 2 decimals. Trig-derived SVG numbers must be rounded: float tails differ between server and client and break hydration. */
export const r2 = (n: number): number => Math.round(n * 100) / 100;
