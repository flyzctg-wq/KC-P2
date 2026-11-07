## 2025-05-18 - Modal Keyboard Dismissal & Consent Banner Accessibility
**Learning:** Reusable primitives like `Modal` and floating utility banners like `ConsentBanner` require keyboard event listeners (`Escape` key) and explicit `aria-label`/focus indicators for optimal keyboard and screen-reader accessibility.
**Action:** Always attach `Escape` key handling on `Modal` overlays and ensure icon-only close buttons have explicit `aria-label` and `focus-visible` styles.

## 2025-05-19 - Primitive Component Keyboard Focus & Role Handling
**Learning:** Interactive `Card` components rendered as `<div>`s without `tabIndex` or `onKeyDown` listeners are invisible to keyboard navigation. Centralizing `role="button"`, `tabIndex={0}`, `focus-visible` rings, and Enter/Space handlers inside `Card` and `Btn` primitive components instantly elevates accessibility app-wide.
**Action:** Always provide keyboard event listeners and `focus-visible:ring` styles on primitive wrappers when an `onClick` prop is present.

## 2025-05-20 - Filter Pill Groups & Interactive Action Accessibility
**Learning:** Category filter pill bars require `role="group"`, descriptive `aria-label`, and `aria-pressed` states so screen readers announce active filters. Search inputs and action links (e.g., Call/WhatsApp/Email) require explicit bilingual `aria-label`s and `focus-visible` ring indicators for seamless keyboard and screen reader accessibility.
**Action:** Wrap filter pill lists in `role="group"`, supply `aria-pressed={isSelected}`, and ensure all search/action controls have `aria-label`s and `focus-visible` rings.

## 2025-05-21 - Floating Banner & Disclosure Button Accessibility
**Learning:** Floating banners require `role="region"` with `aria-label` so landmark navigation works for assistive technologies. Inline expand/collapse buttons require `aria-expanded` and `aria-controls` linked to the target element's `id` along with explicit `focus-visible:ring` styles so keyboard users can track disclosure states clearly.
**Action:** Pair disclosure toggle controls with `aria-expanded` and `aria-controls`, set `role="region"` on floating notification overlays, and supply `focus-visible:ring-2` styles.

## 2025-05-22 - Skip-to-Content Navigation Link & Main Landmark Bypass
**Learning:** Dense application shells containing multi-group sidebars, top headers, and news tickers force keyboard and screen-reader users to tab through dozens of navigation links before reaching view content. Providing an accessible `sr-only focus:not-sr-only` bypass link pointing to `<main id="main-content" tabIndex={-1}>` dramatically speeds up keyboard navigation and conforms to WCAG 2.4.1 Bypass Blocks.
**Action:** Always include a localized `<a href="#main-content">` skip link at the top of application shells with high-contrast focus rings and ensure `<main>` accepts programmatic focus via `tabIndex={-1}`.
