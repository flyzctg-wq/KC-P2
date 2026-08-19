-- schema/05_fix_user_deletion.sql
-- Fixes: "Database error deleting user" when removing someone from
-- Authentication → Users. Run this once against an existing project
-- that was set up before this fix. Fresh installs get this
-- automatically since it's now folded into 01_tables.sql too.
--
-- Design decision per table:
--   - Content records (notices, tickets, chat, nominations, amendment
--     proposals): ON DELETE SET NULL. The record stays — you can still
--     read what a since-removed member posted or reported — but it's
--     no longer tied to a live account. Each of these already stores
--     the person's name as plain text alongside the ID for exactly
--     this reason (author_name, resident_name, user_name, proposer_name).
--   - Election ballots (votes): ON DELETE SET NULL. A vote stays
--     counted in the results even if the voter's account is later
--     removed — deleting a voter should never silently change an
--     election outcome.
--   - Personal participation records with no independent meaning
--     (AGM attendance/proxies, council votes on amendments/budget
--     items, event RSVPs): ON DELETE CASCADE. These are composite-key
--     join rows — "so-and-so attended this AGM" — that don't mean
--     anything once "so-and-so" no longer exists, and can't use SET
--     NULL anyway since the user id is part of the primary key.
--   - Dues: deliberately left BLOCKING (no change). A resident with
--     financial history can't be deleted until their dues records are
--     reassigned or the club's bookkeeping process says otherwise —
--     silently losing who owed what is worse than an admin having to
--     stop and think about it first.

alter table notices drop constraint notices_author_id_fkey,
  add constraint notices_author_id_fkey foreign key (author_id) references profiles(id) on delete set null;

alter table notice_comments drop constraint notice_comments_user_id_fkey,
  add constraint notice_comments_user_id_fkey foreign key (user_id) references profiles(id) on delete set null;

alter table nominations drop constraint nominations_user_id_fkey,
  add constraint nominations_user_id_fkey foreign key (user_id) references profiles(id) on delete set null;

alter table amendments drop constraint amendments_proposer_id_fkey,
  add constraint amendments_proposer_id_fkey foreign key (proposer_id) references profiles(id) on delete set null;

alter table chat_messages drop constraint chat_messages_user_id_fkey,
  add constraint chat_messages_user_id_fkey foreign key (user_id) references profiles(id) on delete set null;

alter table tickets alter column resident_id drop not null;
alter table tickets drop constraint tickets_resident_id_fkey,
  add constraint tickets_resident_id_fkey foreign key (resident_id) references profiles(id) on delete set null;

alter table votes alter column voter_id drop not null;
alter table votes drop constraint votes_voter_id_fkey,
  add constraint votes_voter_id_fkey foreign key (voter_id) references profiles(id) on delete set null;

alter table agm_attendees drop constraint agm_attendees_user_id_fkey,
  add constraint agm_attendees_user_id_fkey foreign key (user_id) references profiles(id) on delete cascade;

alter table agm_proxies drop constraint agm_proxies_granter_id_fkey,
  add constraint agm_proxies_granter_id_fkey foreign key (granter_id) references profiles(id) on delete cascade;
alter table agm_proxies drop constraint agm_proxies_grantee_id_fkey,
  add constraint agm_proxies_grantee_id_fkey foreign key (grantee_id) references profiles(id) on delete cascade;

alter table amendment_votes drop constraint amendment_votes_voter_id_fkey,
  add constraint amendment_votes_voter_id_fkey foreign key (voter_id) references profiles(id) on delete cascade;

alter table budget_votes drop constraint budget_votes_voter_id_fkey,
  add constraint budget_votes_voter_id_fkey foreign key (voter_id) references profiles(id) on delete cascade;

alter table event_rsvps drop constraint event_rsvps_user_id_fkey,
  add constraint event_rsvps_user_id_fkey foreign key (user_id) references profiles(id) on delete cascade;

-- dues.resident_id intentionally untouched — deleting a resident with
-- dues history stays blocked until you decide what should happen to
-- those records (reassign, write off, archive). If you hit this while
-- testing and just want to force it through for demo cleanup, delete
-- their dues rows first: delete from dues where resident_id = '<uuid>';
