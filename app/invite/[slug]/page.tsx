import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { api } from "@/lib/api";
import { earliestEvent, formatDateVi } from "@/lib/datetime";
import { fontClassesFor } from "@/lib/fonts";
import { isValidSlug } from "@/lib/slug";
import { DEFAULT_TEMPLATE_ID, getTemplate } from "@/lib/templates";

// Guests must always see the latest version of the invitation, so nothing here is cached.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ to?: string }> };

// generateMetadata and the page both need the invitation: one backend call per request.
const load = cache(async (slug: string) => (isValidSlug(slug) ? api.getPublicInvitation(slug) : null));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dto = await load((await params).slug);
  if (!dto) return { title: "Không tìm thấy thiệp", robots: { index: false, follow: false } };
  const { couple, events } = dto.content;
  const groom = couple.groom.name.trim() || "Chú rể";
  const bride = couple.bride.name.trim() || "Cô dâu";
  const main = earliestEvent(events);
  const when = main ? ` vào ${formatDateVi(main.date)}` : "";
  const title = `Thiệp cưới ${groom} & ${bride}`;
  const description = `Trân trọng kính mời bạn đến dự lễ cưới của ${groom} và ${bride}${when}.`;
  return {
    title,
    description,
    // openGraph replaces the layout's whole object (no merging), so it repeats the description for Zalo/Facebook previews.
    openGraph: { type: "website", locale: "vi_VN", siteName: "MỘC Wedding", title, description, images: couple.heroPhoto ? [couple.heroPhoto] : undefined },
    robots: { index: false, follow: false },
  };
}

export default async function InvitePage({ params, searchParams }: Props) {
  const dto = await load((await params).slug);
  if (!dto) notFound();
  const template = getTemplate(dto.templateId) ?? getTemplate(DEFAULT_TEMPLATE_ID)!;
  const to = (await searchParams).to?.trim().slice(0, 80) ?? "";

  return (
    <div className={fontClassesFor(template)}>
      <InvitationRenderer mode="live" slug={dto.slug} template={template} content={dto.content} wishes={dto.wishes} guestName={to} />
    </div>
  );
}
