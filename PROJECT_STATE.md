# 📌 Kunjachaya Club — Project State & Checkpoint Record

**Last Updated**: 2026-08-24 14:40 (BST)  
**Git Branch**: `main` (Synced with `origin/main`)  
**Latest Version**: `v1.9.0`  
**Latest Commit**: `218b1d3` (`feat: add TV Bulletin news ticker with editable appearance duration and admin controls`)

---

## 🚀 Overview of Completed Work & Milestones

### 1. 📺 Live TV Bulletin & News Ticker Engine (`TvBulletin.jsx` & `Shell.jsx` — v1.9.0)
- **Designated Zone Placement**:
  - **Android App (Mobile)**: Positioned directly underneath the top navigation bar (`Admin · Kunjachaya [Theme] [Settings] [Globe] [Menu]`), above the main dashboard.
  - **Web Platform (Desktop)**: Positioned at the top of the main content workspace pane.
- **Broadcast-Style Live Aesthetics**: Live pulsing beacon with dynamic importance badges:
  - 🔴 **Breaking Bulletin (ব্রেকিং বুলেটিন)**: Urgent red glow with siren icon.
  - 🟡 **Quick Notice (কুইক নোটিশ)**: Amber highlight with lightning icon.
  - 🟢 **Important Announcement (জরুরি ঘোষণা)**: Emerald tone with alert icon.
- **Interactive Features**:
  - Multi-bulletin auto-rotation (every 9s) with manual `<` and `>` arrow pager.
  - Hover/touch to pause marquee scrolling.
  - Interactive click-to-read modal with issuance date, full message text, live countdown timer, and direct link to Notice board.
  - Collapsible banner option.
- **Notice Management & Duration Controls (`AdminNotices.jsx`)**:
  - Single-toggle TV Bulletin broadcast switch.
  - 8-level appearance duration presets (`1h`, `6h`, `12h`, `24h`, `3d`, `7d`, `Always`, `Custom DateTime`) with auto-expiration filter.
  - One-click `TV ON` / `TV OFF` toggle on every notice card.
  - Notice edit modal with smart fallback title generator.
- **Zero-Migration Serialization (`store.js` & `write.js`)**:
  - Embedded metadata serialization (`<!--KC_BULLETIN:{...}-->`) with UUID safety for Supabase foreign keys.

### 2. ⚙️ Android App Settings & Accessibility Engine (`Settings.jsx` — v1.8.0)
- **Display & Font Scale**: 4 levels of text scaling (`Small 14px`, `Normal 16px`, `Large 18px`, `Extra Large 20px`) with live interactive preview.
- **Theme Controls**: Light (☀️), Dark (🌙), System Auto (💻).
- **Language Switcher**: Instant bilingual toggle (`বাংলা` / `English`).
- **Notifications & Alerts**: Push notifications permission request (`Notification.requestPermission()`), custom toggles for notice announcements, monthly dues deadlines (10th of every month), election alerts, audio sounds, and haptic feedback.
- **Storage & Cache**: Live cache size calculation, one-tap cache clear, Data Saver mode, and manual cloud sync.
- **Navigation Shortcuts**: Integrated into Android mobile top bar, desktop sidebar, and drawer navigation.

### 3. 📷 Support Ticket Photo & Video Attachments Engine (`v1.7.0` & `v1.7.1`)
- **Embedded Serialization**: Solved Supabase DB zero-migration storage by safely serializing attachments inside `description` (`<!--KC_ATTACHMENTS-->...<!--/KC_ATTACHMENTS-->`), preventing schema mismatch errors.
- **Client-Side Image Auto-Compression**: Camera and gallery photos are compressed via HTML5 Canvas (max 1000px, 0.75 JPEG, ~50KB) before saving.
- **Media Preview & Download**: Full-screen preview modal with direct "Download" button for both photos and short videos.
- **Theme & Contrast**: Fully styled with dark/light mode tokens (`C.onSurface`, `C.surfaceContainer`).

### 4. 🛡️ Unified Log & Audit Tab System (`Audit.jsx` — v1.6.0)
- Merged redundant "আর্থিক নিরীক্ষা" and "কার্যক্রমের রেকর্ড" into a single **"লগ ও অডিট" (Log & Audit)** screen.
- **Tab 1: Governance Audit (গভর্ন্যান্স অডিট)**: Filtered with `NOISE_PATTERNS` to display only governance-level actions (dues issued, member approvals, elections, official letters, role updates) with category count badges and colored icons. Restricted to Council/Pres/Sec.
- **Tab 2: Activity Log (কার্যক্রম লগ)**: Full chronological operational record for all admins.

### 5. 🌐 Bengali (বাংলা) Natural Localization Overhaul (`theme.js` — v1.4.0)
- `bloodBank`: রক্তব্যাংক ➔ **ব্লাড ব্যাংক**
- `constitution`: সংবিধান ➔ **গঠনতন্ত্র**
- `directory`: ডিরেক্টরি ➔ **সদস্য তালিকা**
- `paymentHistory`: বিল রিসিভ হিস্টোরি ➔ **চাঁদা আদায়ের ইতিহাস**
- `agm`: এজিএম ➔ **বার্ষিক সাধারণ সভা**
- `audit`: অডিট ➔ **আর্থিক নিরীক্ষা**
- `budget`: বাজেট ➔ **আয়-ব্যয় বাজেট**
- `events`: ইভেন্ট ➔ **অনুষ্ঠানসমূহ**
- `hotlines`: হটলাইন ➔ **জরুরি হটলাইন**
- `badges`: ব্যাজ ➔ **সম্মাননা ব্যাজ**
- `handover`: হস্তান্তর ➔ **দায়িত্ব হস্তান্তর**
- `officers`: কর্মকর্তা ➔ **কর্মকর্তাগণ**
- `activity`: কার্যক্রম লগ ➔ **কার্যক্রমের রেকর্ড**
- `tickets`: সহায়তা ➔ **অভিযোগ ও সহায়তা**

### 6. 🗺️ Interactive Community Google Maps (`CommunityMap.jsx` — v1.3.0)
- Verified coordinates: `22.3810056° N, 91.8165975° E` (Bayezid Bostami Road, 2 No. Jalalabad Ward, Chattogram).
- Roadmap & Satellite View switcher.
- Direct GPS Navigation & Route calculation API (`দিকনির্দেশনা / Directions`).
- Integrated into **Resident Home**, **Hotlines**, and **Admin Dashboard**.

### 7. 📜 Official Letter Pad Invoice & Money Receipt (`InvoiceReceiptModal.jsx` — v1.2.0)
- Official club letterhead artwork (`/letterhead.png`).
- Unique receipt voucher codes (`KC/REC/2026/XXXX`).
- Member Code Badges (`#001`–`#015`), Itemized dues/waivers table, dynamic `PAID` / `DUE` seals.
- Tri-signatory signatures (Treasurer, General Secretary, President).
- Dedicated A4 print engine, HTML/PDF export, and WhatsApp receipt share.

---

## 🛠️ Architecture & Key Files

| Module | File Path | Description |
|---|---|---|
| **TV Bulletin Ticker** | `src/components/TvBulletin.jsx` | Broadcast news ticker bar, animations, multi-bulletin carousel, and modal preview |
| **App Entry & State** | `src/App.jsx` | Global auth, theme, fontSize, appSettings, and modal orchestration |
| **Routing Engine** | `src/Router.jsx` | Dynamic lazy chunk loading for all 28 resident & admin screens |
| **Shell & Navigation** | `src/components/Shell.jsx` | Responsive desktop sidebar, mobile topbar, bottom nav, TV bulletin slot & drawer |
| **Admin Notices** | `src/screens/admin/Notices.jsx` | Notice issuance, TV bulletin duration & importance controls, quick TV toggles |
| **Resident Notices** | `src/screens/Notices.jsx` | Notice board, bulletin status indicators, comments, and reactions |
| **Settings Screen** | `src/screens/Settings.jsx` | Display, notifications, cache, haptics & system info preferences |
| **Support Tickets** | `src/screens/Tickets.jsx` | Resident ticket creation, canvas photo compression, media preview |
| **Admin Tickets** | `src/screens/admin/Tickets.jsx` | Admin complaint review, evidence view/download, status reply |
| **Unified Log** | `src/screens/Audit.jsx` | Dual-tab Governance Audit & Activity Log with category counts |
| **Official Receipt** | `src/components/InvoiceReceiptModal.jsx` | Official letter pad money receipt engine & A4 print |
| **Official Letters** | `src/screens/admin/Letters.jsx` | Smarak register & official memo generator |
| **Community Map** | `src/components/CommunityMap.jsx` | Interactive Google Map & GPS route navigation |
| **Data Store** | `src/lib/store.js` | Supabase schema mapping, bulletin & attachment parser, and local cache |
| **Data Writer** | `src/lib/write.js` | Postgres diff syncer & embedded bulletin/attachment serializer |
| **Design System** | `src/theme.js` & `src/components/primitives.jsx` | Color palette, bilingual dictionaries, and UI primitives |

---

## 📋 How to Resume Work

1. **Development Server**: `npm run dev`
2. **Production Build**: `npm run build`
3. **Git Sync**: Working tree is 100% clean and pushed to `main`.
