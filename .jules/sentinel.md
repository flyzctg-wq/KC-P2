## 2026-09-20 - URL Scheme Sanitization for User-Contributed Scan Links
**Vulnerability:** User-contributed member form scan URLs (`formScanUrl` / `scanUrl`) rendered directly in anchor `href` attributes without sanitization, creating DOM XSS vulnerability if `javascript:` protocol is injected.
**Learning:** Checking for protocol safety using `sanitizeUrl` from `src/utils.js` prevents malicious URI schemes while allowing valid HTTP/S, Mailto, Tel, Blob, and safe Data URIs.
**Prevention:** Always wrap external or user-provided links with `sanitizeUrl` before assigning them to `<a href={...}>` in React screens.
