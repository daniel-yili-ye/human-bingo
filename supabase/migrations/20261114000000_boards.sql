-- Boards: user-created bingo boards, shared by an unguessable slug.

create table public.boards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[A-Za-z0-9_-]{12}$'),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  row_count smallint not null check (row_count between 3 and 6),
  col_count smallint not null check (col_count between 3 and 6),
  free_space boolean not null default false,
  -- One entry per cell in row-major order. The free-space cell is stored as ''.
  prompts text[] not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint boards_prompts_match_grid
    check (cardinality(prompts) = row_count * col_count),
  constraint boards_prompts_size
    check (pg_column_size(prompts) <= 8192),
  constraint boards_free_space_needs_center
    check (not free_space or (row_count % 2 = 1 and col_count % 2 = 1))
);

create index boards_owner_created_idx on public.boards (owner_id, created_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger boards_set_updated_at
  before update on public.boards
  for each row execute function public.set_updated_at();

-- Cap boards per owner so a single account cannot fill the table.
create function public.enforce_board_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.boards where owner_id = new.owner_id) >= 100 then
    raise exception 'board limit reached' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger boards_enforce_limit
  before insert on public.boards
  for each row execute function public.enforce_board_limit();

-- Row Level Security: owners manage their own boards. Nobody can list other
-- people's boards; public access goes through get_board_by_slug() only.
alter table public.boards enable row level security;

revoke all on public.boards from anon, authenticated;
grant select, insert, delete on public.boards to authenticated;
grant update (title, row_count, col_count, free_space, prompts) on public.boards to authenticated;

create policy "Owners can read their boards"
  on public.boards for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Users can create their own boards"
  on public.boards for insert to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Owners can update their boards"
  on public.boards for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Owners can delete their boards"
  on public.boards for delete to authenticated
  using ((select auth.uid()) = owner_id);

-- Public, unlisted read: anyone holding the slug can fetch that one board.
-- Returns only the columns needed to play (no owner_id).
create function public.get_board_by_slug(p_slug text)
returns table (
  slug text,
  title text,
  row_count smallint,
  col_count smallint,
  free_space boolean,
  prompts text[],
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select b.slug, b.title, b.row_count, b.col_count, b.free_space, b.prompts, b.updated_at
  from public.boards b
  where b.slug = p_slug;
$$;

revoke all on function public.get_board_by_slug(text) from public;
grant execute on function public.get_board_by_slug(text) to anon, authenticated;

-- AI generation rate limit: a sliding one-hour window per user.
create table public.ai_generations (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index ai_generations_user_created_idx
  on public.ai_generations (user_id, created_at desc);

-- RLS on with no policies: only the security definer function below can touch it.
alter table public.ai_generations enable row level security;
revoke all on public.ai_generations from anon, authenticated;

-- Atomically records one AI generation for the calling user.
-- Returns false when the user is signed out or over the hourly limit.
create function public.consume_ai_generation()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_limit constant int := 10;
begin
  if v_user_id is null then
    return false;
  end if;

  -- Serialise concurrent calls from the same user so the count cannot be raced.
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  delete from public.ai_generations
  where user_id = v_user_id and created_at < now() - interval '1 hour';

  if (select count(*) from public.ai_generations where user_id = v_user_id) >= v_limit then
    return false;
  end if;

  insert into public.ai_generations (user_id) values (v_user_id);
  return true;
end;
$$;

revoke all on function public.consume_ai_generation() from public;
grant execute on function public.consume_ai_generation() to authenticated;

-- Supabase's default privileges grant EXECUTE on new functions to the API
-- roles directly, so revoking from PUBLIC alone is not enough.
revoke execute on function public.consume_ai_generation() from anon;
revoke execute on function public.set_updated_at() from anon, authenticated;
revoke execute on function public.enforce_board_limit() from anon, authenticated;
