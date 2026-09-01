-- CK Sushi CRM MVP — execute uma vez no SQL Editor do Supabase.
create extension if not exists pgcrypto;

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now()
);

create table if not exists public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  full_name text,
  role text not null default 'staff' check (role in ('owner','manager','staff')),
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  phone text not null,
  birth_date date,
  birth_consent_at timestamptz,
  last_visit_at timestamptz,
  visit_count integer not null default 0 check (visit_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, phone)
);

create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  is_open boolean not null default true,
  opens_at time,
  closes_at time,
  capacity integer not null default 42 check (capacity > 0),
  unique (restaurant_id, weekday)
);

create table if not exists public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  blocked_date date not null,
  reason text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (restaurant_id, blocked_date)
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  reservation_date date not null,
  reservation_time time not null,
  party_size integer not null check (party_size between 1 and 30),
  status text not null default 'new' check (status in ('new','confirmed','completed','cancelled','no_show')),
  source text not null default 'website' check (source in ('website','admin','whatsapp','phone')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  reservation_id uuid references public.reservations(id) on delete set null,
  visited_at timestamptz not null default now(),
  party_size integer check (party_size > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  consent_type text not null check (consent_type in ('birthday_whatsapp','marketing_whatsapp')),
  granted boolean not null,
  source text not null default 'website',
  recorded_at timestamptz not null default now()
);

create index if not exists idx_reservations_restaurant_date on public.reservations(restaurant_id, reservation_date, reservation_time);
create index if not exists idx_reservations_open_status on public.reservations(restaurant_id, status) where status in ('new','confirmed');
create index if not exists idx_customers_last_visit on public.customers(restaurant_id, last_visit_at);
create index if not exists idx_visits_customer on public.visits(customer_id, visited_at desc);

insert into public.restaurants (id, name, phone)
values ('00000000-0000-4000-8000-000000000001', 'CK Sushi', '+5515991843232')
on conflict (id) do update set name = excluded.name, phone = excluded.phone;

insert into public.availability_rules (restaurant_id, weekday, is_open, opens_at, closes_at, capacity)
select '00000000-0000-4000-8000-000000000001', weekday, weekday <> 1,
       case when weekday = 1 then null else time '18:30' end,
       case when weekday = 1 then null else time '23:00' end, 42
from generate_series(0, 6) as weekday
on conflict (restaurant_id, weekday) do update
set is_open = excluded.is_open, opens_at = excluded.opens_at, closes_at = excluded.closes_at;

create or replace function public.is_ck_staff(target_restaurant uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.staff_profiles where user_id = auth.uid() and restaurant_id = target_restaurant); $$;

create or replace function public.request_ck_reservation(
  customer_name text,
  customer_phone text,
  requested_date date,
  requested_time time,
  requested_party_size integer,
  customer_birth_date date default null,
  birthday_consent boolean default false
) returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  rid constant uuid := '00000000-0000-4000-8000-000000000001';
  customer_uuid uuid;
  reservation_uuid uuid;
  normalized_phone text;
  day_rule public.availability_rules%rowtype;
  occupied integer;
begin
  normalized_phone := regexp_replace(customer_phone, '[^0-9]', '', 'g');
  if length(trim(customer_name)) < 2 then raise exception 'Nome inválido'; end if;
  if length(normalized_phone) < 10 then raise exception 'Telefone inválido'; end if;
  if requested_date < current_date then raise exception 'Data inválida'; end if;
  if requested_party_size < 1 or requested_party_size > 30 then raise exception 'Quantidade inválida'; end if;
  if customer_birth_date is not null and not birthday_consent then raise exception 'Consentimento necessário'; end if;
  if customer_birth_date is not null and customer_birth_date > current_date then raise exception 'Nascimento inválido'; end if;

  select * into day_rule from public.availability_rules where restaurant_id = rid and weekday = extract(dow from requested_date)::smallint;
  if day_rule.id is null or not day_rule.is_open then raise exception 'Restaurante fechado nesta data'; end if;
  if requested_time < day_rule.opens_at or requested_time > day_rule.closes_at then raise exception 'Horário indisponível'; end if;
  if exists(select 1 from public.blocked_dates where restaurant_id = rid and blocked_date = requested_date) then raise exception 'Data bloqueada'; end if;

  select coalesce(sum(party_size), 0) into occupied from public.reservations
  where restaurant_id = rid and reservation_date = requested_date and status in ('new','confirmed');
  if occupied + requested_party_size > day_rule.capacity then raise exception 'Capacidade esgotada'; end if;

  insert into public.customers (restaurant_id, name, phone, birth_date, birth_consent_at)
  values (rid, trim(customer_name), normalized_phone, case when birthday_consent then customer_birth_date end, case when birthday_consent then now() end)
  on conflict (restaurant_id, phone) do update set
    name = excluded.name,
    birth_date = coalesce(excluded.birth_date, public.customers.birth_date),
    birth_consent_at = coalesce(excluded.birth_consent_at, public.customers.birth_consent_at),
    updated_at = now()
  returning id into customer_uuid;

  if birthday_consent then
    insert into public.consents (restaurant_id, customer_id, consent_type, granted)
    values (rid, customer_uuid, 'birthday_whatsapp', true);
  end if;

  insert into public.reservations (restaurant_id, customer_id, reservation_date, reservation_time, party_size)
  values (rid, customer_uuid, requested_date, requested_time, requested_party_size)
  returning id into reservation_uuid;
  return reservation_uuid;
end;
$$;

alter table public.restaurants enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.customers enable row level security;
alter table public.availability_rules enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.reservations enable row level security;
alter table public.visits enable row level security;
alter table public.consents enable row level security;

drop policy if exists "public restaurant info" on public.restaurants;
create policy "public restaurant info" on public.restaurants for select using (id = '00000000-0000-4000-8000-000000000001');
drop policy if exists "public availability" on public.availability_rules;
create policy "public availability" on public.availability_rules for select using (restaurant_id = '00000000-0000-4000-8000-000000000001');
drop policy if exists "public blocked dates" on public.blocked_dates;
create policy "public blocked dates" on public.blocked_dates for select using (restaurant_id = '00000000-0000-4000-8000-000000000001');
drop policy if exists "staff own profile" on public.staff_profiles;
create policy "staff own profile" on public.staff_profiles for select to authenticated using (user_id = auth.uid());

drop policy if exists "staff customers" on public.customers;
create policy "staff customers" on public.customers for all to authenticated using (public.is_ck_staff(restaurant_id)) with check (public.is_ck_staff(restaurant_id));
drop policy if exists "staff reservations" on public.reservations;
create policy "staff reservations" on public.reservations for all to authenticated using (public.is_ck_staff(restaurant_id)) with check (public.is_ck_staff(restaurant_id));
drop policy if exists "staff availability" on public.availability_rules;
create policy "staff availability" on public.availability_rules for all to authenticated using (public.is_ck_staff(restaurant_id)) with check (public.is_ck_staff(restaurant_id));
drop policy if exists "staff blocked dates" on public.blocked_dates;
create policy "staff blocked dates" on public.blocked_dates for all to authenticated using (public.is_ck_staff(restaurant_id)) with check (public.is_ck_staff(restaurant_id));
drop policy if exists "staff visits" on public.visits;
create policy "staff visits" on public.visits for all to authenticated using (public.is_ck_staff(restaurant_id)) with check (public.is_ck_staff(restaurant_id));
drop policy if exists "staff consents" on public.consents;
create policy "staff consents" on public.consents for select to authenticated using (public.is_ck_staff(restaurant_id));

revoke all on function public.request_ck_reservation(text,text,date,time,integer,date,boolean) from public;
grant execute on function public.request_ck_reservation(text,text,date,time,integer,date,boolean) to anon, authenticated;
select pg_catalog.set_config('search_path', 'public', false);
analyze;
