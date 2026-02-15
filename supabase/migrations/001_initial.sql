-- product_ideas: LLM-generated ideas from Reddit signals
create table if not exists public.product_ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  pitch text not null,
  pain_insight text not null,
  source_subreddit text not null,
  source_url text not null,
  score smallint not null check (score >= 0 and score <= 100),
  topic text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_ideas_topic on public.product_ideas (topic);
create index if not exists idx_product_ideas_created_at on public.product_ideas (created_at desc);

alter table public.product_ideas enable row level security;

create policy "Allow public read"
  on public.product_ideas for select
  using (true);

-- Inserts only via service role (bypasses RLS); no insert policy for anon/authenticated

-- email_subscriptions: user digest subscriptions with topic filters
create table if not exists public.email_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  topic_filters text[] not null default '{}',
  unsubscribe_token text not null unique,
  created_at timestamptz not null default now(),
  active boolean not null default true
);

create index if not exists idx_email_subscriptions_user_id on public.email_subscriptions (user_id);
create index if not exists idx_email_subscriptions_unsubscribe_token on public.email_subscriptions (unsubscribe_token);

alter table public.email_subscriptions enable row level security;

create policy "Users can manage own subscriptions"
  on public.email_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Unsubscribe by token: use service role in API route (SUPABASE_SERVICE_ROLE_KEY)
