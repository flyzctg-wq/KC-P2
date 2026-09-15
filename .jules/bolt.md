## 2026-09-08 - Memoizing Filtered & Sorted Lists in React Screens
**Learning:** In screens such as `Directory` and `BloodBank`, list filtering and `localeCompare` sorting were executed unconditionally on every render. When modal visibility (`selectedUser`) or local configuration inputs (`myGroup`/`myDonor`) changed, the full array was re-filtered and re-sorted unnecessarily.
**Action:** Wrap filtering and sorting in `useMemo` with explicit dependencies on the query, filter, and dataset array (`db.users`).

## 2026-09-09 - Memoizing Activity Log Filtering & Sorting in Audit Screen
**Learning:** `Audit.jsx` processed the system activity log array (`db.activity`) by running regex tests (`NOISE_PATTERNS`), string category matching, and Date object sorting on every render cycle and whenever category filters (`cat`) or tabs were toggled.
**Action:** Wrap `auditEntries`, `auditFiltered`, and `activityEntries` in `useMemo` with dependencies `[db.activity]` and `[auditEntries, cat]` to skip redundant filtering and array sorting.

## 2026-09-10 - Memoizing Dashboard KPI & Composition Calculations in Admin Dashboard
**Learning:** `AdminDashboard.jsx` calculated KPIs and performed repetitive array filtering over `db.users` for every member class in `MEMBER_CLASSES.map()` on every render (e.g., language toggles, interactive map movements).
**Action:** Single-pass pre-compute member class distribution in `useMemo` and memoize overall KPI stats with dependencies on dataset arrays (`db.users`, `db.dues`, `db.tickets`, `db.elections`, `db.votes`).
