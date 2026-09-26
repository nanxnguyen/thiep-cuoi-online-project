"use client";

import { createBrowserClient } from "@supabase/ssr";

type Channel = {
  on(type: "postgres_changes", filter: Record<string, string>, callback: () => void): Channel;
  subscribe(): Channel;
};
type RealtimeClient = { channel(name: string): Channel; removeChannel(channel: Channel): unknown };

let browser: RealtimeClient | undefined;

function browserClient(): RealtimeClient {
  if (!browser) browser = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  ) as unknown as RealtimeClient;
  return browser;
}

export function subscribeToWishes(invitationId: string, onChange: () => void, client: RealtimeClient = browserClient()) {
  const channel = client.channel(`wishes:${invitationId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "wishes", filter: `invitation_id=eq.${invitationId}` }, onChange)
    .subscribe();
  return () => { void client.removeChannel(channel); };
}
