## 2026-09-10 - URL Sanitization Pattern for Dynamic Links
**Vulnerability:** User-controllable URLs (`formScanUrl`, `mediaPreviewModal.url`) rendered directly in anchor tags (`<a href={url}>`) were vulnerable to XSS via unsafe URI schemes like `javascript:` or `data:text/html`.
**Learning:** Checking protocol scheme via `new URL(url, "https://dummy.local").protocol` reliably detects disallowed protocols regardless of casing or whitespace trickery.
**Prevention:** Use `sanitizeUrl(url)` from `src/utils.js` on all user-supplied dynamic link attributes.
