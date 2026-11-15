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

## 2026-10-31 - CSV Formula Injection (CWE-1236) in Data Exports
**Vulnerability:** Client-side CSV export generators in administrative modules (Audit, Expenses, Payment History, Dues) directly interpolated user strings (e.g. member names, action notes, payees, transaction references) into CSV rows without formula prefix neutralization. Spreadsheet tools (Excel, Calc) execute formulas starting with `=`, `+`, `-`, `@`, `\t`, or `\r`.
**Learning:** Quoting values in double quotes does not prevent spreadsheet programs from executing cell formulas. Cells must have formula-trigger characters neutralized by prefixing with a single quote (`'`), followed by RFC-4180 quote escaping (`""`).
**Prevention:** Use `sanitizeCSVCell()` from `src/utils.js` on every cell rendered into CSV export files.

## 2026-11-01 - Backslash Protocol-Relative Bypass and SVG Data URI XSS in URL Validation
**Vulnerability:** `isSafeUrl()` previously allowed `/\attacker.com` or `/\\attacker.com` because it only checked `startsWith("//")` before permitting `/` relative paths; WHATWG browsers normalize `\` to `/`, routing to external origins. In addition, `data:image/` permitted `data:image/svg+xml`, which executes scripts when clicked or navigated in `<a>` link tags.
**Learning:** Checking `/^\/[/\\\s]/.test(trimmed)` stops both backslash normalization and whitespace trickery. Explicitly rejecting `data:image/svg` prevents DOM-based script execution while keeping raster data URIs (`image/png`, `image/jpeg`, `image/webp`) functional.
**Prevention:** In URL validators, never assume single `/` implies internal relative path without checking for backslash (`\`) or whitespace; always disallow XML/SVG image MIME types for data URIs in navigable contexts.
