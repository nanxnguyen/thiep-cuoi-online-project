create table public.invitation_view_events (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  visitor_hash text not null check (visitor_hash ~ '^[0-9a-f]{64}$'),
  view_day date not null default current_date,
  view_bucket bigint not null,
  created_at timestamptz not null default now(),
  unique (invitation_id, visitor_hash, view_bucket)
);

create table public.donation_transactions (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('casso', 'sepay')),
  provider_transaction_id text not null check (length(provider_transaction_id) between 1 and 160),
  amount bigint not null check (amount > 0),
  transfer_content text not null default '' check (length(transfer_content) <= 1000),
  occurred_at timestamptz not null,
  raw_payload jsonb not null default '{}'::jsonb check (octet_length(raw_payload::text) <= 65536),
  created_at timestamptz not null default now(),
  unique (provider, provider_transaction_id)
);

create index invitation_view_events_invitation_day_idx on public.invitation_view_events(invitation_id, view_day desc);
create index donation_transactions_occurred_idx on public.donation_transactions(occurred_at desc);

alter table public.invitation_view_events enable row level security;
alter table public.donation_transactions enable row level security;

create policy invitation_view_events_owner_read on public.invitation_view_events
for select to authenticated using (exists (
  select 1 from public.invitations
  where invitations.id = invitation_view_events.invitation_id and invitations.owner_id = auth.uid()
));

revoke all on public.donation_transactions from public, anon, authenticated;
grant select, insert on public.donation_transactions to service_role;

create or replace function public.get_invitation_view_summary(p_invitation_id uuid, p_days integer default 30)
returns table (views bigint, visitors bigint)
language sql stable security definer set search_path = public
as $$
  select count(*)::bigint, count(distinct visitor_hash)::bigint
  from public.invitation_view_events
  where invitation_id = p_invitation_id
    and view_day >= current_date - greatest(1, least(p_days, 365));
$$;

revoke all on function public.get_invitation_view_summary(uuid, integer) from public, anon, authenticated;
grant execute on function public.get_invitation_view_summary(uuid, integer) to authenticated, service_role;
