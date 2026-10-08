## 2025-05-18 - URL Scheme Sanitization for User Links
**Vulnerability:** User-controlled document/image URLs (e.g. `formScanUrl`) placed directly into `<a href>` or `<img src>` can trigger DOM-based XSS if assigned `javascript:` or `data:text/html` schemes.
**Learning:** Checking for protocol prefixes with an allowlist (`http:`, `https:`, `mailto:`, `tel:`, `blob:`, `data:image/`) prevents URI scheme execution when rendering dynamic links.
**Prevention:** Use `sanitizeUrl(url)` from `src/utils.js` whenever rendering user-supplied or external URLs in link attributes or media sources.

## 2026-03-31 - HTML Sanitization for Printable Document Generators
**Vulnerability:** Dynamic HTML documents generated for print/download (e.g., official letterheads and invoice receipts written to iframes or windows via `doc.write`) did not escape user-supplied strings, enabling HTML/script injection.
**Learning:** Printing engines and document exporters that build HTML strings manually must sanitize all interpolated parameters regardless of source.
**Prevention:** Always wrap interpolated user strings in `escapeHtml()` from `src/utils.js` when building dynamic HTML document strings.
## 2025-05-19 - Protocol-Relative URL Bypass in Link Sanitization
**Vulnerability:** `isSafeUrl()` previously allowed protocol-relative URLs (e.g., `//attacker.com`) because `.startsWith("/")` evaluated to `true`. This could allow attackers to bypass sanitization and redirect users off-site.
**Learning:** Checking `trimmed.startsWith("//")` prior to single-slash relative path checks prevents protocol-relative URL bypasses.
**Prevention:** Ensure `isSafeUrl()` explicitly rejects `//` prefixes before validating single-slash `/` relative application paths.
