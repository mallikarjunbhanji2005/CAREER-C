-- Add columns added by the app but missing from the original schema
alter table public.profiles
  add column if not exists "current_role" text not null default '';

alter table public.profiles
  add column if not exists company text not null default '';
