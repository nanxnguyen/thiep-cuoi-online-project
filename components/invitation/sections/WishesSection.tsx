import type { Content } from "@/lib/content";
import type { PublicWish } from "@/lib/api";
import { Reveal } from "../client/Reveal";
import { WishesPanel } from "../client/WishesPanel";

export function WishesSection({
  content,
  slug,
  preview,
  guestName,
  wishes,
}: {
  content: Content;
  slug?: string;
  preview: boolean;
  guestName: string;
  wishes: PublicWish[];
}) {
  if (!content.guestbook.enabled) return null;
  return (
    <section className="inv-section inv-wishsec" aria-labelledby="inv-wish-h">
      <Reveal>
        <h2 className="inv-label" id="inv-wish-h">
          Sổ lưu bút
        </h2>
        <WishesPanel slug={slug} preview={preview} guestName={guestName} initial={wishes} />
      </Reveal>
    </section>
  );
}
