# Schema migrations

This project's database schema now lives in version control under
`supabase/migrations/` — before this, it existed only in the Supabase
dashboard, which meant there was no record of what was actually
deployed and no way to recreate it from this repo alone.

## First: reconcile with what's actually live

The migration files here were **reconstructed** from what I know I
built for this project (schema, RLS, functions), not pulled directly
from your live database — there was nothing in version control to pull
*from* before now. I cross-checked them against every table your
client code actually queries and found no mismatches, which is a good
sign, but "no mismatches found" isn't the same as "verified identical."

Run this once to get the real, definitive picture:

```
npx supabase login
npx supabase link --project-ref rohbgdxkzlvbrvmckzeg
npx supabase db pull
```

This introspects your live database and writes a fresh migration file
reflecting exactly what's there. Compare it against the files already
in `supabase/migrations/`:

- **If they match** (or the differences are trivial — comment
  wording, formatting) — delete the newly-pulled file, you're already
  in sync, keep the reconstructed files as your history.
- **If they genuinely differ** — the pulled version is the truth (it
  came from the real database). Replace the mismatched reconstructed
  file(s) with it, or fold the differences in by hand, so
  `supabase/migrations/` becomes an accurate record going forward.

## Going forward: how to change the schema

Once reconciled, don't hand-edit the database via the Supabase
dashboard SQL Editor for anything you want tracked — write a migration
instead:

```
npx supabase migration new describe_your_change
```

This creates a new timestamped file in `supabase/migrations/`. Write
your SQL in it, then:

```
npx supabase db push
```

to apply it to the live project. This keeps the dashboard and this
repo from drifting apart again — which is exactly the state this
project was in before today.

If you (or anyone else on the project) ever *do* make a change directly
in the dashboard — resist that habit, but if it happens — run
`supabase db pull` again afterward to capture it, the same as the
reconciliation step above.

## What's in each file

| Migration | What it does |
|---|---|
| `20260814180000_initial_tables.sql` | All 24 tables, foreign keys, constraints |
| `20260814181000_rls_policies.sql` | Row Level Security — the permission model from `rules.md`, enforced server-side |
| `20260814182000_cast_vote_function.sql` | Atomic "one vote per resident per position" — a database constraint, not app logic |
| `20260814183000_rate_limits.sql` | Supporting tables/function for Edge Function rate limiting |
| `20260816180000_fix_user_deletion_cascade.sql` | Fixes "Database error deleting user" — see the file header for the reasoning per table |
