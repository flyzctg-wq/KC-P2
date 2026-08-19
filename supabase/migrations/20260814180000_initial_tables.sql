-- schema/01_tables.sql
-- ============================================================
-- RECONSTRUCTED baseline — read this before trusting this file.
--
-- This migration set was rebuilt from the schema/RLS/functions I
-- originally wrote for this project, not pulled directly from the
-- live database (this repo had no supabase/migrations/ at all before
-- now, so there was nothing to pull FROM in version control).
--
-- I cross-checked it against every `.from("table_name")` call actually
-- present in this codebase's client code (24 tables, all accounted
-- for here) plus the two Edge Functions — so it's very likely an
-- accurate match. But "very likely" isn't "verified." Before trusting
-- this as the source of truth, run:
--
--     supabase db pull
--
-- from the project root (with the Supabase CLI installed and this
-- project already linked — supabase/.temp/linked-project.json shows
-- it already is). That command introspects your ACTUAL live database
-- and generates a migration reflecting what's really there, which you
-- should diff against these files and reconcile — see
-- supabase/MIGRATIONS.md for the full workflow.
-- ============================================================
--
-- Run in Supabase SQL Editor, or via `supabase db push`.
--
-- Design notes vs. the Firebase version this replaces:
--  - `profiles` extends auth.users (Supabase's built-in auth table) —
--    same idea as the Firebase version's users/{uid} document, but a
--    real foreign key instead of a loosely-matched uid string.
--  - Every entity keeps its stable `id` so the client's existing
--    `db.users`, `db.notices`, etc. array shapes can be reconstructed
--    with a SELECT — no screen had to be rewritten to migrate.
--  - Vote integrity (`UNIQUE(election_id, position, voter_id)`) is a
--    real database constraint now, not application logic re-checked
--    inside a Firestore transaction.

create extension if not exists "uuid-ossp";

-- ---------- profiles (extends auth.users) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  block text,
  unit text,
  member_class text not null default 'New' check (member_class in ('New','General','Founding','Advisory','Life','Donor')),
  role text not null default 'resident' check (role in ('resident','admin')),
  post text,
  status text not null default 'pending' check (status in ('pending','active')),
  permissions jsonb not null default '{}'::jsonb,
  standing_council boolean not null default false,
  blood_group text,
  donor boolean not null default false,
  earned_badges text[] not null default '{}',
  joined_date timestamptz not null default now()
);

-- ---------- notices ----------
create table notices (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text not null,
  category text not null default 'General',
  author_id uuid references profiles(id) on delete set null,
  author_name text not null,
  likes uuid[] not null default '{}',
  created_at timestamptz not null default now()
);
create table notice_comments (
  id uuid primary key default uuid_generate_v4(),
  notice_id uuid not null references notices(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  user_name text not null,
  text text not null,
  created_at timestamptz not null default now()
);

-- ---------- dues ----------
create table dues (
  id uuid primary key default uuid_generate_v4(),
  resident_id uuid not null references profiles(id), -- intentionally blocking: see schema/05_fix_user_deletion.sql header comment
  month text not null, -- 'YYYY-MM'
  amount numeric not null,
  status text not null default 'pending' check (status in ('pending','paid','overdue')),
  paid_date timestamptz,
  ref text
);

-- ---------- elections ----------
create table elections (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  status text not null default 'nomination' check (status in ('nomination','active','closed')),
  positions text[] not null,
  start_date timestamptz not null default now(),
  end_date timestamptz not null
);
create table candidates (
  id uuid primary key default uuid_generate_v4(),
  election_id uuid not null references elections(id) on delete cascade,
  name text not null,
  position text not null,
  block text,
  manifesto text
);
create table nominations (
  id uuid primary key default uuid_generate_v4(),
  election_id uuid not null references elections(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  user_name text not null,
  position text not null,
  manifesto text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected'))
);
create table votes (
  id uuid primary key default uuid_generate_v4(),
  election_id uuid not null references elections(id) on delete cascade,
  position text not null,
  candidate_id uuid not null references candidates(id),
  voter_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (election_id, position, voter_id) -- the constraint that makes double-voting impossible at the DB level
);

-- ---------- tickets ----------
create table tickets (
  id uuid primary key default uuid_generate_v4(),
  resident_id uuid references profiles(id) on delete set null,
  resident_name text not null,
  subject text not null,
  category text not null,
  description text not null,
  status text not null default 'open' check (status in ('open','in_progress','resolved')),
  response text default '',
  created_at timestamptz not null default now()
);

-- ---------- activity (append-only audit log) ----------
create table activity (
  id uuid primary key default uuid_generate_v4(),
  actor text not null,
  action text not null,
  created_at timestamptz not null default now()
);

-- ---------- emergency contacts ----------
create table emergency_contacts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text,
  phone text not null,
  category text not null check (category in ('Emergency Service','EC Lead','Block Lead'))
);

-- ---------- AGM ----------
create table agm_events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  date timestamptz not null,
  status text not null default 'upcoming' check (status in ('upcoming','completed')),
  agenda text[] not null default '{}',
  minutes text default ''
);
create table agm_resolutions (
  id uuid primary key default uuid_generate_v4(),
  agm_event_id uuid not null references agm_events(id) on delete cascade,
  title text not null,
  description text,
  votes_for uuid[] not null default '{}',
  votes_against uuid[] not null default '{}'
);
create table agm_attendees (
  agm_event_id uuid not null references agm_events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  primary key (agm_event_id, user_id)
);
create table agm_proxies (
  agm_event_id uuid not null references agm_events(id) on delete cascade,
  granter_id uuid not null references profiles(id) on delete cascade,
  grantee_id uuid not null references profiles(id) on delete cascade,
  primary key (agm_event_id, granter_id)
);

-- ---------- constitutional amendments ----------
create table amendments (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  article_ref text,
  current_text text,
  proposed_text text not null,
  proposer_id uuid references profiles(id) on delete set null,
  proposer_name text not null,
  status text not null default 'proposed' check (status in ('proposed','voting','ratified','rejected'))
);
create table amendment_votes (
  amendment_id uuid not null references amendments(id) on delete cascade,
  voter_id uuid not null references profiles(id) on delete cascade,
  choice text not null check (choice in ('for','against')),
  primary key (amendment_id, voter_id)
);

-- ---------- budget review ----------
create table budget_items (
  id uuid primary key default uuid_generate_v4(),
  category text not null,
  description text not null,
  amount numeric not null,
  proposed_by text not null,
  status text not null default 'proposed' check (status in ('proposed','voting','approved','rejected'))
);
create table budget_votes (
  budget_item_id uuid not null references budget_items(id) on delete cascade,
  voter_id uuid not null references profiles(id) on delete cascade,
  choice text not null check (choice in ('for','against')),
  primary key (budget_item_id, voter_id)
);

-- ---------- chat ----------
create table chat_messages (
  id uuid primary key default uuid_generate_v4(),
  channel text not null check (channel in ('community','council')),
  user_id uuid references profiles(id) on delete set null,
  user_name text not null,
  text text not null,
  created_at timestamptz not null default now()
);

-- ---------- committee handover ----------
create table handover_checklist (
  id uuid primary key default uuid_generate_v4(),
  item text not null,
  category text not null,
  done boolean not null default false,
  done_by text,
  done_date timestamptz
);

-- ---------- events ----------
create table events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  date timestamptz not null,
  location text
);
create table event_rsvps (
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  primary key (event_id, user_id)
);

-- ---------- officer induction ----------
create table inductions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  position text not null,
  date timestamptz not null default now(),
  election_title text
);

-- Helpful indexes for the queries the app actually runs
create index on dues (resident_id);
create index on votes (election_id, position);
create index on tickets (resident_id);
create index on notice_comments (notice_id);
create index on activity (created_at desc);
