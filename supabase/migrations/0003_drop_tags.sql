-- Drop tags-related index and column from tasks
do $$ begin
  if exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'idx_tasks_tags_gin') then
    execute 'drop index public.idx_tasks_tags_gin';
  end if;
end $$;

alter table public.tasks drop column if exists tags;

