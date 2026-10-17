-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- profiles
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text not null,
  target_role text
);

-- ladders
create table public.ladders (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  career_path_json jsonb not null,
  created_at       timestamptz not null default now()
);

-- user_progress
create table public.user_progress (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid not null references public.profiles(id) on delete cascade,
  rung_id                 text not null,
  status                  text not null check (status in ('locked', 'active', 'completed')),
  verification_transcript text,
  updated_at              timestamptz not null default now(),
  unique (user_id, rung_id)
);

-- RLS: profiles
alter table public.profiles enable row level security;
create policy "profiles: owner access"
  on public.profiles for all
  using (id = auth.uid())
  with check (id = auth.uid());

-- RLS: ladders
alter table public.ladders enable row level security;
create policy "ladders: owner access"
  on public.ladders for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- RLS: user_progress
alter table public.user_progress enable row level security;
create policy "user_progress: owner access"
  on public.user_progress for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
