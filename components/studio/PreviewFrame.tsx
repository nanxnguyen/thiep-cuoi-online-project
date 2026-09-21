import type { ReactNode } from "react";

// A phone that runs the real invitation renderer with the current draft (mode="preview": forms are shown but do not send).
export function PreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div className="phone-frame" role="region" aria-label="Xem trước thiệp trên điện thoại">
      <div className="phone-frame__screen">{children}</div>
    </div>
  );
}
