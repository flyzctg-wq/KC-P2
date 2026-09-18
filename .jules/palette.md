## 2026-03-28 - Banner Accessibility & Focus Traps
**Learning:** Fixed bottom banners (like Cookie Consent or TV Bulletins) require explicit `role="region"`, `aria-label`, and `focus-visible` ring indicators to be properly navigable and operable by keyboard and screen reader users without trapping or obscuring focus.
**Action:** Always include landmark role, descriptive aria-label, `aria-expanded` state on disclosure triggers, and visible focus rings on modal/floating UI overlays.
