begin;
select plan(12);

select has_table('public', 'templates', 'templates table exists');
select has_pk('public', 'templates', 'templates has a primary key');
select has_column('public', 'invitations', 'is_flagged', 'invitations has an is_flagged flag');
select has_index('public', 'invitations', 'invitations_flagged_idx', 'flagged invitations are indexed');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.templates'::regclass),
  'RLS is enabled on templates'
);
select has_trigger('public', 'templates', 'templates_set_updated_at', 'templates bump updated_at on change');

insert into public.templates (id, name, style, badge, pop, hidden)
values
  ('t-visible', 'Hiện', 'Hoa', '', 10, false),
  ('t-hidden', 'Ẩn', 'Hoa', 'HOT', 20, true);

set local role anon;
select is((select count(*)::integer from public.templates), 1, 'anon sees only non-hidden templates');
select is((select id from public.templates), 't-visible', 'anon sees the visible template');
select throws_ok(
  $$insert into public.templates (id, name, style) values ('t-blocked', 'Chặn', 'Hoa')$$,
  '42501',
  null,
  'anon cannot insert templates'
);
reset role;

select throws_ok(
  $$insert into public.templates (id, name, style, badge) values ('t-bad', 'Xấu', 'Hoa', 'SALE')$$,
  '23514',
  null,
  'unknown badges are rejected'
);

insert into public.invitations (id, slug, template_id, content, published, edit_key_hash)
values ('30000000-0000-0000-0000-000000000099', 'flag-default', 'song-hy', '{"v":1}', false, repeat('a', 64));
select is(
  (select is_flagged from public.invitations where slug = 'flag-default'),
  false,
  'is_flagged defaults to false'
);

-- BEFORE UPDATE trigger refreshes updated_at even when the row was stale.
insert into public.templates (id, name, style, updated_at)
values ('t-stale', 'Cũ', 'Hoa', now() - interval '1 day');
update public.templates set name = 'Mới' where id = 't-stale';
select ok(
  (select updated_at > now() - interval '1 hour' from public.templates where id = 't-stale'),
  'updating a template refreshes updated_at'
);

select * from finish();
rollback;
