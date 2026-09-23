-- 20260923_audit_resilience_fixes.sql
-- KC-P2 Resilience & Financial Persistence Migration

-- 1. Extend dues table with financial ledger & GM charge columns
alter table public.dues
  add column if not exists charge_type text default 'monthly',
  add column if not exists charge_title text,
  add column if not exists due_date text,
  add column if not exists method text,
  add column if not exists discount numeric default 0,
  add column if not exists received_amount numeric,
  add column if not exists balance_due numeric,
  add column if not exists collected_by text,
  add column if not exists note text,
  add column if not exists resolution_no text,
  add column if not exists category text;

-- 2. Create expenses table for club voucher & expenditure ledger
create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text not null,
  amount numeric not null check (amount > 0),
  voucher_no text not null,
  payee text not null,
  approved_by text not null,
  date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.expenses enable row level security;

drop policy if exists "Authenticated users can read expenses" on public.expenses;
create policy "Authenticated users can read expenses"
  on public.expenses for select
  using (auth.role() = 'authenticated');

drop policy if exists "Financial managers can insert expenses" on public.expenses;
create policy "Financial managers can insert expenses"
  on public.expenses for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and (role = 'admin' or (permissions->>'canManageFinancials')::boolean = true)
    )
  );

drop policy if exists "Financial managers can update expenses" on public.expenses;
create policy "Financial managers can update expenses"
  on public.expenses for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and (role = 'admin' or (permissions->>'canManageFinancials')::boolean = true)
    )
  );

drop policy if exists "Admins can delete expenses" on public.expenses;
create policy "Admins can delete expenses"
  on public.expenses for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 3. Create letters table for official correspondence & memo register
create table if not exists public.letters (
  id uuid primary key default uuid_generate_v4(),
  memo_no text not null,
  subject text not null,
  recipient text not null,
  body text not null,
  letter_type text not null default 'general',
  signatory_left_title text,
  signatory_left_name text,
  signatory_right_title text,
  signatory_right_name text,
  issued_by text not null,
  created_at timestamptz not null default now()
);

alter table public.letters enable row level security;

drop policy if exists "Authenticated users can read letters" on public.letters;
create policy "Authenticated users can read letters"
  on public.letters for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authorized officials can manage letters" on public.letters;
create policy "Authorized officials can manage letters"
  on public.letters for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and (
        role = 'admin' or
        post in ('President', 'General Secretary', 'Joint Secretary', 'Organizing Secretary')
      )
    )
  );

-- 4. Enable voters to verify their own cast votes (resolves BallotView blank state)
drop policy if exists "Voters can read own votes" on public.votes;
create policy "Voters can read own votes"
  on public.votes for select
  using (voter_id = auth.uid());

-- 5. Add realtime replication for newly created tables
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.expenses;
    alter publication supabase_realtime add table public.letters;
  end if;
exception when others then
  -- Ignore duplicate publication addition if already registered
  null;
end $$;
