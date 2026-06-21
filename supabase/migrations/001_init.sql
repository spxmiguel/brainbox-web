-- memories table
create table if not exists public.memories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  llm_used text,
  category text,
  created_at timestamptz default now() not null
);

alter table public.memories enable row level security;

create policy "Users see own memories"
  on public.memories for select
  using (auth.uid() = user_id);

create policy "Users insert own memories"
  on public.memories for insert
  with check (auth.uid() = user_id);

create policy "Users delete own memories"
  on public.memories for delete
  using (auth.uid() = user_id);

-- user_settings table
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  gemini_key text,
  claude_key text,
  openai_key text,
  updated_at timestamptz default now() not null
);

alter table public.user_settings enable row level security;

create policy "Users see own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users upsert own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users update own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

-- index for performance
create index if not exists memories_user_id_created_at on public.memories(user_id, created_at);
