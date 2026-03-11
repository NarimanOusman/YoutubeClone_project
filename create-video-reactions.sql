-- Reactions table for community posts in public.videos
create table if not exists public.video_reactions (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  unique (video_id, user_id)
);

alter table public.video_reactions enable row level security;

-- Anyone can read reaction aggregates/lists
create policy "Anyone can view reactions"
on public.video_reactions
for select
to anon, authenticated
using (true);

-- Logged-in users can add their own reaction
create policy "User can insert own reaction"
on public.video_reactions
for insert
to authenticated
with check (auth.uid() = user_id);

-- Logged-in users can update/delete only their own reactions
create policy "User can update own reaction"
on public.video_reactions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "User can delete own reaction"
on public.video_reactions
for delete
to authenticated
using (auth.uid() = user_id);
