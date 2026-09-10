## 2026-09-08 - Memoizing Filtered & Sorted Lists in React Screens
**Learning:** In screens such as `Directory` and `BloodBank`, list filtering and `localeCompare` sorting were executed unconditionally on every render. When modal visibility (`selectedUser`) or local configuration inputs (`myGroup`/`myDonor`) changed, the full array was re-filtered and re-sorted unnecessarily.
**Action:** Wrap filtering and sorting in `useMemo` with explicit dependencies on the query, filter, and dataset array (`db.users`).

## 2026-09-09 - Single-Pass Aggregation in Dashboard KPI Cards & Composition Breakdown
**Learning:** In `AdminDashboard`, computing multiple stats (`pendingMembers`, `collected`, `outstanding`, `openTickets`, `activeElections`) and rendering mapped distribution lists (e.g. `MEMBER_CLASSES`) previously executed `Array.prototype.filter` repeatedly across `db.users`, `db.dues`, `db.tickets`, and `db.elections` on every render pass. In particular, iterating inside `.map()` re-ran `$O(N)` filters twice per item class.
**Action:** Consolidate multi-collection metrics into a single `useMemo` block with single-pass `for` loops and map counts to achieve $O(N)$ complexity and 0 array allocations during renders.
