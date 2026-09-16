## 2025-05-18 - Modal Keyboard Dismissal Pattern
**Learning:** Common modal primitives often handle overlay click and close button clicks, but miss global keyboard `Escape` key listeners. Supporting `Escape` keydown directly in the base `Modal` primitive instantly elevates WCAG keyboard accessibility across every modal in the app.
**Action:** When inspecting modal dialogs or overlay primitives, ensure a keydown event listener for `Escape` is present with proper cleanup on unmount.
