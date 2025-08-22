-- Add done flag to tasks for TODO completion state
alter table public.tasks
  add column if not exists done boolean not null default false;

create index if not exists idx_tasks_done on public.tasks (done);

