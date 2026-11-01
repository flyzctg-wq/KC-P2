## 2025-05-18 - Modal Keyboard Dismissal & Consent Banner Accessibility
**Learning:** Reusable primitives like `Modal` and floating utility banners like `ConsentBanner` require keyboard event listeners (`Escape` key) and explicit `aria-label`/focus indicators for optimal keyboard and screen-reader accessibility.
**Action:** Always attach `Escape` key handling on `Modal` overlays and ensure icon-only close buttons have explicit `aria-label` and `focus-visible` styles.

## 2025-05-19 - Primitive Component Keyboard Focus & Role Handling
**Learning:** Interactive `Card` components rendered as `<div>`s without `tabIndex` or `onKeyDown` listeners are invisible to keyboard navigation. Centralizing `role="button"`, `tabIndex={0}`, `focus-visible` rings, and Enter/Space handlers inside `Card` and `Btn` primitive components instantly elevates accessibility app-wide.
**Action:** Always provide keyboard event listeners and `focus-visible:ring` styles on primitive wrappers when an `onClick` prop is present.

## 2025-05-20 - Filter Pill Groups & Interactive Action Accessibility
**Learning:** Category filter pill bars require `role="group"`, descriptive `aria-label`, and `aria-pressed` states so screen readers announce active filters. Search inputs and action links (e.g., Call/WhatsApp/Email) require explicit bilingual `aria-label`s and `focus-visible` ring indicators for seamless keyboard and screen reader accessibility.
**Action:** Wrap filter pill lists in `role="group"`, supply `aria-pressed={isSelected}`, and ensure all search/action controls have `aria-label`s and `focus-visible` rings.

## 2025-05-21 - Emergency Hotline One-Tap Copy & Call UX
**Learning:** Emergency contact cards require one-tap Copy and Call actions with instant visual feedback (Check icon state and toast confirmation) alongside descriptive `aria-label`s specifying the target contact name to ensure optimal accessibility under stress or when using screen readers.
**Action:** Always provide explicit action buttons (Copy/Call) with name-specific `aria-label`s and visual feedback states on contact and hotline cards.
