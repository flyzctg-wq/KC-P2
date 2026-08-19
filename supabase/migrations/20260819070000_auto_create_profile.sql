-- schema/06_auto_create_profile.sql
--
-- Fixes: registration can silently fail to create a usable account.
--
-- Root cause: the client (src/lib/authBridge.js) tries to insert its
-- own profiles row right after supabase.auth.signUp(), but that
-- insert is subject to RLS ("insert own pending profile" requires
-- auth.uid() = id AND status = 'pending'). Two ways that breaks:
--   1. If email confirmation is enabled, there's no live session yet
--      at the moment of that insert, so auth.uid() is null.
--   2. Invite-based registrations that should land as status='active'
--      get rejected outright, since the policy hard-requires 'pending'.
-- Either way, the failure was only console.warn'd — never surfaced to
-- the person registering, who'd see "Registration submitted!" and
-- then be unable to log in.
--
-- The fix: create the profile via a trigger on auth.users, running as
-- SECURITY DEFINER (bypasses RLS entirely, doesn't need an active
-- session). This is the standard Supabase pattern for exactly this
-- problem — profile creation should never depend on client-side RLS
-- timing.

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, phone, block, unit, blood_group, status, role, member_class)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'block', ''),
    coalesce(new.raw_user_meta_data->>'unit', ''),
    coalesce(new.raw_user_meta_data->>'blood_group', ''),
    'pending', -- always starts pending — see note below on invite auto-activation
    'resident',
    'New'
  )
  on conflict (id) do nothing; -- if authBridge.js's own upsert already succeeded, don't duplicate/overwrite it
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- NOTE on invite-based instant activation: this trigger deliberately
-- always creates the profile as status='pending', even for invited
-- members — a trigger running as SECURITY DEFINER is not the place to
-- trust a client-supplied "this person should be active" flag, since
-- that would let anyone self-activate by just claiming to have been
-- invited. If instant activation for invited members is a feature you
-- want to keep, the secure way is: validate the invite code/token
-- server-side (an Edge Function checking it against a real invites
-- table) and have THAT function update status to 'active' after
-- confirming the invite is genuine — not a value the client sets
-- directly during signup.
