-- Performance indexes
create index if not exists idx_tasks_created_at on public.tasks (created_at desc);
create index if not exists idx_tasks_dislike_level on public.tasks (dislike_level);
create index if not exists idx_tasks_user_id on public.tasks (user_id);
-- GIN index for tags array search
create index if not exists idx_tasks_tags_gin on public.tasks using gin (tags);

