create extension if not exists pgcrypto with schema extensions;

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and length(slug) <= 80),
  template_id text not null check (length(template_id) between 1 and 80),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  published boolean not null default false,
  published_at timestamptz,
  owner_id uuid references auth.users(id) on delete set null,
  edit_key_hash text not null check (edit_key_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  household text not null check (length(household) between 1 and 120),
  group_name text not null default '' check (length(group_name) <= 80),
  table_no text not null default '' check (length(table_no) <= 40),
  phone text not null default '' check (length(phone) <= 30),
  expected_pax integer not null default 1 check (expected_pax between 1 and 100),
  note text not null default '' check (length(note) <= 500),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  guest_id uuid references public.guests(id) on delete set null,
  name text not null check (length(name) between 1 and 120),
  attending boolean not null,
  guests integer not null check (guests between 0 and 100),
  note text not null default '' check (length(note) <= 1000),
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
  guest_label text not null default '' check (length(guest_label) <= 120),
  request_key text check (request_key is null or length(request_key) between 16 and 120),
  created_at timestamptz not null default now(),
  unique (invitation_id, request_key)
);

create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  name text not null check (length(name) between 1 and 120),
  message text not null check (length(message) between 1 and 1000),
  hidden boolean not null default false,
  approved boolean not null default false,
  request_key text check (request_key is null or length(request_key) between 16 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (invitation_id, request_key)
);

create table public.rate_limits (
  key text primary key check (length(key) between 1 and 200),
  window_started timestamptz not null default now(),
  count integer not null default 1 check (count > 0)
);

create index invitations_owner_updated_idx on public.invitations(owner_id, updated_at desc);
create index invitations_public_slug_idx on public.invitations(slug) where published;
create index guests_invitation_created_idx on public.guests(invitation_id, created_at);
create index rsvps_invitation_created_idx on public.rsvps(invitation_id, created_at desc);
create index rsvps_guest_created_idx on public.rsvps(guest_id, created_at desc) where guest_id is not null;
create index wishes_invitation_created_idx on public.wishes(invitation_id, created_at desc);
create index wishes_public_idx on public.wishes(invitation_id, created_at) where approved and not hidden;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger invitations_set_updated_at before update on public.invitations
for each row execute function public.set_updated_at();
create trigger guests_set_updated_at before update on public.guests
for each row execute function public.set_updated_at();
create trigger wishes_set_updated_at before update on public.wishes
for each row execute function public.set_updated_at();

create function public.consume_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
begin
  if p_key is null or p_key = '' or p_limit < 1 or p_window_seconds < 1 then
    raise exception 'invalid rate-limit arguments' using errcode = '22023';
  end if;

  insert into public.rate_limits as limits (key, window_started, count)
  values (p_key, now(), 1)
  on conflict (key) do update
  set
    count = case
      when limits.window_started <= now() - make_interval(secs => p_window_seconds) then 1
      else limits.count + 1
    end,
    window_started = case
      when limits.window_started <= now() - make_interval(secs => p_window_seconds) then now()
      else limits.window_started
    end
  returning count into current_count;

  return current_count <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

create function public.get_response_summary(p_invitation_id uuid)
returns table (attending bigint, declined bigint, headcount bigint)
language sql
stable
security definer
set search_path = public
as $$
  with latest as (
    select distinct on (coalesce('g:' || guest_id::text, 'n:' || lower(trim(name)))) attending, guests
    from public.rsvps
    where invitation_id = p_invitation_id
    order by coalesce('g:' || guest_id::text, 'n:' || lower(trim(name))), created_at desc, id desc
  )
  select count(*) filter (where attending), count(*) filter (where not attending), coalesce(sum(guests) filter (where attending), 0)
  from latest;
$$;

revoke all on function public.get_response_summary(uuid) from public, anon, authenticated;
grant execute on function public.get_response_summary(uuid) to service_role;

create function public.claim_invitation(p_id uuid, p_edit_key_hash text)
returns table (
  id uuid,
  slug text,
  template_id text,
  content jsonb,
  published boolean,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  current_owner uuid;
  stored_hash text;
begin
  if caller is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select invitations.owner_id, invitations.edit_key_hash
  into current_owner, stored_hash
  from public.invitations
  where invitations.id = p_id
  for update;

  if not found then
    raise exception 'invitation not found' using errcode = 'P0002';
  end if;
  if stored_hash <> p_edit_key_hash then
    raise exception 'invalid edit key' using errcode = '42501';
  end if;
  if current_owner is not null and current_owner <> caller then
    raise exception 'invitation already claimed' using errcode = '23505';
  end if;

  update public.invitations set owner_id = caller where invitations.id = p_id and owner_id is null;
  return query
  select invitations.id, invitations.slug, invitations.template_id, invitations.content,
    invitations.published, invitations.updated_at
  from public.invitations where invitations.id = p_id;
end;
$$;

revoke all on function public.claim_invitation(uuid, text) from public, anon;
grant execute on function public.claim_invitation(uuid, text) to authenticated;

alter table public.invitations enable row level security;
alter table public.guests enable row level security;
alter table public.rsvps enable row level security;
alter table public.wishes enable row level security;
alter table public.rate_limits enable row level security;

create policy invitations_public_read on public.invitations
for select to anon using (published);
create policy invitations_owner_read on public.invitations
for select to authenticated using (published or owner_id = auth.uid());
create policy invitations_owner_insert on public.invitations
for insert to authenticated with check (owner_id = auth.uid());
create policy invitations_owner_update on public.invitations
for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy invitations_owner_delete on public.invitations
for delete to authenticated using (owner_id = auth.uid());

create policy guests_owner_all on public.guests
for all to authenticated
using (exists (
  select 1 from public.invitations
  where invitations.id = guests.invitation_id and invitations.owner_id = auth.uid()
))
with check (exists (
  select 1 from public.invitations
  where invitations.id = guests.invitation_id and invitations.owner_id = auth.uid()
));

create policy rsvps_owner_read on public.rsvps
for select to authenticated using (exists (
  select 1 from public.invitations
  where invitations.id = rsvps.invitation_id and invitations.owner_id = auth.uid()
));

create policy wishes_public_read on public.wishes
for select to anon using (
  approved and not hidden and exists (
    select 1 from public.invitations
    where invitations.id = wishes.invitation_id and invitations.published
  )
);
create policy wishes_owner_read on public.wishes
for select to authenticated using (exists (
  select 1 from public.invitations
  where invitations.id = wishes.invitation_id and invitations.owner_id = auth.uid()
));
create policy wishes_owner_update on public.wishes
for update to authenticated
using (exists (
  select 1 from public.invitations
  where invitations.id = wishes.invitation_id and invitations.owner_id = auth.uid()
))
with check (exists (
  select 1 from public.invitations
  where invitations.id = wishes.invitation_id and invitations.owner_id = auth.uid()
));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  8388608,
  array['image/webp', 'image/jpeg', 'image/png', 'audio/mpeg']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy media_public_read on storage.objects
for select to anon, authenticated using (bucket_id = 'media');

revoke insert, update, delete on storage.objects from anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'wishes'
  ) then
    alter publication supabase_realtime add table public.wishes;
  end if;
end;
$$;
