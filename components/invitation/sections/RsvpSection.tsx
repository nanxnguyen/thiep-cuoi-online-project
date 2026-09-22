import type { Content } from "@/lib/content";
import { formatDateVi } from "@/lib/datetime";
import { Reveal } from "../client/Reveal";
import { RsvpForm } from "../client/RsvpForm";

export function RsvpSection({
  content,
  slug,
  preview,
  guestName,
  guestToken,
}: {
  content: Content;
  slug?: string;
  preview: boolean;
  guestName: string;
  guestToken?: string;
}) {
  const { rsvp } = content;
  if (!rsvp.enabled) return null;
  const deadline = rsvp.deadline ? formatDateVi(rsvp.deadline) : "";
  return (
    <section className="inv-section inv-rsvp" aria-labelledby="inv-rsvp-h">
      <Reveal>
        <h2 className="inv-label" id="inv-rsvp-h">
          Xác nhận tham dự
        </h2>
        <p className="inv-lead">
          Sự hiện diện của bạn là niềm vui của chúng mình.{deadline && <> Bạn báo giúp chúng mình trước {deadline.split(", ")[1]} nhé.</>}
        </p>
        <RsvpForm slug={slug} preview={preview} guestName={guestName} guestToken={guestToken} questions={rsvp.questions} />
      </Reveal>
    </section>
  );
}
