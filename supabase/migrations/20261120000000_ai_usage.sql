-- Lets the editor show how many AI generations the signed-in user has left.
-- ai_generations has no RLS policies, so reads go through this function.
create function public.get_ai_usage()
returns table (used int, hourly_limit int, next_free_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select
    count(*)::int,
    -- Keep in step with v_limit in consume_ai_generation().
    10,
    -- The window slides, so a slot frees up an hour after the oldest generation.
    min(created_at) + interval '1 hour'
  from public.ai_generations
  where user_id = (select auth.uid())
    and created_at >= now() - interval '1 hour';
$$;

revoke all on function public.get_ai_usage() from public;
grant execute on function public.get_ai_usage() to authenticated;
revoke execute on function public.get_ai_usage() from anon;
