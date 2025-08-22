-- Tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (length(action) between 1 and 120),
  reason text,
  dislike_level int not null check (dislike_level between 0 and 100),
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security
alter table public.tasks enable row level security;

-- Policy: owner can do everything
drop policy if exists "owner_all" on public.tasks;
create policy "owner_all"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Update trigger for updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.tasks;
create trigger set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

