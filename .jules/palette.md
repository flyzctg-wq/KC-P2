## 2026-03-28 - Banner Accessibility & Focus Traps
**Learning:** Fixed bottom banners (like Cookie Consent or TV Bulletins) require explicit `role="region"`, `aria-label`, and `focus-visible` ring indicators to be properly navigable and operable by keyboard and screen reader users without trapping or obscuring focus.
**Action:** Always include landmark role, descriptive aria-label, `aria-expanded` state on disclosure triggers, and visible focus rings on modal/floating UI overlays.

## 2025-05-18 - Modal Dialog Keyboard Accessibility and Focus Indicators
**Learning:** Reusable Modal components and Buttons must support keyboard navigation by default (such as Escape key listener for modal dismissal and clear focus-visible outline indicators) to comply with WCAG 2.1 accessibility standards and provide smooth keyboard user experience across all modal instances.
**Action:** Ensure all primitive overlay dialog components attach keydown event listeners for Escape key handling when open and include `focus-visible:ring-2` styles on interactive elements.

## 2025-05-18 - Modal Keyboard Dismissal Pattern
**Learning:** Common modal primitives often handle overlay click and close button clicks, but miss global keyboard `Escape` key listeners. Supporting `Escape` keydown directly in the base `Modal` primitive instantly elevates WCAG keyboard accessibility across every modal in the app.
**Action:** When inspecting modal dialogs or overlay primitives, ensure a keydown event listener for `Escape` is present with proper cleanup on unmount.
