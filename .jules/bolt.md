## 2026-09-08 - Memoizing Filtered & Sorted Lists in React Screens
**Learning:** In screens such as `Directory` and `BloodBank`, list filtering and `localeCompare` sorting were executed unconditionally on every render. When modal visibility (`selectedUser`) or local configuration inputs (`myGroup`/`myDonor`) changed, the full array was re-filtered and re-sorted unnecessarily.
**Action:** Wrap filtering and sorting in `useMemo` with explicit dependencies on the query, filter, and dataset array (`db.users`).

## 2026-09-09 - Memoizing Activity Log Filtering & Sorting in Audit Screen
**Learning:** `Audit.jsx` processed the system activity log array (`db.activity`) by running regex tests (`NOISE_PATTERNS`), string category matching, and Date object sorting on every render cycle and whenever category filters (`cat`) or tabs were toggled.
**Action:** Wrap `auditEntries`, `auditFiltered`, and `activityEntries` in `useMemo` with dependencies `[db.activity]` and `[auditEntries, cat]` to skip redundant filtering and array sorting.

## 2026-09-10 - Memoizing Dashboard Metrics & Composition Breakdown
**Learning:** `AdminDashboard` (`src/screens/admin/Dashboard.jsx`) ran 13 array filters on `db.users` plus multi-pass traversals on `db.dues`, `db.tickets`, and `db.elections` on every render. `MEMBER_CLASSES.map()` recalculated total active members on every iteration.
**Action:** Compute counts and totals in a single O(N) pass inside `useMemo` depending on `[db.users, db.dues, db.tickets, db.elections, db.votes]`.
