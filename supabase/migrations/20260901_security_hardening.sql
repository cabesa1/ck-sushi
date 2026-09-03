-- CK Sushi: endurecimento de segurança, papéis e bloqueios persistentes.

create table if not exists public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  blocked_date date not null,
  blocked_time time not null,
  reason text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (restaurant_id, blocked_date, blocked_time)
);

alter table public.blocked_slots enable row level security;
revoke all on table public.blocked_slots from anon;
grant select, insert, update, delete on table public.blocked_slots to authenticated;

create or replace function public.ck_has_role(target_restaurant uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_profiles
    where user_id = auth.uid()
      and restaurant_id = target_restaurant
      and role = any(allowed_roles)
  );
$$;

revoke all on function public.ck_has_role(uuid, text[]) from public, anon;
grant execute on function public.ck_has_role(uuid, text[]) to authenticated;
revoke all on function public.is_ck_staff(uuid) from public, anon;
grant execute on function public.is_ck_staff(uuid) to authenticated;

drop policy if exists "staff blocked slots read" on public.blocked_slots;
create policy "staff blocked slots read" on public.blocked_slots
for select to authenticated
using (public.is_ck_staff(restaurant_id));

drop policy if exists "managers blocked slots write" on public.blocked_slots;
create policy "managers blocked slots write" on public.blocked_slots
for all to authenticated
using (public.ck_has_role(restaurant_id, array['owner','manager']))
with check (public.ck_has_role(restaurant_id, array['owner','manager']));

drop policy if exists "staff availability" on public.availability_rules;
drop policy if exists "staff availability read" on public.availability_rules;
drop policy if exists "managers availability write" on public.availability_rules;
create policy "staff availability read" on public.availability_rules
for select to authenticated
using (public.is_ck_staff(restaurant_id));
create policy "managers availability write" on public.availability_rules
for all to authenticated
using (public.ck_has_role(restaurant_id, array['owner','manager']))
with check (public.ck_has_role(restaurant_id, array['owner','manager']));

drop policy if exists "staff blocked dates" on public.blocked_dates;
drop policy if exists "staff blocked dates read" on public.blocked_dates;
drop policy if exists "managers blocked dates write" on public.blocked_dates;
create policy "staff blocked dates read" on public.blocked_dates
for select to authenticated
using (public.is_ck_staff(restaurant_id));
create policy "managers blocked dates write" on public.blocked_dates
for all to authenticated
using (public.ck_has_role(restaurant_id, array['owner','manager']))
with check (public.ck_has_role(restaurant_id, array['owner','manager']));

drop policy if exists "staff reservations" on public.reservations;
drop policy if exists "staff reservations read" on public.reservations;
drop policy if exists "staff reservations insert" on public.reservations;
drop policy if exists "staff reservations update" on public.reservations;
drop policy if exists "managers reservations delete" on public.reservations;
create policy "staff reservations read" on public.reservations
for select to authenticated using (public.is_ck_staff(restaurant_id));
create policy "staff reservations insert" on public.reservations
for insert to authenticated with check (public.is_ck_staff(restaurant_id));
create policy "staff reservations update" on public.reservations
for update to authenticated
using (public.is_ck_staff(restaurant_id))
with check (public.is_ck_staff(restaurant_id));
create policy "managers reservations delete" on public.reservations
for delete to authenticated
using (public.ck_has_role(restaurant_id, array['owner','manager']));

create or replace function public.request_ck_reservation(
  customer_name text,
  customer_phone text,
  requested_date date,
  requested_time time,
  requested_party_size integer,
  customer_birth_date date default null,
  birthday_consent boolean default false
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  rid constant uuid := '00000000-0000-4000-8000-000000000001';
  customer_uuid uuid;
  reservation_uuid uuid;
  normalized_phone text;
  day_rule public.availability_rules%rowtype;
  occupied integer;
  recent_requests integer;
begin
  normalized_phone := regexp_replace(customer_phone, '[^0-9]', '', 'g');
  if length(trim(customer_name)) < 2 or length(trim(customer_name)) > 100 then raise exception 'Nome inválido'; end if;
  if length(normalized_phone) < 10 or length(normalized_phone) > 13 then raise exception 'Telefone inválido'; end if;
  if requested_date < current_date or requested_date > current_date + 180 then raise exception 'Data inválida'; end if;
  if requested_party_size < 1 or requested_party_size > 30 then raise exception 'Quantidade inválida'; end if;
  if customer_birth_date is not null and not birthday_consent then raise exception 'Consentimento necessário'; end if;
  if customer_birth_date is not null and (customer_birth_date > current_date or customer_birth_date < current_date - interval '120 years') then raise exception 'Nascimento inválido'; end if;

  select count(*) into recent_requests
  from public.reservations r
  join public.customers c on c.id = r.customer_id
  where r.restaurant_id = rid
    and c.phone = normalized_phone
    and r.created_at > now() - interval '15 minutes';
  if recent_requests >= 3 then raise exception 'Muitas tentativas. Aguarde 15 minutos'; end if;

  select * into day_rule
  from public.availability_rules
  where restaurant_id = rid and weekday = extract(dow from requested_date)::smallint;
  if day_rule.id is null or not day_rule.is_open then raise exception 'Restaurante fechado nesta data'; end if;
  if requested_time < day_rule.opens_at or requested_time > day_rule.closes_at then raise exception 'Horário indisponível'; end if;
  if exists(select 1 from public.blocked_dates where restaurant_id = rid and blocked_date = requested_date) then raise exception 'Data bloqueada'; end if;
  if exists(select 1 from public.blocked_slots where restaurant_id = rid and blocked_date = requested_date and blocked_time = requested_time) then raise exception 'Horário bloqueado'; end if;

  perform pg_advisory_xact_lock(hashtextextended(rid::text || requested_date::text, 0));
  select coalesce(sum(party_size), 0) into occupied
  from public.reservations
  where restaurant_id = rid
    and reservation_date = requested_date
    and status in ('new','confirmed');
  if occupied + requested_party_size > day_rule.capacity then raise exception 'Capacidade esgotada'; end if;

  insert into public.customers (restaurant_id, name, phone, birth_date, birth_consent_at)
  values (rid, trim(customer_name), normalized_phone,
    case when birthday_consent then customer_birth_date end,
    case when birthday_consent then now() end)
  on conflict (restaurant_id, phone) do update set
    updated_at = now()
  returning id into customer_uuid;

  if birthday_consent and customer_birth_date is not null then
    update public.customers
    set birth_date = coalesce(birth_date, customer_birth_date),
        birth_consent_at = coalesce(birth_consent_at, now()),
        updated_at = now()
    where id = customer_uuid;
    if not exists (
      select 1 from public.consents
      where restaurant_id = rid and customer_id = customer_uuid
        and consent_type = 'birthday_whatsapp' and granted
    ) then
      insert into public.consents (restaurant_id, customer_id, consent_type, granted)
      values (rid, customer_uuid, 'birthday_whatsapp', true);
    end if;
  end if;

  if exists (
    select 1 from public.reservations
    where restaurant_id = rid and customer_id = customer_uuid
      and reservation_date = requested_date and reservation_time = requested_time
      and status in ('new','confirmed')
  ) then raise exception 'Reserva já solicitada para este horário'; end if;

  insert into public.reservations (restaurant_id, customer_id, reservation_date, reservation_time, party_size)
  values (rid, customer_uuid, requested_date, requested_time, requested_party_size)
  returning id into reservation_uuid;
  return reservation_uuid;
end;
$$;

revoke all on function public.request_ck_reservation(text,text,date,time,integer,date,boolean) from public;
grant execute on function public.request_ck_reservation(text,text,date,time,integer,date,boolean) to anon, authenticated;
