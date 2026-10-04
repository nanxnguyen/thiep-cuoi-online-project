-- Invitation tiers with expiry, plus a daily hard-delete of expired rows.
-- Default tier is plus (30 days). Pro never expires (expires_at stays null).
-- NOTE: deleting storage.objects rows unlinks the files but Supabase keeps the
-- bytes in the bucket; vacuum orphaned `media/<id>/*` prefixes manually if the
-- bucket grows (see PROGRESS.md owner tasks).

alter table public.invitations
  add column tier text not null default 'plus'
    check (tier in ('free', 'plus', 'premium', 'pro')),
  add column expires_at timestamptz;

-- Existing rows get a fresh 30-day grace from push time, so the first cron run
-- never mass-deletes invitations created before tiers existed.
update public.invitations
set tier = 'plus', expires_at = now() + interval '30 days'
where expires_at is null;

create index invitations_expires_at_idx on public.invitations (expires_at)
where expires_at is not null;

create function public.invitation_expiry(p_tier text, p_from timestamptz)
returns timestamptz
language sql immutable
set search_path = ''
as $$
  select case p_tier
    when 'free' then p_from + interval '7 days'
    when 'plus' then p_from + interval '30 days'
    when 'premium' then p_from + interval '1 year'
    when 'pro' then null
  end;
$$;

create function public.apply_invitation_expiry()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.tier is distinct from old.tier then
    new.expires_at := public.invitation_expiry(new.tier, coalesce(new.created_at, now()));
  end if;
  return new;
end;
$$;

create trigger invitations_apply_expiry
before insert or update on public.invitations
for each row execute function public.apply_invitation_expiry();

create function public.purge_expired_invitations(p_before timestamptz)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed integer;
begin
  if p_before is null then raise exception 'purge cutoff is required' using errcode = '22023'; end if;
  with expired as (
    delete from public.invitations
    where expires_at is not null and expires_at < p_before
    returning id
  ),
  wiped_objects as (
    delete from storage.objects o
    using expired e
    where o.bucket_id = 'media' and o.name like e.id::text || '/%'
  )
  select count(*) into removed from expired;
  return removed;
end;
$$;

grant execute on function public.purge_expired_invitations(timestamptz) to service_role;

select cron.schedule('purge-expired-invitations', '30 3 * * *', $$select public.purge_expired_invitations(now());$$);
