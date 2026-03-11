-- Comments table for community posts in public.videos
create table if not exists public.video_comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.video_comments enable row level security;

create policy "Anyone can view comments"
on public.video_comments
for select
to anon, authenticated
using (true);

create policy "User can insert own comment"
on public.video_comments
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "User can delete own comment"
on public.video_comments
for delete
to authenticated
using (auth.uid() = user_id);
