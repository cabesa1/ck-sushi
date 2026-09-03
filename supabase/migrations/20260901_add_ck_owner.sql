-- Concede acesso de proprietário ao usuário já criado no Supabase Auth.
do $$
declare
  target_user_id uuid;
begin
  select id into target_user_id
  from auth.users
  where lower(email) = lower('guiga.stefanelli@gmail.com')
  limit 1;

  if target_user_id is null then
    raise exception 'Usuário guiga.stefanelli@gmail.com não encontrado no Supabase Auth';
  end if;

  insert into public.staff_profiles (user_id, restaurant_id, full_name, role)
  values (
    target_user_id,
    '00000000-0000-4000-8000-000000000001',
    'Guilherme Stefanelli',
    'owner'
  )
  on conflict (user_id) do update
  set restaurant_id = excluded.restaurant_id,
      full_name = excluded.full_name,
      role = excluded.role;
end;
$$;
