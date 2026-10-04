import type { NewCoverFamily } from "@/lib/covers";
import { CafeCardCover } from "./cafe-card";
import { ChampagneLineCover } from "./champagne-line";
import { ChibiStoryCover } from "./chibi-story";
import { ColorBlockCover } from "./color-block";
import { ConstellationCover } from "./constellation";
import { DuotoneScriptCover } from "./duotone-script";
import { EdgeInviteCover } from "./edge-invite";
import { FloatingCardCover } from "./floating-card";
import { FloralMonogramCover } from "./floral-monogram";
import { GlasshouseCover } from "./glasshouse";
import { InkWashCover } from "./ink-wash";
import { KineticTypeCover } from "./kinetic-type";
import { LotusScrollCover } from "./lotus-scroll";
import { MidnightBloomCover } from "./midnight-bloom";
import { MonoContactCover } from "./mono-contact";
import { OctagonFrameCover } from "./octagon-frame";
import { OverlapRingsCover } from "./overlap-rings";
import { PaperCutCover } from "./paper-cut";
import { PearlArchCover } from "./pearl-arch";
import { PennantCover } from "./pennant";
import { PhoenixFoldCover } from "./phoenix-fold";
import { PorcelainBlueCover } from "./porcelain-blue";
import { PressedGardenCover } from "./pressed-garden";
import { RoseClusterCover } from "./rose-cluster";
import { RouteMapCover } from "./route-map";
import { SilkKnotCover } from "./silk-knot";
import { SplitPortraitCover } from "./split-portrait";
import { StoryJournalCover } from "./story-journal";
import { VenueSketchCover } from "./venue-sketch";
import { WhiteOrchidCover } from "./white-orchid";
import type { CoverRenderer } from "./types";
import "./heritage.css";
import "./garden.css";
import "./editorial.css";
import "./quiet-luxury.css";
import "./story.css";
import "./expressive.css";

// Exhaustive over the active NewCoverFamily union: adding a family to
// NEW_FAMILIES without a renderer here fails typecheck.
export const coverRenderers: Record<NewCoverFamily, CoverRenderer> = {
  "ink-wash": InkWashCover,
  "phoenix-fold": PhoenixFoldCover,
  "lotus-scroll": LotusScrollCover,
  "porcelain-blue": PorcelainBlueCover,
  "silk-knot": SilkKnotCover,
  "glasshouse": GlasshouseCover,
  "white-orchid": WhiteOrchidCover,
  "pressed-garden": PressedGardenCover,
  "venue-sketch": VenueSketchCover,
  "midnight-bloom": MidnightBloomCover,
  "edge-invite": EdgeInviteCover,
  "mono-contact": MonoContactCover,
  "split-portrait": SplitPortraitCover,
  "pennant": PennantCover,
  "duotone-script": DuotoneScriptCover,
  "floral-monogram": FloralMonogramCover,
  "octagon-frame": OctagonFrameCover,
  "champagne-line": ChampagneLineCover,
  "pearl-arch": PearlArchCover,
  "rose-cluster": RoseClusterCover,
  "story-journal": StoryJournalCover,
  "route-map": RouteMapCover,
  "cafe-card": CafeCardCover,
  "overlap-rings": OverlapRingsCover,
  "floating-card": FloatingCardCover,
  "kinetic-type": KineticTypeCover,
  "color-block": ColorBlockCover,
  "chibi-story": ChibiStoryCover,
  "paper-cut": PaperCutCover,
  "constellation": ConstellationCover,
};
