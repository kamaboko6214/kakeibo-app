create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid not null,
  name text not null,
  avatar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- サインアップ時にprofilesへ自動でレコードを作成
create function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, household_id, name)
  values (
    new.id,
    '00000000-0000-0000-0000-000000000001',
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

insert into public.profiles (id, household_id, name)
select id, '00000000-0000-0000-0000-000000000001', coalesce(raw_user_meta_data->>'name', split_part(email, '@', 1))
from auth.users
where not exists (select 1 from public.profiles where public.profiles.id = auth.users.id
);