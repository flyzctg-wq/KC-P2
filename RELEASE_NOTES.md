# 🚀 Kunjachaya Club — Official Release Notes & "What's in this build"

## [v2.2.0] — 2026-09-08
### 📊 Treasury Suite Usability & Motion Accessibility Overhaul (8 Issues Resolved)

1. **Button Styles Consolidation (Issue #1)**:
   - Replaced rainbow-colored one-off buttons in `Dues.jsx` with canonical `<Btn size="sm">` variants (`secondary` and `outline`), standardizing button styles across the treasury module.
2. **Accessible Metric Typography (Issue #2)**:
   - Upgraded all summary stats card sub-labels from `text-[10px] opacity-80` to readable `text-xs text-gray-500 dark:text-gray-400` (12px minimum accessible threshold).
3. **Single Document H1 Outline (Issue #3)**:
   - Demoted duplicate `<h1>` in `Dues.jsx` to `<h2>` to resolve heading outline ambiguity while preserving exact typography aesthetics.
4. **Elimination of Conflicting Duplicate Export CTAs (Issue #4)**:
   - Removed redundant "Generate Excel" and "Generate PDF" outline buttons from the top page header, consolidating table exports into a single toolbar directly above the data grid.
5. **Pagination Controls Spacing & Touch Ergonomics (Issue #5)**:
   - Added `pt-3.5 pb-1 mt-1` vertical breathing room to the table pagination bar and expanded the entries `<select>` height to `h-8` with accessible focus rings.
6. **Accessible TV Bulletin Motion Controls (Issue #6)**:
   - Added an accessible Pause/Resume toggle button (`Play` / `Pause`) to the live news ticker in `TvBulletin.jsx`.
   - Added `@media (prefers-reduced-motion: reduce)` support in `index.css` to halt marquee animations for users with motion sensitivity (WCAG 2.2.2).
7. **Consistent Vertical Alignment Axis (Issue #7)**:
   - Aligned the Treasury header, metric cards, action controls, filter bar, and data table to a uniform flush-left container axis, eliminating stair-stepped layout offsets.
8. **Semantic Color Palette for Metric Cards (Issue #8)**:
   - Replaced 7 competing saturated background colors (`#00897B`, `#0097A7`, `#5E35B1`, `#37474F`, `#0288D1`, `#26A69A`, `#673AB7`) with a clean, calm neutral card design.
   - Restricted high-contrast accent colors strictly to critical metrics (emerald for paid, rose for due amount, amber for unpaid).

---

## [v2.1.0] — 2026-09-08
### 🎨 Usability Heuristics & Accessibility Compliance Overhaul (10 Issues Resolved)

1. **Border-Radius Scale Standardization (Issue #1)**:
   - Consolidated border radius scale into 5 strict semantic tiers (`sm: 6px`, `md/DEFAULT: 8px`, `lg: 12px`, `xl/2xl/3xl: 16px`, `full: 9999px`) in `tailwind.config.js`.
   - Standardized `Modal` radius in `primitives.jsx` from `rounded-3xl` to `rounded-2xl` to ensure consistent interface rhythm.
2. **Button Styles Consolidation (Issue #2)**:
   - Consolidated action and banner buttons into 5 canonical design system variants (`primary`, `secondary`, `outline`, `ghost`, `danger`) + standard icon button layout.
3. **Legible Member Metadata & Typography (Issue #3)**:
   - Upgraded member card email address from `text-[11px] truncate opacity-70` to `text-xs truncate` (12px / 0.75rem) with accessible contrast token.
   - Updated Bengali name subtitle to `text-xs`.
4. **Accessible Badge Typography (Issue #4)**:
   - Upgraded shared `Badge` primitive from `text-[11px]` to `text-xs font-semibold px-2.5 py-0.5` to satisfy minimum readable body/tag text standards.
5. **Collapsible Sidebar Navigation (Issue #5)**:
   - Converted 21 flat sidebar navigation items into collapsible accordion categories (`Management`, `Communication`, `Governance`, `Community`, `Account`) in `Shell.jsx`.
   - Includes `aria-expanded` and animated chevrons. The category containing the currently active page auto-expands on view change.
6. **Consistent 3-Slot Member Action Icons (Issue #6)**:
   - Stabilized member card action column to a strict 3-icon rhythm (WhatsApp, Edit/View, Kick out).
   - Added disabled ghost states with descriptive `aria-label` and tooltip titles for members lacking phone numbers or protected against deletion.
7. **Refined Top Notification Banner (Issue #7)**:
   - Replaced aggressive saturated dark green banner with a refined, accessible tinted alert container (`bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200`) and balanced badge to restore visual prominence to the page heading and primary CTA.
8. **Proximity-Based CTA Alignment (Issue #8)**:
   - Updated `SectionTitle` in `primitives.jsx` to group the page title and primary CTA (`Invite member`) together on desktop (`sm:justify-start sm:gap-4`) following Gestalt proximity principles.
9. **Enlarged Touch Target for Bulletin 'Read' Button (Issue #9)**:
   - Increased button height from 21px to 32px (`h-8 px-3 rounded-lg text-xs font-semibold`) in `TvBulletin.jsx` for full WCAG 2.5.5 touch target compliance with focus-visible outline and screen reader label.
10. **Pinned Sidebar Footer (Issue #10)**:
    - Redesigned desktop sidebar in `Shell.jsx` into a fixed-height layout (`h-screen sticky top-0 flex flex-col`) with a scrollable middle navigation list and pinned bottom footer (`shrink-0 mt-auto border-t`).
    - Settings, Theme switcher, and Log out remain permanently visible above the fold on all standard screen heights without scrolling.

---

## [v2.0.0] — 2026-08-24
### 🛡️ Member Code System, Duplicate Prevention & EC Constitutional Enforcement

**New Features & Architecture**:

1. **Official Member Code (সদস্য নম্বর) — Assign & Edit**:
   - Admins can set an Official Member Code (e.g. `001`, `015`, `KC-001`) per member in **Admin → Members → Roles & Authority → Official Member Code** input field.
   - Code is stored in `memberCode` and `permissions.memberCode` in Supabase profiles.
   - Member Code badge (`#001`) appears on the member's own **Profile page header** for easy identification.
   - Member Code appears on money receipts, ID badges, member directory, and invoice vouchers.

2. **Member Code Uniqueness Enforcement**:
   - `saveRoles()` checks all other members before saving.
   - If the entered code is already taken → **blocked** with toast: `"Member Code #001 is already assigned to [Name]. Please choose a unique code."`
   - Case-insensitive and whitespace-normalised comparison.

3. **Duplicate Account Prevention (Invite Member Modal)**:
   - When issuing an invitation, the system now checks ALL existing accounts (active + pending) by **phone number** and **email**.
   - **Phone match** → blocked: `"A member account already exists for this phone number ([Name]). Duplicate accounts are not allowed."`
   - **Email match** → blocked: `"A member account already exists for this email ([Name]). Duplicate accounts are not allowed."`
   - Phone comparison strips all non-digit characters for robust matching (e.g. `017XXXXXXXX` == `+88017XXXXXXXX`).

4. **EC Post Seat Enforcement — Constitution Article 14**:
   - The post dropdown shows live seat occupancy for every post: `President (0/1)`, `Vice-President (1/2)`, `Executive Member (2/3)`, etc.
   - **Full posts are greyed out and disabled** in the dropdown.
   - A live indicator below the dropdown shows:
     - `✅ 1 seat(s) available (0/1 filled)` — when seats are free.
     - `⛔ Article 14: "President" is full (1/1). Held by: [Name]` — when full.
   - Attempting to save a full post is **blocked** with a constitution-referenced error toast.
   - Seat limits sourced from `EC_CONSTITUTIONAL_STRUCTURE` in `theme.js`.

5. **Member List Sorted by Member Code (Global)**:
   - Added `sortByMemberCode()` utility in `utils.js` using `localeCompare` with `{ numeric: true }` for natural sort (`001 < 002 < 010 < 100`).
   - Applied everywhere members are listed:
     - **Admin Members** (`Members.jsx`)
     - **Member Directory** (`Directory.jsx`)
     - **Admin Dues** (`Dues.jsx`)
     - **Payment History** (`PaymentHistory.jsx`)
   - Fallback sort: members without a code appear last; President/General Secretary first among unassigned; then alphabetical.

---

## [v1.9.0] — 2026-08-24
### 📺 Live TV Bulletin & News Ticker Engine (`TvBulletin.jsx`, `Shell.jsx`, `AdminNotices.jsx`)

**New Features & Architecture**:
1. **Designated Zone Placement (Mobile & Web)**:
   - **Android App**: Embedded directly below the top header and above page content.
   - **Web Desktop**: Positioned at the top of the workspace content pane.
2. **Broadcast-Style Visual Aesthetics**:
   - Live animated pulsing beacon with dynamic importance badges:
     - 🔴 **Breaking Bulletin (ব্রেকিং বুলেটিন)**: High-urgency red tone with siren icon.
     - 🟡 **Quick Notice (কুইক নোটিশ)**: Amber tone with lightning zap icon.
     - 🟢 **Important Announcement (জরুরি ঘোষণা)**: Emerald tone with alert triangle icon.
3. **Interactive Controls & Auto-Rotation**:
   - Cycles through multiple active notices every 9 seconds, with manual `<` and `>` pager and count indicator (e.g. `1/3`).
   - Touch/hover-to-pause marquee ticker.
   - Full notice detail modal with live remaining time countdown and direct button to the Notice Board.
   - Collapsible banner option.
4. **Notice Management & Duration Controls (`AdminNotices.jsx`)**:
   - Single checkbox toggle to broadcast any notice to the TV Bulletin.
   - 8-tier appearance duration presets: `1 Hour`, `6 Hours`, `12 Hours`, `24 Hours (1 Day)`, `3 Days`, `7 Days`, `Always (Until stopped)`, and `Custom Date & Time picker`.
   - Real-time auto-expiration filtering: automatically hides bulletins once their appearance time is up.
   - Quick one-click `TV ON` / `TV OFF` button on every notice card.
   - Notice Edit Modal with smart fallback title generator.
5. **Zero-Migration Supabase Serialization (`store.js` & `write.js`)**:
   - Safe embedded metadata storage (`<!--KC_BULLETIN:{...}-->`) with foreign-key-safe UUID validation.

---

## [v1.8.0] — 2026-08-23
### ⚙️ Dedicated Android App Settings & Accessibility Engine (`Settings.jsx`)

**New Features & Preferences**:
1. **🎨 Display & Accessibility**:
   - **4-Level Text & Font Scaling**: Small (14px), Normal (16px), Large (18px), Extra Large (20px) with dynamic root scaling and live Bengali/English preview card.
   - **Theme Selector**: Instant Light (লাইট), Dark (ডার্ক), and System Auto (সিস্টেম অনুকরণ) switcher.
   - **Language Toggle**: One-tap switch between Bengali and English.
2. **🔔 Notifications & Alert Controls**:
   - **Device Push Notifications**: Direct system permission trigger via `Notification.requestPermission()`.
   - **Custom Alert Toggles**: Notice board alerts, Monthly dues deadlines (10th of every month), Election & ballot alerts, Audio sound effects, and Haptic feedback.
3. **💾 Storage & Offline Cache Management**:
   - Live cache size calculator with "Clear Offline Cache" action button.
   - Data Saver Mode for mobile networks.
   - Manual "Sync Data Now" cloud synchronization button.
4. **🛡️ App Security & System Info**:
   - Society Registration reference, Constitutional framework (Articles 1–32), and Supabase PostgreSQL live connection indicator (`Connected 🟢`).
5. **Quick Navigation**:
   - Direct Settings gear shortcut in mobile top bar, desktop sidebar, and resident/admin navigation menus.

---

## [v1.7.1] — 2026-08-23
### 📷 Permanent Support Ticket Attachment Serialization Engine

**Problem**: Because the Postgres `tickets` table in Supabase does not have an explicit `attachments` column, attachments sent to Supabase were being omitted or rejected by the DB schema.

**Permanent Solution**:
- **Zero-Migration Embedded Serialization (`store.js` & `write.js`)**:
  - `write.js` now serializes `attachments` into the Postgres `description` text column using a special marker `<!--KC_ATTACHMENTS-->...<!--/KC_ATTACHMENTS-->`.
  - `store.js` automatically detects, parses, and reconstructs the full `attachments` array when loading tickets from Supabase, stripping the marker from the visible description text.
  - Multi-tier fallback maintains localStorage cache (`kc_ticket_att_{id}`) for fast instant load.
  - Photos now display reliably on all devices and views (Admin & Resident) across sessions and page refreshes.

---

## [v1.7.0] — 2026-08-23
### 📷 Support Ticket Photo & Video Attachments Engine Fix

**Problem**: Uploaded photos and short videos in resident support tickets were not appearing after saving/reloading, and in some views caused a media rendering fallback error.

**Root Causes & Solutions Fixed**:
1. **Attachment Data Persistence (`store.js` & `write.js`)**:
   - `store.js` tickets mapper was omitting `attachments` when fetching records, causing attachments to vanish upon state refresh. Added full `attachments` array and JSON string parsing support.
   - Added automatic localStorage caching for ticket media attachments (`kc_ticket_att_{id}`) to ensure instant local persistence and zero data loss across reloads.
   - `write.js` now includes the `attachments` payload during sync.
2. **Client-Side Image Auto-Compression**:
   - Camera and gallery photos are now auto-compressed via HTML5 Canvas (max 1280px dimension, JPEG 0.82) before storage. This prevents huge dataURL payloads and ensures smooth rendering on both mobile and desktop.
3. **Media Preview & Download**:
   - Added direct file download buttons inside the full-screen media preview modal for both photos and short videos.
   - Added image `onError` handling to prevent rendering crashes if an attachment format is invalid.
4. **Dark Mode UI Consistency**:
   - Fixed contrast and background tokens across `Tickets.jsx` and `admin/Tickets.jsx` to adhere to full dark/light theme tokens (`C.onSurface`, `C.onSurfaceVariant`, `C.surfaceContainer`).

---

## [v1.5.0] — 2026-08-23
### 🔍 Governance Audit Log — Signal vs. Noise Filter

**Problem**: The Audit Log was showing all activity entries including routine operational actions (emergency contact adds/removes, repeated membership form uploads, test entries, handover toggles, ticket submissions) — making it hard to find meaningful governance records.

**Solution**: Introduced a `NOISE_PATTERNS` blocklist in `Audit.jsx`. The Governance Audit Log now **only shows significant accountability-level actions**:
- ✅ **Kept**: Dues issued, financial transactions, membership approvals/rejections/kickouts, role changes, badge awards, election votes, official letter issuance, amendment ratifications, notice publish/delete, AGM minutes
- ❌ **Filtered out**: Emergency contact add/remove, uploaded membership forms, handover item completions, support ticket responses, event creation, RSVP actions, any entry containing "test"

**UI Improvements**:
- Renamed screen: "Audit log" → **"Governance Audit Log"**
- Category pills now show **entry count badges** (e.g., `Financial 3`, `Membership 12`)
- Colored category icons: 🟢 Financial, 🟣 Election, 🔵 Membership, ⚫ Other
- Added an info banner explaining that the full operational log is in the Activity Log page
- The full unfiltered log remains accessible via the **Activity Log** screen

---

## [v1.4.0] — 2026-08-23

### 🌐 Bengali (বাংলা) Localization Review & Quality Improvement

- **ব্লাড ব্যাংক** (`bloodBank`): Corrected from "রক্তব্যাংক" → **"ব্লাড ব্যাংক"** throughout all navigation, screen titles, and toast messages, as per community preference.
- **গঠনতন্ত্র** (`constitution`): Corrected from "সংবিধান" → **"গঠনতন্ত্র"** in all navigation labels and section headers to better reflect the club's official terminology.
- **Navigation Labels Improved**:
  - `directory` → সদস্য তালিকা (was: ডিরেক্টরি)
  - `paymentHistory` → চাঁদা আদায়ের ইতিহাস (was: বিল রিসিভ হিস্টোরি)
  - `tickets` → অভিযোগ ও সহায়তা (was: সহায়তা)
  - `activity` → কার্যক্রমের রেকর্ড (was: কার্যক্রম লগ)
  - `agm` → বার্ষিক সাধারণ সভা (was: এজিএম — now full Bengali)
  - `hotlines` → জরুরি হটলাইন (was: হটলাইন)
  - `badges` → সম্মাননা ব্যাজ (was: ব্যাজ)
  - `budget` → আয়-ব্যয় বাজেট (was: বাজেট)
  - `audit` → আর্থিক নিরীক্ষা (was: অডিট)
  - `handover` → দায়িত্ব হস্তান্তর (was: হস্তান্তর)
  - `events` → অনুষ্ঠানসমূহ (was: ইভেন্ট)
  - `officers` → কর্মকর্তাগণ (was: কর্মকর্তা)
  - `tagline` → একতাবদ্ধ আবাসিক সম্প্রদায় (was: একসাথে পরিচালিত সম্প্রদায়)
- **BloodBank Screen**: Updated screen title and save toast to use "ব্লাড ব্যাংক".
- All translations now use natural, idiomatic Bengali instead of transliterated English words.

---

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
