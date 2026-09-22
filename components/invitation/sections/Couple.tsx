import type { Content } from "@/lib/content";
import { Reveal } from "../client/Reveal";

export function Couple({ content }: { content: Content }) {
  const { couple } = content;
  const groom = couple.groom.name.trim();
  const bride = couple.bride.name.trim();
  return (
    <section className="inv-section inv-couple" aria-labelledby="inv-couple-h">
      <Reveal>
        <h2 className="inv-label" id="inv-couple-h">
          Lời mời
        </h2>
        {couple.message.trim() && <p className="inv-message">{couple.message}</p>}
        <div className="inv-pair">
          <div>
            <span className="inv-role">Chú rể</span>
            <span className="inv-pair__name">{groom || "—"}</span>
          </div>
          <div>
            <span className="inv-role">Cô dâu</span>
            <span className="inv-pair__name">{bride || "—"}</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
