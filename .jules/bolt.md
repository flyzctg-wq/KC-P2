## 2026-09-08 - Memoizing Filtered & Sorted Lists in React Screens
**Learning:** In screens such as `Directory` and `BloodBank`, list filtering and `localeCompare` sorting were executed unconditionally on every render. When modal visibility (`selectedUser`) or local configuration inputs (`myGroup`/`myDonor`) changed, the full array was re-filtered and re-sorted unnecessarily.
**Action:** Wrap filtering and sorting in `useMemo` with explicit dependencies on the query, filter, and dataset array (`db.users`).

## 2026-09-09 - Memoizing Activity Log Filtering & Sorting in Audit Screen
**Learning:** `Audit.jsx` processed the system activity log array (`db.activity`) by running regex tests (`NOISE_PATTERNS`), string category matching, and Date object sorting on every render cycle and whenever category filters (`cat`) or tabs were toggled.
**Action:** Wrap `auditEntries`, `auditFiltered`, and `activityEntries` in `useMemo` with dependencies `[db.activity]` and `[auditEntries, cat]` to skip redundant filtering and array sorting.

## 2026-09-10 - Memoizing Member List Filtering & Member Code Sorting in Admin Members Screen
**Learning:** `src/screens/admin/Members.jsx` filtered `db.users` for pending members and active members, and sorted active members using `sortByMemberCode` on every render cycle. State updates inside `AdminMembers` (switching tabs between active/pending, opening member modals, or editing roles) triggered redundant array filtering and sorting operations.
**Action:** Wrap `pending`, `activeUsers`, and `allUsers` calculations in `useMemo` with `[db?.users]` dependency to skip unnecessary array allocation and sorting operations on internal component state updates.

## 2026-09-11 - Pre-indexing User Lookups & Single-Pass KPI Reductions in Payment History
**Learning:** `PaymentHistory.jsx` performed `allUsers.find(u => u.id === d.residentId)` inside `allDues.map`, creating an $O(N \times M)$ linear scan. Additionally, KPI totals (`totalCollected`, `totalPending`, `totalDiscount`, `uniqueMembers`, `totalBill`) ran as 5 separate unmemoized array loops on every render.
**Action:** Build an $O(1)$ `Map` (`usersById`) via `useMemo` to reduce record enrichment to $O(N + M)$, and consolidate KPI reductions into a single-pass `useMemo` dependent on `filtered`.

## 2026-09-12 - Memoizing Resident Dues, Tickets & Notice Sorting on Resident Home Screen
**Learning:** `ResidentHome` in `src/screens/Home.jsx` re-ran dues filtering, ticket counting, active election searching, and notice cloning with `new Date()` sorting on every render cycle (e.g., interactive map events, language toggles, or toast updates). Unused derived variables like `myVotes` also allocated unnecessary memory.
**Action:** Consolidate screen KPI counts, active election lookup, and top 3 notice sorting into a single `useMemo` block with dependencies on database array references (`db.dues`, `db.elections`, `db.notices`, `db.tickets`).
