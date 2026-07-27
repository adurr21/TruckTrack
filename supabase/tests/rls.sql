-- Run with `supabase test db` after creating two authenticated test users.
-- These assertions are intentionally kept alongside the migration so policy
-- changes are reviewed with the schema. The application integration suite
-- should use two real users and verify SELECT/INSERT/UPDATE/DELETE isolation.
begin;
select plan(4);
select ok((select relrowsecurity from pg_class where oid = 'public.users'::regclass), 'users has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.settlements'::regclass), 'settlements has RLS enabled');
select ok((select count(*) from pg_policies where schemaname = 'public' and tablename = 'settlements' and policyname = 'settlements insert own') = 1, 'settlements insert policy exists');
select ok((select count(*) from pg_policies where schemaname = 'public' and tablename = 'settlements' and policyname = 'settlements delete own') = 1, 'settlements delete policy exists');
select * from finish();
rollback;

