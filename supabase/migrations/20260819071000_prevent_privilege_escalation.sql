-- schema/07_prevent_privilege_escalation.sql
--
-- Fixes a real privilege escalation vulnerability: the "edit own
-- phone, or admin manages members" UPDATE policy on profiles controls
-- which ROW can be touched (auth.uid() = id), but not which COLUMNS —
-- Postgres RLS doesn't restrict columns on its own. As written, any
-- authenticated resident could call the REST API directly (bypassing
-- the app's UI entirely) and set their own role to 'admin', status to
-- 'active', and permissions to everything — self-promoting to
-- President-level access. This isn't a client-side risk, it's a
-- database-level one; the UI never showing that option provides zero
-- actual protection.
--
-- Fix: a BEFORE UPDATE trigger that blocks changes to privileged
-- columns unless the person making the change is an admin with
-- canManageMembers, or a top-tier officer (President/General
-- Secretary) — the same rule already used everywhere else in this
-- app's permission model.

create or replace function prevent_self_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Reuses the same has_perm()/is_top_tier() helpers the RLS policies
  -- already rely on elsewhere, rather than re-deriving the same rule
  -- a second way and risking the two drifting apart later.
  if has_perm('canManageMembers') or is_top_tier() then
    return new;
  end if;

  if new.role != old.role
     or new.status != old.status
     or new.permissions::text != old.permissions::text
     or new.member_class != old.member_class
     or coalesce(new.standing_council, false) != coalesce(old.standing_council, false)
     or coalesce(new.post, '') != coalesce(old.post, '')
     or coalesce(new.earned_badges, '{}') != coalesce(old.earned_badges, '{}')
  then
    raise exception 'Only a committee member with member-management rights can change role, status, permissions, member class, Standing Council membership, post, or badges.';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_profile_privilege_escalation on profiles;
create trigger guard_profile_privilege_escalation
  before update on profiles
  for each row execute function prevent_self_privilege_escalation();
