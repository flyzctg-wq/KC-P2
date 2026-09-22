## 2025-05-18 - Modal Keyboard Dismissal & Consent Banner Accessibility
**Learning:** Reusable primitives like `Modal` and floating utility banners like `ConsentBanner` require keyboard event listeners (`Escape` key) and explicit `aria-label`/focus indicators for optimal keyboard and screen-reader accessibility.
**Action:** Always attach `Escape` key handling on `Modal` overlays and ensure icon-only close buttons have explicit `aria-label` and `focus-visible` styles.

## 2025-05-19 - Primitive Component Keyboard Focus & Role Handling
**Learning:** Interactive `Card` components rendered as `<div>`s without `tabIndex` or `onKeyDown` listeners are invisible to keyboard navigation. Centralizing `role="button"`, `tabIndex={0}`, `focus-visible` rings, and Enter/Space handlers inside `Card` and `Btn` primitive components instantly elevates accessibility app-wide.
**Action:** Always provide keyboard event listeners and `focus-visible:ring` styles on primitive wrappers when an `onClick` prop is present.
