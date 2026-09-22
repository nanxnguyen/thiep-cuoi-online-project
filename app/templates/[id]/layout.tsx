import { fontClassesFor } from "@/lib/fonts";
import { getTemplate } from "@/lib/templates";

// The preview page loads only the families of the template being previewed.
export default async function TemplatePreviewLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const template = getTemplate((await params).id);
  return <div className={template ? fontClassesFor(template) : undefined}>{children}</div>;
}
