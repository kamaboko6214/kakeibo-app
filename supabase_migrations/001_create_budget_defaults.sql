create table budget_defaults (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null,
  category_id uuid not null references categories(id),
  amount integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, category_id)
);
