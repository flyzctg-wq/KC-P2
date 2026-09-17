# 📋 Kunjachaya Club (KC-P2) — Mobile & Web Tasks (TODO.md)

> For full architectural roadmap and governance tracker, refer to the root [TODO.md](file:///f:/OMEGA%20NET/KC%20P2/TODO.md).

---

## 🔴 Priority 0: Immediate Action Items (Supabase `app_config`)

### 1. Execute SQL Migration in Supabase ✅ (Completed on 2026-09-17)
- **Target File**: `supabase/migrations/20260916_app_config.sql`
- **Dashboard**: [Supabase Dashboard](https://supabase.com/dashboard) ➔ Project **KC P2** ➔ **SQL Editor** (`>_`)
- **SQL Script**:
```sql
-- 1. Create app_config table
create table if not exists public.app_config (
  key   text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2. Seed initial module flags (all enabled by default)
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

-- 4. Allow any authenticated member to read module settings
drop policy if exists "Authenticated read app_config" on public.app_config;
create policy "Authenticated read app_config"
  on public.app_config for select
  using (auth.role() = 'authenticated');

-- 5. Allow admins to update module settings
drop policy if exists "Admin write app_config" on public.app_config;
create policy "Admin write app_config"
  on public.app_config for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 6. Enable Realtime updates across devices
alter publication supabase_realtime add table public.app_config;
```

### 2. Verification Checklist
- [ ] Open [kc-p2.vercel.app](https://kc-p2.vercel.app)
- [ ] Go to **Management → App Modules**
- [ ] Click any switch (e.g. Constitutional Amendments)
- [ ] Verify clean toggle without error toast
- [ ] Verify that disabled modules hide dynamically in real-time for regular members

---

## 🟡 Priority 1: Mobile & Web Pending Tasks
- [ ] **Push Notifications Integration**: Connect `@capacitor/push-notifications` with FCM and Supabase `user_push_tokens`.
- [ ] **Offline Directory Cache**: Cache member directory and emergency hotlines for network resilience.
- [ ] **PipraPay Webhook Resilience**: Idempotency checks and abandoned transaction reconciliation.
- [ ] **Ticket Resolution Escalation**: Automated escalation for unanswered tickets after 72 hours.
