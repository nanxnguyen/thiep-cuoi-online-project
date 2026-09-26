/// <reference lib="deno.ns" />
import { createClient } from "npm:@supabase/supabase-js@2.117.2";
import { handlePublicWrite, type PublicAction, type PublicWriteStore, type StoredWrite } from "../_shared/public-write.ts";

const required = (name: string) => {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

const supabase = createClient(required("SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function existing(action: PublicAction, invitationId: string, requestKey: string): Promise<StoredWrite | null> {
  const table = action === "rsvp" ? "rsvps" : "wishes";
  const columns = action === "rsvp" ? "id" : "id,name,message,created_at";
  const { data, error } = await supabase.from(table).select(columns).eq("invitation_id", invitationId).eq("request_key", requestKey).maybeSingle();
  if (error) throw error;
  return data as StoredWrite | null;
}

const store: PublicWriteStore = {
  async findPublishedInvitation(slug) {
    const { data, error } = await supabase.from("invitations").select("id,content").eq("slug", slug).eq("published", true).maybeSingle();
    if (error) throw error;
    return data;
  },
  async consumeRateLimit(key, limit, windowSeconds) {
    const { data, error } = await supabase.rpc("consume_rate_limit", { p_key: key, p_limit: limit, p_window_seconds: windowSeconds });
    if (error) throw error;
    return data === true;
  },
  async findGuestId(invitationId, tokenHash) {
    const { data, error } = await supabase.from("guests").select("id").eq("invitation_id", invitationId).eq("token_hash", tokenHash).maybeSingle();
    if (error) throw error;
    return data?.id ?? null;
  },
  findExisting: existing,
  async insertRsvp(value) {
    const { data, error } = await supabase.from("rsvps").insert(value).select("id").single();
    if (!error && data) return data;
    if (error?.code === "23505") return await existing("rsvp", String(value.invitation_id), String(value.request_key)) ?? { id: "duplicate" };
    throw error;
  },
  async insertWish(value) {
    const { data, error } = await supabase.from("wishes").insert(value).select("id,name,message,created_at").single();
    if (!error && data) return data;
    if (error?.code === "23505") return await existing("wish", String(value.invitation_id), String(value.request_key)) ?? { id: "duplicate" };
    throw error;
  },
};

Deno.serve((request) => handlePublicWrite(request, store, {
  sharedSecret: required("EDGE_SHARED_SECRET"),
  limit: Number(Deno.env.get("PUBLIC_WRITE_LIMIT") ?? 5),
  windowSeconds: Number(Deno.env.get("PUBLIC_WRITE_WINDOW_SECONDS") ?? 600),
}));
