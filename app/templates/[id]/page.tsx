import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { sampleContent } from "@/lib/content";
import { getTemplate, templates } from "@/lib/templates";

export function generateStaticParams() {
  return templates.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const template = getTemplate((await params).id);
  if (!template) return {};
  return {
    title: `Mẫu ${template.name}`,
    description: template.blurb,
    alternates: { canonical: `/templates/${template.id}` },
  };
}

// `?gate=1` shows the opening envelope, `?to=Tên` shows how the greeting reads for a named guest.
export default async function TemplatePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gate?: string; to?: string }>;
}) {
  const template = getTemplate((await params).id);
  if (!template) notFound();
  const { gate, to } = await searchParams;

  return (
    <>
      <div className="preview-bar">
        <Link href="/templates">← Tất cả mẫu</Link>
        <strong>{template.name}</strong>
        <span className="preview-bar__actions">
          <Link href={gate === "1" ? `/templates/${template.id}` : `/templates/${template.id}?gate=1&to=${encodeURIComponent("Chú Ba")}`}>
            {gate === "1" ? "Bỏ phong bì" : "Xem phong bì"}
          </Link>
          <Link className="nav-cta" href={`/studio?template=${template.id}`}>
            Dùng mẫu này →
          </Link>
        </span>
      </div>
      <InvitationRenderer
        mode="preview"
        gate={gate === "1"}
        guestName={to?.slice(0, 80)}
        template={template}
        content={sampleContent()}
      />
    </>
  );
}
