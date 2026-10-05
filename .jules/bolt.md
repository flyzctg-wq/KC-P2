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

## 2026-09-13 - Memoizing Support Tickets & Notice Sorting in Admin & Member Screens
**Learning:** `src/screens/Tickets.jsx`, `src/screens/admin/Tickets.jsx`, and `src/screens/admin/Notices.jsx` re-sorted tickets and notices using `new Date()` construction on every render. Toggling response modals, attachment file upload/preview, typing comments, or toggling bulletin states caused redundant array allocation and sorting.
**Action:** Wrap sorted/filtered ticket arrays and notice arrays in `useMemo` blocks with `[db.tickets, session.id]`, `[db.tickets]`, and `[db?.notices]` dependencies.

## 2026-09-14 - Pre-computing Voucher Defaults & Single-Pass Expense Aggregation in Admin Expenses
**Learning:** In `src/screens/admin/Expenses.jsx`, `nextVoucher(expenses)` was re-evaluating regex patterns across all expense records inside initial form state initialization on every component render. Additionally, `totalAll`, `totalFiltered`, and `catTotals` executed multiple unmemoized array passes whenever local form inputs or modal states changed.
**Action:** Memoize `defaultVoucherNo` with `[expenses]` dependency and consolidate total expense calculations into a single-pass `useMemo` hook.

## 2026-09-14 - Pre-indexing Active Residents Lookup Map in Admin Dues
**Learning:** `AdminDues` in `src/screens/admin/Dues.jsx` called `activeResidents.find(u => u.id === d.residentId)` repeatedly inside `allDues.filter`, table `.map` rendering, `handleExportCSV`, and modal handlers, creating an $O(N \times M)$ linear search overhead on every search query character or filter change.
**Action:** Pre-index `activeResidents` into an $O(1)$ `Map` (`activeResidentsMap`) wrapped in `useMemo([activeResidents])` to reduce filtering and table lookup operations to $O(N + M)$.

## 2026-09-15 - Pre-parsing Message Text & Pre-resolving Sender Lookups in Community Chat Stream
**Learning:** `src/screens/Chat.jsx` ran `parseMessageText` (regex topic matching and string quote splitting) and `getMemberDetails` (lowercasing strings and Map lookups) inside the message list `.map()` JSX render loop on every message. Whenever the user typed a character in the composer or toggled emoji/search menus, every message in the stream was re-parsed and re-resolved.
**Action:** Extract `parseMessageText` to top-level and pre-attach `sender` and `parsed` properties directly in the `messages` `useMemo` block to eliminate per-render parsing and lookup overhead.

## 2026-09-16 - Memoizing AGM Events, Admin Activity Logs, and Officers Roster Array Operations
**Learning:** `AGM.jsx`, `src/screens/admin/Activity.jsx`, and `Officers.jsx` performed unmemoized array sorting using `new Date()` date creation and user/election array filtering on every component render. Form input updates or modal open/close toggles forced full array cloning, date object instantiation, and re-sorting/filtering operations.
**Action:** Wrap sorted event lists (`agmEvents`), activity logs (`activity`), induction records (`inductions`), and active officers/elections filters in `useMemo` hooks with database array references as dependencies.
