-- schema/04_rate_limits.sql

-- Idempotency guard for the PipraPay webhook (see functions/piprapay-webhook).
create table processed_payments (
  transaction_id text primary key,
  processed_at timestamptz not null default now()
);
alter table processed_payments enable row level security;
-- No policies at all: only the service-role key (used by the Edge
-- Function) can touch this table. Even authenticated users get zero
-- access, which is what we want — residents have no reason to read or
-- write it.

-- Simple rate limiter shared by the Edge Functions.
create table rate_limits (
  key text primary key,
  count int not null default 1,
  window_start timestamptz not null default now()
);
alter table rate_limits enable row level security;
-- No client policies here either — only called via the SECURITY
-- DEFINER function below, or the service-role key.

create or replace function check_rate_limit(p_key text, p_max int default 10)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row rate_limits;
  v_fresh boolean;
begin
  select * into v_row from rate_limits where key = p_key for update;
  if not found then
    insert into rate_limits (key, count, window_start) values (p_key, 1, now());
    return true;
  end if;

  v_fresh := (now() - v_row.window_start) > interval '1 minute';
  if v_fresh then
    update rate_limits set count = 1, window_start = now() where key = p_key;
    return true;
  end if;

  if v_row.count >= p_max then
    return false; -- caller should reject the request
  end if;

  update rate_limits set count = count + 1 where key = p_key;
  return true;
end;
$$;

revoke execute on function check_rate_limit from public;
grant execute on function check_rate_limit to authenticated, service_role;
