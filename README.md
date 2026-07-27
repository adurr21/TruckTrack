# TruckTrack

TruckTrack is a Next.js application for recording trucking settlements, protected by Supabase Auth and Postgres RLS.

## Local setup

Use Node.js 20 or newer. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL` (usually `http://localhost:3000`). Install and verify with:

```sh
npm ci
npm run verify
```

Start development with `npm run dev`. The app expects `public.users` and `public.settlements` to be created by the migration in `supabase/migrations/`.

## Supabase configuration

Apply migrations with the Supabase CLI or dashboard. Both public tables must remain protected by RLS. Authenticated users may access only rows whose `user_id` (or profile `id`) equals `auth.uid()`. The profile trigger creates `public.users` rows from `auth.users` metadata, so signup must not insert a nullable or client-selected profile id.

Because new Supabase projects may not expose tables to the Data API automatically, the migration includes explicit grants for `authenticated` and `service_role`. Configure the production site URL and exact `/auth/callback` redirect URL in Supabase Auth. Add only the preview URL patterns your deployment needs; never use an arbitrary request origin.

## Database types and tests

With a linked local Supabase project, regenerate types with `npm run types:generate`. Review the generated file before committing it. SQL policy checks live in `supabase/tests/rls.sql`; the application unit tests cover redirect validation, CSV escaping, and input contracts.

The standard gate is `npm run verify`, which runs TypeScript, ESLint, Prettier, Vitest, and the production build. CI runs the same command on Node 20.

## Recovery smoke test

In a preview or local deployment, verify: signup with email confirmation enabled, the confirmation callback, sign-in, password reset, reset-password completion, settlement creation, CSV export, pagination, and deletion of the final row. Confirm that malformed or external `redirect_to` values land on `/protected` and that a second user cannot read or mutate the first user's settlements.

The existing `dollie_num` column name is retained for compatibility. A future rename to `dolly_num` requires a migration, regenerated types, and an export/import compatibility decision.
