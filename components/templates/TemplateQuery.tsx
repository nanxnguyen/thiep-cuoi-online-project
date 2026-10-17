"use client";

import { useSearchParams } from "next/navigation";
import { TemplateDetailMain } from "./TemplateDetailMain";

// Reads ?color= in the browser so /templates/[id] itself stays a prerendered page.
export function TemplateQuery({ templateId }: { templateId: string }) {
  return <TemplateDetailMain templateId={templateId} color={useSearchParams().get("color")} />;
}
