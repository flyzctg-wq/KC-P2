# Palette's UX Journal

## 2025-05-18 - Interactive Shell Profile Card Keyboard Accessibility
**Learning:** Profile cards rendered as `<div>` elements with `onClick` handlers block keyboard navigation (Tab/Enter/Space) and screen readers in sidebars and navigation drawers.
**Action:** Always render interactive user profile cards as semantic `<button type="button">` elements with explicit `aria-label` and `focus-visible` ring indicators.
