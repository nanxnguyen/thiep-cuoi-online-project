import Link from "next/link";
import type { Content } from "@/lib/content";
import { Reveal } from "../client/Reveal";

export function Thanks({ content }: { content: Content }) {
  const { thanks, couple } = content;
  return (
    <footer className="inv-section inv-thanks">
      <Reveal>
        {thanks.message.trim() && <p className="inv-thanks__msg">{thanks.message}</p>}
        <p className="inv-thanks__names">
          {couple.groom.name.trim() || "Chú rể"} &amp; {couple.bride.name.trim() || "Cô dâu"}
        </p>
        <p className="inv-credit">
          Thiệp được tạo bằng <Link href="/">MỘC</Link>
        </p>
      </Reveal>
    </footer>
  );
}
