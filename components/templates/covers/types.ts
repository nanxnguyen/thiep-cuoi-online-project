import type { ReactNode } from "react";
import type { CoverDateParts } from "@/lib/covers";

export type CoverSlotFn = (index: 0 | 1 | 2, caption: string, circle?: boolean) => ReactNode;

// Props every new cover receives from ThiepPreview. Date parts are best-effort
// splits of the freeform cover date (see splitCoverDate); covers must render
// fine when any of them is empty. Colors arrive as CSS vars (--cv-deep,
// --cv-paper, --cv-gold) on the wrapping .cv-<family> element.
export type CoverProps = CoverDateParts & {
  a: string;
  b: string;
  date: string;
  place: string;
  eager: boolean;
  slot: CoverSlotFn;
};

export type CoverRenderer = (props: CoverProps) => ReactNode;
