-- schema/03_cast_vote.sql
--
-- Replaces the castVote Cloud Function. SECURITY DEFINER means this
-- runs with elevated privilege (bypassing the "no direct writes"
-- policy on votes), but only this function can insert into votes — so
-- it's still the sole path a vote can be cast through. The
-- UNIQUE(election_id, position, voter_id) constraint from
-- 01_tables.sql makes double-voting impossible even under concurrent
-- requests — no manual transaction/lock logic needed, unlike the
-- Firestore version which had to hand-roll this with a transaction.

create or replace function cast_vote(p_election_id uuid, p_position text, p_candidate_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_election elections;
  v_voter profiles;
begin
  if auth.uid() is null then
    raise exception 'Log in to vote.';
  end if;

  select * into v_election from elections where id = p_election_id;
  if not found or v_election.status != 'active' then
    raise exception 'This election is not open for voting.';
  end if;

  select * into v_voter from profiles where id = auth.uid();
  if v_voter.status != 'active' or v_voter.member_class = 'New' then
    raise exception 'Your membership class is not eligible to vote yet.';
  end if;

  insert into votes (election_id, position, candidate_id, voter_id)
  values (p_election_id, p_position, p_candidate_id, auth.uid());
  -- If this voter already voted for this position, the UNIQUE
  -- constraint raises a clean "duplicate key" error here — the client
  -- catches it and shows "you've already voted."
end;
$$;

-- Only authenticated users can call it at all (further eligibility is
-- checked inside the function itself, above).
revoke execute on function cast_vote from public;
grant execute on function cast_vote to authenticated;
