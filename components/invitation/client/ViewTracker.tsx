"use client";

import { useEffect } from "react";

export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const body = new Blob(["{}"], { type: "application/json" });
    navigator.sendBeacon(`/api/public/invitations/${encodeURIComponent(slug)}/view`, body);
  }, [slug]);
  return null;
}
