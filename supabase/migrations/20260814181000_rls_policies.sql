-- schema/02_rls.sql
-- Enables RLS on every table and defines policies mirroring the
-- permission model from rules.md: canManageMembers/Notices/Financials/
-- Complaints/DeleteItems, Standing Council, and President/General
-- Secretary ("top tier"). Compare this to firestore.rules in
-- kunjachaya-backend/ — the logic is identical, but here it's real SQL
-- that can join across tables directly instead of nested get() calls.

-- ---------- helper functions ----------
create or replace function my_profile()
returns profiles language sql stable as $$
  select * from profiles where id = auth.uid()
$$;

create or replace function is_active()
returns boolean language sql stable as $$
  select exists (select 1 from profiles where id = auth.uid() and status = 'active')
$$;

create or replace function is_admin()
returns boolean language sql stable as $$
  select exists (select 1 from profiles where id = auth.uid() and status = 'active' and role = 'admin')
$$;

create or replace function has_perm(perm_key text)
returns boolean language sql stable as $$
  select coalesce((select (permissions->>perm_key)::boolean from profiles where id = auth.uid() and role = 'admin' and status = 'active'), false)
$$;

create or replace function is_top_tier()
returns boolean language sql stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin' and status = 'active' and post in ('President', 'General Secretary'))
$$;

create or replace function is_standing_council()
returns boolean language sql stable as $$
  select coalesce((select standing_council from profiles where id = auth.uid()), false) or is_top_tier()
$$;

-- ---------- enable RLS everywhere ----------
alter table profiles enable row level security;
alter table notices enable row level security;
alter table notice_comments enable row level security;
alter table dues enable row level security;
alter table elections enable row level security;
alter table candidates enable row level security;
alter table nominations enable row level security;
alter table votes enable row level security;
alter table tickets enable row level security;
alter table activity enable row level security;
alter table emergency_contacts enable row level security;
alter table agm_events enable row level security;
alter table agm_resolutions enable row level security;
alter table agm_attendees enable row level security;
alter table agm_proxies enable row level security;
alter table amendments enable row level security;
alter table amendment_votes enable row level security;
alter table budget_items enable row level security;
alter table budget_votes enable row level security;
alter table chat_messages enable row level security;
alter table handover_checklist enable row level security;
alter table events enable row level security;
alter table event_rsvps enable row level security;
alter table inductions enable row level security;

-- ---------- profiles ----------
create policy "insert own pending profile" on profiles for insert
  with check (auth.uid() = id and status = 'pending' and role = 'resident');
create policy "read active members" on profiles for select
  using (is_active() or auth.uid() = id);
create policy "edit own phone, or admin manages members" on profiles for update
  using (auth.uid() = id or has_perm('canManageMembers') or is_top_tier());
create policy "admin deletes members" on profiles for delete
  using (has_perm('canManageMembers'));

-- ---------- notices & comments ----------
create policy "read notices" on notices for select using (is_active());
create policy "admin publishes notices" on notices for insert with check (has_perm('canManageNotices'));
create policy "admin edits or anyone likes" on notices for update using (has_perm('canManageNotices') or is_active());
create policy "admin deletes notices" on notices for delete using (has_perm('canManageNotices') or has_perm('canDeleteItems'));

create policy "read comments" on notice_comments for select using (is_active());
create policy "post own comments" on notice_comments for insert with check (is_active() and user_id = auth.uid());
create policy "admin deletes comments" on notice_comments for delete using (has_perm('canManageNotices') or has_perm('canDeleteItems'));

-- ---------- dues ----------
create policy "read own dues or admin reads all" on dues for select
  using (resident_id = auth.uid() or is_admin());
create policy "treasurer issues dues" on dues for insert with check (has_perm('canManageFinancials'));
-- Tightened: the app's Dues screen now calls the piprapay-checkout Edge
-- Function and redirects to a real PipraPay payment page instead of
-- marking a due "paid" directly — so a resident no longer needs (or
-- gets) permission to update their own due at all. Only the treasurer
-- can edit dues records directly (e.g. correcting an amount), and only
-- the piprapay-webhook Edge Function (service-role key, bypasses RLS
-- entirely) can set status = 'paid'.
create policy "treasurer edits dues" on dues for update
  using (has_perm('canManageFinancials'));
create policy "admin deletes dues" on dues for delete using (has_perm('canDeleteItems'));

-- ---------- elections, candidates, nominations ----------
create policy "read elections" on elections for select using (is_active());
create policy "top tier manages elections" on elections for insert with check (is_top_tier() or has_perm('canManageMembers'));
create policy "top tier updates elections" on elections for update using (is_top_tier() or has_perm('canManageMembers'));
create policy "admin deletes elections" on elections for delete using (has_perm('canDeleteItems'));

create policy "read candidates" on candidates for select using (is_active());
create policy "admin manages candidates" on candidates for insert with check (is_top_tier() or has_perm('canManageMembers'));
create policy "admin deletes candidates" on candidates for delete using (has_perm('canDeleteItems'));

create policy "read nominations" on nominations for select using (is_active());
create policy "self-nominate" on nominations for insert with check (is_active() and user_id = auth.uid());
create policy "admin reviews nominations" on nominations for update using (has_perm('canManageMembers') or is_top_tier());

-- ---------- votes ----------
-- No direct insert/update/delete policy at all — every vote must go
-- through the cast_vote() function below (SECURITY DEFINER, so it runs
-- with elevated privilege and enforces eligibility + the unique
-- constraint atomically). Residents can never write to this table
-- directly, only read aggregated results via the app's own queries.
create policy "admin reads raw votes" on votes for select using (is_admin());

-- ---------- tickets ----------
create policy "read own tickets or admin reads all" on tickets for select
  using (resident_id = auth.uid() or has_perm('canManageComplaints'));
create policy "submit own ticket" on tickets for insert with check (is_active() and resident_id = auth.uid());
create policy "admin responds to tickets" on tickets for update using (has_perm('canManageComplaints'));
create policy "admin deletes tickets" on tickets for delete using (has_perm('canDeleteItems'));

-- ---------- activity (append-only) ----------
create policy "admin reads activity" on activity for select using (is_admin());
create policy "any active member logs activity" on activity for insert with check (is_active());

-- ---------- emergency contacts ----------
create policy "read hotlines" on emergency_contacts for select using (is_active());
create policy "admin manages hotlines" on emergency_contacts for insert with check (has_perm('canManageComplaints') or is_top_tier());
create policy "admin deletes hotlines" on emergency_contacts for delete using (has_perm('canManageComplaints') or is_top_tier());

-- ---------- AGM ----------
create policy "read agm" on agm_events for select using (is_active());
create policy "top tier manages agm" on agm_events for insert with check (is_top_tier());
create policy "top tier updates agm" on agm_events for update using (is_top_tier());

create policy "read resolutions" on agm_resolutions for select using (is_active());
create policy "top tier creates resolutions" on agm_resolutions for insert with check (is_top_tier());
create policy "members vote on resolutions" on agm_resolutions for update using (is_active());

create policy "read attendees" on agm_attendees for select using (is_active());
create policy "rsvp self" on agm_attendees for insert with check (user_id = auth.uid());
create policy "un-rsvp self" on agm_attendees for delete using (user_id = auth.uid());

create policy "read proxies" on agm_proxies for select using (is_active());
create policy "assign own proxy" on agm_proxies for insert with check (granter_id = auth.uid());
create policy "clear own proxy" on agm_proxies for delete using (granter_id = auth.uid());

-- ---------- amendments ----------
create policy "read amendments" on amendments for select using (is_active());
create policy "propose amendment" on amendments for insert with check (is_active() and proposer_id = auth.uid());
create policy "top tier updates amendment status" on amendments for update using (is_top_tier());

create policy "read amendment votes" on amendment_votes for select using (is_standing_council());
create policy "council votes on amendment" on amendment_votes for insert with check (is_standing_council());
create policy "council changes own vote" on amendment_votes for update using (voter_id = auth.uid() and is_standing_council());

-- ---------- budget review ----------
create policy "read budget items" on budget_items for select using (is_active());
create policy "treasurer proposes budget item" on budget_items for insert with check (has_perm('canManageFinancials') or is_top_tier());
create policy "top tier updates budget status" on budget_items for update using (is_top_tier());

create policy "read budget votes" on budget_votes for select using (is_standing_council());
create policy "council votes on budget" on budget_votes for insert with check (is_standing_council());
create policy "council changes own budget vote" on budget_votes for update using (voter_id = auth.uid() and is_standing_council());

-- ---------- chat ----------
create policy "read community chat" on chat_messages for select
  using (channel = 'community' and is_active() or channel = 'council' and is_admin());
create policy "post to community chat" on chat_messages for insert
  with check (is_active() and user_id = auth.uid() and (channel = 'community' or (channel = 'council' and is_admin())));

-- ---------- handover checklist ----------
create policy "admin reads handover" on handover_checklist for select using (is_admin());
create policy "admin manages handover" on handover_checklist for insert with check (has_perm('canManageMembers') or is_top_tier());
create policy "admin updates handover" on handover_checklist for update using (has_perm('canManageMembers') or is_top_tier());

-- ---------- events ----------
create policy "read events" on events for select using (is_active());
create policy "admin creates events" on events for insert with check (has_perm('canManageNotices') or is_top_tier());

create policy "read rsvps" on event_rsvps for select using (is_active());
create policy "rsvp self to event" on event_rsvps for insert with check (user_id = auth.uid());
create policy "un-rsvp self from event" on event_rsvps for delete using (user_id = auth.uid());

-- ---------- inductions ----------
create policy "read officers" on inductions for select using (is_active());
create policy "top tier inducts officer" on inductions for insert with check (is_top_tier());
