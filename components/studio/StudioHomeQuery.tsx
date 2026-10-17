"use client";

import { useSearchParams } from "next/navigation";
import { StudioHome } from "./StudioHome";

// Reads ?template=&color= in the browser so the /studio page itself stays prerendered.
export function StudioHomeQuery() {
  const sp = useSearchParams();
  return <StudioHome initialTemplate={sp.get("template") ?? undefined} initialColor={sp.get("color") ?? undefined} />;
}
