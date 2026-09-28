import { NextRequest, NextResponse } from "next/server";
import { normalizeDonation, recordDonation, verifyWebhookSignature, verifyWebhookToken, type DonationProvider } from "@/lib/server/donate-webhook";
import { serverEnv } from "@/lib/server/env";
import { HttpError, JSON_MAX_BYTES, readBody, routeResponse } from "@/lib/server/http";
import { createAdminClient } from "@/lib/server/supabase";

export async function POST(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  return routeResponse(request, async () => {
    const provider = (await context.params).provider as DonationProvider;
    if (provider !== "casso" && provider !== "sepay") throw new HttpError(404, "Không tìm thấy webhook.");
    const body = new TextDecoder().decode(await readBody(request, JSON_MAX_BYTES));
    const env = serverEnv();
    const secret = provider === "casso" ? env.cassoWebhookSecret : env.sepayWebhookSecret;
    const signature = request.headers.get("x-signature") ?? request.headers.get("x-webhook-signature");
    const authorization = request.headers.get("authorization") ?? "";
    const apiKey = authorization.replace(/^Apikey\s+/i, "").trim();
    const authorized = provider === "casso"
      ? verifyWebhookToken(secret ?? "", request.headers.get("secure-token"))
      : verifyWebhookToken(secret ?? "", apiKey) || await verifyWebhookSignature(body, secret ?? "", signature);
    if (!authorized) throw new HttpError(401, "Webhook signature không hợp lệ.");
    let payload: Record<string, unknown>;
    try {
      const value: unknown = JSON.parse(body);
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
      payload = value as Record<string, unknown>;
    } catch {
      throw new HttpError(400, "Payload webhook không hợp lệ.");
    }
    const transactions = provider === "casso" && Array.isArray(payload.data)
      ? payload.data
      : provider === "casso" && payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)
        ? [payload.data]
        : [payload];
    for (const transaction of transactions) {
      if (!transaction || typeof transaction !== "object" || Array.isArray(transaction)) throw new HttpError(400, "Payload giao dịch không hợp lệ.");
      await recordDonation(createAdminClient(), normalizeDonation(provider, transaction as Record<string, unknown>), payload);
    }
    return NextResponse.json({ success: true });
  });
}
