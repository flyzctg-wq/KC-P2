# 🚀 Kunjachaya Club — Official Release Notes & "What's in this build"

## [v1.3.0] — 2026-08-23
### 🗺️ Interactive Community Google Maps Integration (কুঞ্জছায়া আবাসিক এলাকা মানচিত্র)
- **Live Google Maps Embed (`CommunityMap.jsx`)**:
  - Embedded exact coordinates (`22.3810056° N, 91.8165975° E`, Bayezid Bostami Road, 2 No. Jalalabad Ward, Chattogram).
  - Roadmap (রোডম্যাপ) and Satellite View (স্যাটেলাইট ভিউ) interactive switcher.
  - Direct GPS Navigation & Route Calculation API (`দিকনির্দেশনা / Directions`).
  - One-tap "Open in Google Maps" link to the verified community location.
  - One-tap "Copy GPS Coordinates & Address" and native Web Share API support.
  - Seamlessly integrated into **Resident Home**, **Emergency Hotlines**, and **Admin Dashboard**.

---

## [v1.2.0] — 2026-08-23
### 📜 Official Letter Pad (অফিসিয়াল প্যাড) Invoice & Money Receipt Engine
- **Branded Letterhead Vouchers (`InvoiceReceiptModal.jsx`)**:
  - Upgraded all invoice and receipt modals to use the club's official letterhead artwork (`/letterhead.png`).
  - Includes club header, logo mark, bilingual institution name, unique receipt code (`KC/REC/2026/XXXX`), and issue date.
  - Member billing card with name, Bengali name, **Member Code Badge (`#001`–`#015`)**, unit, and phone.
  - Itemized financial breakdown table with monthly dues, waivers/discounts, and net payable/received amounts.
  - Dynamic **`PAID / পরিশোধিত`** (Green seal) and **`DUE / বকেয়া`** (Red seal) status stamps.
  - Official leadership signatures for **Treasurer (গোলাম সরোয়ার জনি)**, **General Secretary (খালিদ হাসান)**, and **President (জাকারিয়া হাছান)**.
  - Dedicated **A4 Print Engine** (hidden iframe print with 100% letterhead fidelity), **HTML/PDF export**, and **WhatsApp digital receipt sharing**.
  - Accessible from **Admin Dues Management**, **Financial Ledger / Payment History**, and **Resident Dues History**.

---

## [v1.1.0] — 2026-08-23
### 🌓 Dark Mode Contrast & Color Hierarchy Overhaul
- **High-Contrast Readability**:
  - Overhauled text and background tokens across dark mode to eliminate low-contrast grey text and popped elements.
  - Added semantic container variables (`successContainer`, `onSuccessContainer`, `infoContainer`, `onInfoContainer`).
  - Added contrast enforcers in `index.css` for `text-gray-*`, `bg-gray-*`, and status badges.
- **📷 Profile Live Camera & WebRTC Integration**:
  - Added live WebRTC camera capture modal with passport face-alignment guide and front/back camera switching.
  - Action sheet for choosing between Live Camera, File Upload, or Avatar presets.

---

## [v1.0.0] — 2026-08-23
### 🏛️ Complete Bilingual Kunjachaya Club Platform
- **Founding Members & Roles**:
  - Full support for 15 founding members (`001`–`015`) in English and Bengali.
- **Bilingual Documentation**:
  - Interactive User Manual & Help Guide (`USER_MANUAL.md`) covering all 18 resident and admin modules.
- **Multi-Platform Support**:
  - Android APK build target and responsive Web Platform (`Shell.jsx`).

---

### 📦 Release Verification Checklist:
- [x] Production build passes clean (`npm run build` in <10s)
- [x] Zero linting or esbuild syntax errors
- [x] High-resolution print formatting tested with CSS `@media print`
- [x] Live Google Maps API responsive layout verified on mobile & desktop
- [x] Git repo updated at `https://github.com/flyzctg-wq/KC-P2.git`
