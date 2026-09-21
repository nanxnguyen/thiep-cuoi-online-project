// Public origin of the site, used for the sitemap, canonical URLs and Open Graph. Set NEXT_PUBLIC_SITE_URL to the real
// domain. Vercel's VERCEL_PROJECT_PRODUCTION_URL is only a fallback: it exists only when the project's "Enable access to
// System Environment Variables" setting is on.
export function siteUrl(env: Record<string, string | undefined>): string {
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : "";
  return (env.NEXT_PUBLIC_SITE_URL || vercel || "http://localhost:3000").replace(/\/+$/, "");
}

export const SITE_URL = siteUrl(process.env);

// Contact address shown on the help and legal pages. Empty until the owner provides one: pages then say so instead of
// showing a placeholder.
export const CONTACT_EMAIL = (process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "").trim();

if (process.env.NODE_ENV === "production" && SITE_URL.startsWith("http://localhost")) {
  console.warn("NEXT_PUBLIC_SITE_URL is not set: sitemap, canonical and Open Graph URLs will point to localhost.");
}
