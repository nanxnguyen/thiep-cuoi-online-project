import type { Config } from "@netlify/functions";

// Giữ ấm production mỗi giờ: Netlify + Next, PostgREST + DB, Edge Function.
// Honeypot (website: "bot") đi hết pipeline Edge nhưng không ghi DB nên an toàn để ping.
export default async () => {
  const base = (process.env.URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
  const results: string[] = [];
  const check = async (name: string, input: RequestInfo, init?: RequestInit) => {
    try {
      const res = await fetch(input, init);
      results.push(`${name} ${res.status}`);
      return res.ok;
    } catch (err) {
      results.push(`${name} ERROR ${err instanceof Error ? err.message : err}`);
      return false;
    }
  };

  const okHome = await check("home", `${base}/`);
  const okRead = await check("public-read", `${base}/api/public/invitations/ho6my9vg`);
  const okEdge = await check("edge", `${base}/api/public/invitations/ho6my9vg/rsvp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": "keepalive-00000000-0000-0000-0000-000000000000" },
    body: JSON.stringify({ name: "keepalive", attending: true, guests: 0, note: "", answers: {}, guestLabel: "", guestToken: "", website: "bot" }),
  });

  console.log(`[keep-alive] ${results.join(" | ")}`);
  if (!okHome || !okRead || !okEdge) throw new Error(`keep-alive failed: ${results.join(" | ")}`);
  return new Response(`OK: ${results.join(" | ")}`);
};

export const config: Config = { schedule: "@hourly" };
