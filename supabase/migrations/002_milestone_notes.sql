create table if not exists milestone_notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  rung_id     text not null,
  content     text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, rung_id)
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger milestone_notes_updated_at
  before update on milestone_notes
  for each row execute procedure update_updated_at();

-- RLS
alter table milestone_notes enable row level security;

create policy "Users can manage their own notes"
  on milestone_notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
