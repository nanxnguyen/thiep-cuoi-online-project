import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { api } from "@/lib/api";
import { earliestEvent, formatDateVi } from "@/lib/datetime";
import { fontClassesFor } from "@/lib/fonts";
import { resolveLocale } from "@/lib/i18n";
import { isValidSlug } from "@/lib/slug";
import { SITE_URL } from "@/lib/site";
import { DEFAULT_TEMPLATE_ID, getTemplate } from "@/lib/templates";

// Guests must always see the latest version of the invitation, so nothing here is cached.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ to?: string; g?: string; lang?: string }> };

// generateMetadata and the page both need the invitation: one backend call per request.
const load = cache(async (slug: string) => (isValidSlug(slug) ? api.getPublicInvitation(slug) : null));

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const sp = await searchParams;
  const dto = await load(slug);
  if (!dto) return { title: "Không tìm thấy thiệp", robots: { index: false, follow: false } };
  const { couple, events } = dto.content;
  const groom = couple.groom.name.trim() || "Chú rể";
  const bride = couple.bride.name.trim() || "Cô dâu";
  const main = earliestEvent(events);
  const when = main ? ` vào ${formatDateVi(main.date)}` : "";
  const title = `Thiệp cưới ${groom} & ${bride}`;
  const description = `Trân trọng kính mời bạn đến dự lễ cưới của ${groom} và ${bride}${when}.`;
  const path = `/invite/${encodeURIComponent(slug)}`;
  const query = (lang: string) => {
    const url = new URL(`${SITE_URL}${path}`);
    if (sp.to) url.searchParams.set("to", sp.to);
    if (sp.g) url.searchParams.set("g", sp.g);
    url.searchParams.set("lang", lang);
    return url.toString();
  };
  return {
    title,
    description,
    // openGraph replaces the layout's whole object (no merging), so it repeats the description for Zalo/Facebook previews.
    openGraph: { type: "website", locale: "vi_VN", siteName: "MỘC Wedding", title, description, images: couple.heroPhoto ? [couple.heroPhoto] : undefined },
    robots: { index: false, follow: false },
    alternates: { languages: { vi: query("vi"), en: query("en") } },
  };
}

// Link cá nhân ?g=token (Phase 3) thắng ?to= thủ công khi cả hai có mặt; token sai/hết hạn/lỗi mạng
// không được làm vỡ cả trang khách, nên mọi lỗi ở đây đều rơi về "không có tên khách", không throw.
async function resolveGuest(slug: string, g?: string): Promise<{ name: string; token: string }> {
  if (!g) return { name: "", token: "" };
  try {
    const household = await api.resolveGuestToken(slug, g);
    return household ? { name: household, token: g } : { name: "", token: "" };
  } catch {
    return { name: "", token: "" };
  }
}

export default async function InvitePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  // Chạy song song: resolveGuest chỉ cần slug từ URL (không cần đợi load() trả về) — gộp lại thành 1 RTT
  // thay vì 2 nối tiếp, quan trọng vì đây đúng là loại link (?g=) mà khách mở trên điện thoại.
  const [dto, guest] = await Promise.all([load(slug), resolveGuest(slug, sp.g)]);
  if (!dto) notFound();
  const template = getTemplate(dto.templateId) ?? getTemplate(DEFAULT_TEMPLATE_ID)!;
  const to = sp.to?.trim().slice(0, 80) ?? "";
  const guestName = guest.name || to;
  const locale = resolveLocale(sp.lang);
  const toggleParams = new URLSearchParams();
  if (to) toggleParams.set("to", to);
  if (sp.g) toggleParams.set("g", sp.g);
  toggleParams.set("lang", locale === "en" ? "vi" : "en");
  const toggleHref = `?${toggleParams.toString()}`;

  return (
    <div className={fontClassesFor(template)}>
      <InvitationRenderer
        mode="live"
        slug={dto.slug}
        template={template}
        content={dto.content}
        wishes={dto.wishes}
        guestName={guestName}
        guestToken={guest.token}
        locale={locale}
        toggleHref={toggleHref}
      />
    </div>
  );
}
