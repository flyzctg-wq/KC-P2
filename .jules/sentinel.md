## 2025-05-18 - URL Scheme Sanitization in User Attachment Downloads
**Vulnerability:** User-provided attachment URLs in ticket preview modals were rendered directly in anchor `href` attributes without scheme sanitization, allowing potential malicious URI schemes like `javascript:` or `data:text/html`.
**Learning:** Even when attachments originate from structured data models or file readers, anchor tags rendering `href={mediaUrl}` must sanitize against executable URI schemes.
**Prevention:** Always wrap external or user-sourced links with `sanitizeUrl` (or `isSafeUrl`) before binding to `href` or `src` attributes.
