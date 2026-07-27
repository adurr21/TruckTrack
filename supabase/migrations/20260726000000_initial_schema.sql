create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.settlements (
  sheet_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  truck_num text not null,
  dollie_num text not null,
  "to" text not null,
  "from" text not null,
  pro_no text not null,
  trailer_num text not null,
  paysheet_num text not null,
  pay numeric(12, 2) not null check (pay <> 'NaN'::numeric),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.users (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do update set name = excluded.name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.users enable row level security;
alter table public.settlements enable row level security;

drop policy if exists "users select own profile" on public.users;
create policy "users select own profile" on public.users for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "users insert own profile" on public.users;
create policy "users insert own profile" on public.users for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "users update own profile" on public.users;
create policy "users update own profile" on public.users for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
drop policy if exists "users delete own profile" on public.users;
create policy "users delete own profile" on public.users for delete to authenticated using ((select auth.uid()) = id);

drop policy if exists "settlements select own" on public.settlements;
create policy "settlements select own" on public.settlements for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "settlements insert own" on public.settlements;
create policy "settlements insert own" on public.settlements for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "settlements update own" on public.settlements;
create policy "settlements update own" on public.settlements for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "settlements delete own" on public.settlements;
create policy "settlements delete own" on public.settlements for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.users to authenticated;
grant select, insert, update, delete on public.settlements to authenticated;
grant all on public.users, public.settlements to service_role;
