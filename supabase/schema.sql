-- Cardio AI Hub schema. Run once in the Supabase SQL editor.
-- All access goes through the app server with the service-role key (bypasses RLS).
-- RLS is enabled with NO policies so anon/authenticated keys cannot touch the data.

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  description text not null default '',
  field_of_interest text not null default 'Other',
  remarks text not null default '',
  author_id uuid not null references profiles(id) on delete cascade,
  copy_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists prompts_author_idx on prompts (author_id);

create table if not exists prompt_ratings (
  prompt_id uuid not null references prompts(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  primary key (prompt_id, profile_id)
);

create table if not exists tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  purpose text not null default '',
  category text not null default 'Other',
  location text not null default '',
  status text not null default 'ready' check (status in ('ready', 'in_development')),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  purpose text not null default '',
  category text not null default 'Other',
  kind text not null default 'other' check (kind in ('agent', 'prompt', 'automation', 'custom_gpt', 'other')),
  status text not null default 'submitted' check (status in ('submitted', 'under_review', 'in_development', 'done')),
  author_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists recommendations_author_idx on recommendations (author_id);

create table if not exists news_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null default '',
  url text not null unique,
  source text not null default '',
  tags text[] not null default '{}',
  relevance_score integer,
  hidden boolean not null default false,
  published_at timestamptz,
  fetched_at timestamptz not null default now()
);
create index if not exists news_visible_idx on news_items (hidden, fetched_at desc);

-- atomic copy counter used by the prompt copy button
create or replace function increment_copy_count(p_id uuid)
returns void
language sql
as $$
  update prompts set copy_count = copy_count + 1 where id = p_id;
$$;

-- lock everything down: no policies = no access except the service role
alter table profiles enable row level security;
alter table prompts enable row level security;
alter table prompt_ratings enable row level security;
alter table tools enable row level security;
alter table recommendations enable row level security;
alter table news_items enable row level security;
