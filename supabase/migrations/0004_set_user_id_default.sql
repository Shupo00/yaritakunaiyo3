-- Ensure user_id is set automatically from the authenticated user
alter table public.tasks alter column user_id set default auth.uid();

