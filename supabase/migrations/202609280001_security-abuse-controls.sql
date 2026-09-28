create index rate_limits_window_started_idx on public.rate_limits(window_started);

create function public.purge_rate_limits(p_before timestamptz)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed integer;
begin
  if p_before is null then raise exception 'purge cutoff is required' using errcode = '22023'; end if;
  delete from public.rate_limits where window_started < p_before;
  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function public.purge_rate_limits(timestamptz) from public, anon, authenticated;
grant execute on function public.purge_rate_limits(timestamptz) to service_role;

select cron.schedule('purge-rate-limits', '15 3 * * *', $$select public.purge_rate_limits(now() - interval '24 hours');$$);
