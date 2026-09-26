begin;
select plan(20);

select tables_are(
  'public',
  array['guests', 'invitations', 'rate_limits', 'rsvps', 'wishes'],
  'backend tables exist'
);
select has_pk('public', 'invitations', 'invitations has a primary key');
select has_index('public', 'invitations', 'invitations_slug_key', 'slug is unique');
select ok(
  (select bool_and(relrowsecurity) from pg_class where oid in (
    'public.invitations'::regclass,
    'public.guests'::regclass,
    'public.rsvps'::regclass,
    'public.wishes'::regclass,
    'public.rate_limits'::regclass
  )),
  'RLS is enabled on every backend table'
);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'one@example.com', '', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'two@example.com', '', now(), now());

insert into public.invitations (id, slug, template_id, content, published, owner_id, edit_key_hash)
values
  ('30000000-0000-0000-0000-000000000001', 'public-one', 'song-hy', '{"v":1}', true, '10000000-0000-0000-0000-000000000001', repeat('a', 64)),
  ('30000000-0000-0000-0000-000000000002', 'draft-one', 'song-hy', '{"v":1}', false, '10000000-0000-0000-0000-000000000001', repeat('b', 64)),
  ('30000000-0000-0000-0000-000000000003', 'draft-two', 'song-hy', '{"v":1}', false, '20000000-0000-0000-0000-000000000002', repeat('c', 64)),
  ('30000000-0000-0000-0000-000000000004', 'unowned', 'song-hy', '{"v":1}', false, null, repeat('d', 64));

select has_function('public', 'claim_invitation', array['uuid', 'text'], 'claim RPC exists');
set local role authenticated;
set local request.jwt.claims = '{"sub":"20000000-0000-0000-0000-000000000002","role":"authenticated"}';
select is(
  (select id from public.claim_invitation('30000000-0000-0000-0000-000000000004', repeat('d', 64))),
  '30000000-0000-0000-0000-000000000004'::uuid,
  'a valid edit key claims an unowned invitation'
);
reset role;
select is(
  (select owner_id from public.invitations where id = '30000000-0000-0000-0000-000000000004'),
  '20000000-0000-0000-0000-000000000002'::uuid,
  'claim stores the authenticated owner atomically'
);

set local role anon;
select is((select count(*)::integer from public.invitations), 1, 'anon sees published invitations only');
select throws_ok(
  $$insert into public.invitations (slug, template_id, content, edit_key_hash) values ('blocked', 'x', '{}', repeat('d', 64))$$,
  '42501',
  null,
  'anon cannot insert invitations'
);
select throws_ok(
  $$insert into public.rsvps (invitation_id, name, attending, guests) values ('30000000-0000-0000-0000-000000000001', 'Bot', true, 1)$$,
  '42501',
  null,
  'anon cannot insert RSVP rows directly'
);

set local role authenticated;
set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}';
select is((select count(*)::integer from public.invitations), 2, 'owner sees own draft and published rows only');

reset role;
select throws_ok(
  $$insert into public.invitations (slug, template_id, content, edit_key_hash) values ('public-one', 'x', '{}', repeat('d', 64))$$,
  '23505',
  null,
  'duplicate slugs are rejected'
);

insert into public.guests (id, invitation_id, household, token_hash)
values ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'Nhà An', repeat('e', 64));
select throws_ok(
  $$insert into public.guests (invitation_id, household, token_hash) values ('30000000-0000-0000-0000-000000000001', 'Nhà Bình', repeat('e', 64))$$,
  '23505',
  null,
  'guest token hashes are unique'
);

insert into public.wishes (invitation_id, name, message, approved, hidden)
values
  ('30000000-0000-0000-0000-000000000001', 'A', 'Visible', true, false),
  ('30000000-0000-0000-0000-000000000001', 'B', 'Pending', false, false),
  ('30000000-0000-0000-0000-000000000001', 'C', 'Hidden', true, true);
set local role anon;
select is((select count(*)::integer from public.wishes), 1, 'anon sees only approved visible wishes');
reset role;

delete from public.invitations where id = '30000000-0000-0000-0000-000000000002';
select is((select count(*)::integer from public.guests where invitation_id = '30000000-0000-0000-0000-000000000002'), 0, 'child rows cascade on invitation deletion');

select ok(public.consume_rate_limit('wish:test', 2, 60), 'first request is allowed');
select ok(public.consume_rate_limit('wish:test', 2, 60), 'request at the limit is allowed');
select is(public.consume_rate_limit('wish:test', 2, 60), false, 'request over the limit is denied atomically');

select has_function('public', 'get_response_summary', array['uuid'], 'response summary RPC exists');
insert into public.rsvps (id, invitation_id, name, attending, guests, created_at)
values
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Lan', true, 2, '2026-09-26 01:00:00+00'),
  ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', ' lan ', false, 0, '2026-09-26 02:00:00+00'),
  ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Mai', true, 3, '2026-09-26 03:00:00+00');
select is(
  (select format('%s,%s,%s', attending, declined, headcount) from public.get_response_summary('30000000-0000-0000-0000-000000000001')),
  '1,1,3',
  'response summary counts only the latest RSVP per normalized guest'
);

select * from finish();
rollback;
