## 2026-09-08 - Memoizing Filtered & Sorted Lists in React Screens
**Learning:** In screens such as `Directory` and `BloodBank`, list filtering and `localeCompare` sorting were executed unconditionally on every render. When modal visibility (`selectedUser`) or local configuration inputs (`myGroup`/`myDonor`) changed, the full array was re-filtered and re-sorted unnecessarily.
**Action:** Wrap filtering and sorting in `useMemo` with explicit dependencies on the query, filter, and dataset array (`db.users`).

## 2026-09-09 - Memoizing Activity Log Filtering & Sorting in Audit Screen
**Learning:** `Audit.jsx` processed the system activity log array (`db.activity`) by running regex tests (`NOISE_PATTERNS`), string category matching, and Date object sorting on every render cycle and whenever category filters (`cat`) or tabs were toggled.
**Action:** Wrap `auditEntries`, `auditFiltered`, and `activityEntries` in `useMemo` with dependencies `[db.activity]` and `[auditEntries, cat]` to skip redundant filtering and array sorting.

## 2026-09-10 - Single-Pass Aggregation in Admin Dashboard
**Learning:** `Dashboard.jsx` evaluated multiple array filters (`db.users`, `db.dues`, `db.tickets`, `db.elections`) on every render, including 12 redundant filter passes over `db.users` inside the `MEMBER_CLASSES.map()` loop to calculate class counts and max total active users.
**Action:** Compute all dashboard stats and member class counts in a single O(N) loop pass wrapped in `useMemo` with dependencies `[db.users, db.dues, db.tickets, db.elections, db.votes]`.

## 2026-09-10 - Optimizing Dashboard Metrics & Member Composition Aggregations
**Learning:** `AdminDashboard` ran multiple array filter/reduce passes on every render across `db.users`, `db.dues`, `db.tickets`, `db.elections`, and `db.votes`. Furthermore, `db.users.filter` was called inside `MEMBER_CLASSES.map` iteration.
**Action:** Wrap metric summary computations in `useMemo` and aggregate active member class counts in a single $O(M)$ pass over active users instead of $O(N \times M)$ repeated array scans inside JSX.

## 2026-09-10 - Memoizing Financial Aggregations and Admin Member Lists
**Learning:** In `AdminDues.jsx` and `AdminMembers.jsx`, 6x array `.filter()` and 5x `.reduce()` passes over financial dues/expenses and member list sorting (`sortByMemberCode`) ran on every render (e.g. typing in search inputs or toggling UI modals).
**Action:** Wrap financial aggregations and user list sorting in `useMemo` with explicit dependencies (`[allDues, allExpenses, selectedMonth]` and `[db?.users]`).

## 2026-09-10 - Memoizing Dues Filtering & Outstanding Balance Calculation
**Learning:** `Dues.jsx` filtered `db.dues` by `session.id`, sorted month strings via `localeCompare`, and summed `totalDue` on every render cycle (including modal state updates like toggling payment modals or receipt modals).
**Action:** Wrap `mine` array filtering/sorting in `useMemo` dependent on `[db.dues, session.id]` and `totalDue` sum calculation in `useMemo` dependent on `[mine]`.
