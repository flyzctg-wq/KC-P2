## 2026-09-20 - URL Scheme Sanitization for User-Contributed Scan Links
**Vulnerability:** User-contributed member form scan URLs (`formScanUrl` / `scanUrl`) rendered directly in anchor `href` attributes without sanitization, creating DOM XSS vulnerability if `javascript:` protocol is injected.
**Learning:** Checking for protocol safety using `sanitizeUrl` from `src/utils.js` prevents malicious URI schemes while allowing valid HTTP/S, Mailto, Tel, Blob, and safe Data URIs.
**Prevention:** Always wrap external or user-provided links with `sanitizeUrl` before assigning them to `<a href={...}>` in React screens.

## 2026-09-10 - URL Sanitization Pattern for Dynamic Links
**Vulnerability:** User-controllable URLs (`formScanUrl`, `mediaPreviewModal.url`) rendered directly in anchor tags (`<a href={url}>`) were vulnerable to XSS via unsafe URI schemes like `javascript:` or `data:text/html`.
**Learning:** Checking protocol scheme via `new URL(url, "https://dummy.local").protocol` reliably detects disallowed protocols regardless of casing or whitespace trickery.
**Prevention:** Use `sanitizeUrl(url)` from `src/utils.js` on all user-supplied dynamic link attributes.

## 2026-09-10 - URL Sanitization for User-Contributed Hardcopy & Media Links
**Vulnerability:** User-supplied links (`formScanUrl`, `scanUrl`, attachment URLs) embedded directly in `<a href="...">` can be exploited via `javascript:` or untrusted `data:` URIs for stored XSS.
**Learning:** React JSX automatically escapes HTML text nodes but does NOT sanitize `href` scheme protocols in `<a>` tags.
**Prevention:** Use `sanitizeUrl()` from `src/utils.js` when passing dynamic user URLs to `href` properties.
