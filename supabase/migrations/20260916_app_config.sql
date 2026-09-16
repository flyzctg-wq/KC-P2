-- Supabase Migration: App Config table for module toggles
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- 1. Create table
create table if not exists public.app_config (
  key   text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2. Seed the module flags row (all enabled by default)
insert into public.app_config (key, value)
values (
  'kc_modules',
  '{
    "elections":    true,
    "agm":          true,
    "amendments":   true,
    "budget":       true,
    "audit":        true,
    "bloodBank":    true,
    "events":       true,
    "badges":       true,
    "chat":         true,
    "hotlines":     true,
    "handover":     true,
    "constitution": true
  }'::jsonb
)
on conflict (key) do nothing;

-- 3. Enable Row Level Security
alter table public.app_config enable row level security;

-- 4. Anyone authenticated can read (modules must load for all users)
create policy "Authenticated read app_config"
  on public.app_config for select
  using (auth.role() = 'authenticated');

-- 5. Only admins can write (enforced both here and in app layer)
create policy "Admin write app_config"
  on public.app_config for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 6. Enable realtime for the table (so client receives push updates)
alter publication supabase_realtime add table public.app_config;
