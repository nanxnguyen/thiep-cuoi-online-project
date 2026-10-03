-- Custom invitation design requests submitted from /thiet-ke-thiep-rieng. Server-only: the route handler inserts
-- with the service-role key, the owner reads them in the Supabase dashboard. No policies, so anon/authenticated
-- clients cannot touch the table.
create table public.design_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 80),
  phone text not null check (length(phone) between 8 and 30),
  email text not null default '' check (length(email) <= 120),
  wedding_date date,
  budget text not null default '' check (length(budget) <= 40),
  details text not null check (length(details) between 10 and 2000),
  reference_links text not null default '' check (length(reference_links) <= 1000),
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'done', 'declined')),
  created_at timestamptz not null default now()
);

create index design_requests_created_idx on public.design_requests(created_at desc);

alter table public.design_requests enable row level security;

revoke all on public.design_requests from public, anon, authenticated;
grant select, insert, update on public.design_requests to service_role;
