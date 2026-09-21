import {
  Playfair_Display,
  Fraunces,
  Cormorant_Garamond,
  Newsreader,
  Noto_Serif_Display,
  Plus_Jakarta_Sans,
  Allura,
} from "next/font/google";
import type { FontKey, Template } from "./templates";

// Chosen by rendering candidates side by side with heavy Vietnamese diacritics (Nguyễn Thị Thu Hằng, ệ ẫ ộ ợ):
// every family below has a `vietnamese` subset, keeps the marks clear at display sizes, and stays readable.
// next/font needs each loader called as a module-scope const with literal options, hence this layout.
// `preload: false`: a page must not preload seven families; @font-face is only fetched for what is rendered.
const playfair = Playfair_Display({ subsets: ["latin", "vietnamese"], style: ["normal", "italic"], variable: "--font-playfair", display: "swap", preload: false });
const fraunces = Fraunces({ subsets: ["latin", "vietnamese"], style: ["normal", "italic"], variable: "--font-fraunces", display: "swap", preload: false });
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
  preload: false,
});
const newsreader = Newsreader({ subsets: ["latin", "vietnamese"], style: ["normal", "italic"], variable: "--font-newsreader", display: "swap", preload: false });
const notoDisplay = Noto_Serif_Display({ subsets: ["latin", "vietnamese"], style: ["normal", "italic"], variable: "--font-noto-display", display: "swap", preload: false });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin", "vietnamese"], variable: "--font-jakarta", display: "swap", preload: false });
const allura = Allura({ subsets: ["latin", "vietnamese"], weight: "400", variable: "--font-allura", display: "swap", preload: false });

const FONTS: Record<FontKey, { variable: string }> = { playfair, fraunces, cormorant, newsreader, notoDisplay, jakarta, allura };

const classes = (keys: Iterable<FontKey>) => [...new Set(keys)].map((k) => FONTS[k].variable).join(" ");

// className for a wrapper: only the families this template renders, so a guest downloads at most three.
export const fontClassesFor = (t: Template) => classes([t.fonts.display, t.fonts.body, ...(t.fonts.script ? [t.fonts.script] : [])]);

// For pages that show any template (gallery, Studio preview and template switcher).
export const allFontClasses = classes(Object.keys(FONTS) as FontKey[]);
