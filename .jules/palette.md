## 2025-05-18 - Modal Dialog Keyboard Accessibility and Focus Indicators

**Learning:** Reusable Modal components and Buttons must support keyboard navigation by default (such as Escape key listener for modal dismissal and clear focus-visible outline indicators) to comply with WCAG 2.1 accessibility standards and provide smooth keyboard user experience across all modal instances.

**Action:** Ensure all primitive overlay dialog components attach keydown event listeners for Escape key handling when open and include `focus-visible:ring-2` styles on interactive elements.
