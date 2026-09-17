## 2026-09-10 - URL Sanitization for User-Contributed Hardcopy & Media Links
**Vulnerability:** User-supplied links (`formScanUrl`, `scanUrl`, attachment URLs) embedded directly in `<a href="...">` can be exploited via `javascript:` or untrusted `data:` URIs for stored XSS.
**Learning:** React JSX automatically escapes HTML text nodes but does NOT sanitize `href` scheme protocols in `<a>` tags.
**Prevention:** Use `sanitizeUrl()` from `src/utils.js` when passing dynamic user URLs to `href` properties.
