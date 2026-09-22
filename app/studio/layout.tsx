import { allFontClasses } from "@/lib/fonts";
import "@/components/studio/studio.css";

// The Studio can show any template, so it loads all template families (only the ones on screen are downloaded).
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <div className={allFontClasses}>{children}</div>;
}
