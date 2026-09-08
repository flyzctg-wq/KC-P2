## 2026-09-08 - Memoizing Filtered & Sorted Lists in React Screens
**Learning:** In screens such as `Directory` and `BloodBank`, list filtering and `localeCompare` sorting were executed unconditionally on every render. When modal visibility (`selectedUser`) or local configuration inputs (`myGroup`/`myDonor`) changed, the full array was re-filtered and re-sorted unnecessarily.
**Action:** Wrap filtering and sorting in `useMemo` with explicit dependencies on the query, filter, and dataset array (`db.users`).
