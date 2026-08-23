# 📌 Kunjachaya Club — Project State & Checkpoint Record

**Last Updated**: 2026-08-23 17:30 (BST)  
**Git Branch**: `main` (Synced with `origin/main`)  
**Latest Version**: `v1.8.0`  
**Latest Commit**: `bdcdb67` (`feat(settings): add dedicated Android app settings & accessibility engine - v1.8.0`)

---

## 🚀 Overview of Completed Work & Milestones

### 1. ⚙️ Android App Settings & Accessibility Engine (`Settings.jsx` — v1.8.0)
- **Display & Font Scale**: 4 levels of text scaling (`Small 14px`, `Normal 16px`, `Large 18px`, `Extra Large 20px`) with live interactive preview.
- **Theme Controls**: Light (☀️), Dark (🌙), System Auto (💻).
- **Language Switcher**: Instant bilingual toggle (`বাংলা` / `English`).
- **Notifications & Alerts**: Push notifications permission request (`Notification.requestPermission()`), custom toggles for notice announcements, monthly dues deadlines (10th of every month), election alerts, audio sounds, and haptic feedback.
- **Storage & Cache**: Live cache size calculation, one-tap cache clear, Data Saver mode, and manual cloud sync.
- **Navigation Shortcuts**: Integrated into Android mobile top bar, desktop sidebar, and drawer navigation.

### 2. 📷 Support Ticket Photo & Video Attachments Engine (`v1.7.0` & `v1.7.1`)
- **Embedded Serialization**: Solved Supabase DB zero-migration storage by safely serializing attachments inside `description` (`<!--KC_ATTACHMENTS-->...<!--/KC_ATTACHMENTS-->`), preventing schema mismatch errors.
- **Client-Side Image Auto-Compression**: Camera and gallery photos are compressed via HTML5 Canvas (max 1000px, 0.75 JPEG, ~50KB) before saving.
- **Media Preview & Download**: Full-screen preview modal with direct "Download" button for both photos and short videos.
- **Theme & Contrast**: Fully styled with dark/light mode tokens (`C.onSurface`, `C.surfaceContainer`).

### 3. 🛡️ Unified Log & Audit Tab System (`Audit.jsx` — v1.6.0)
- Merged redundant "আর্থিক নিরীক্ষা" and "কার্যক্রমের রেকর্ড" into a single **"লগ ও অডিট" (Log & Audit)** screen.
- **Tab 1: Governance Audit (গভর্ন্যান্স অডিট)**: Filtered with `NOISE_PATTERNS` to display only governance-level actions (dues issued, member approvals, elections, official letters, role updates) with category count badges and colored icons. Restricted to Council/Pres/Sec.
- **Tab 2: Activity Log (কার্যক্রম লগ)**: Full chronological operational record for all admins.

### 4. 🌐 Bengali (বাংলা) Natural Localization Overhaul (`theme.js` — v1.4.0)
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

### 5. 🗺️ Interactive Community Google Maps (`CommunityMap.jsx` — v1.3.0)
- Verified coordinates: `22.3810056° N, 91.8165975° E` (Bayezid Bostami Road, 2 No. Jalalabad Ward, Chattogram).
- Roadmap & Satellite View switcher.
- Direct GPS Navigation & Route calculation API (`দিকনির্দেশনা / Directions`).
- Integrated into **Resident Home**, **Hotlines**, and **Admin Dashboard**.

### 6. 📜 Official Letter Pad Invoice & Money Receipt (`InvoiceReceiptModal.jsx` — v1.2.0)
- Official club letterhead artwork (`/letterhead.png`).
- Unique receipt voucher codes (`KC/REC/2026/XXXX`).
- Member Code Badges (`#001`–`#015`), Itemized dues/waivers table, dynamic `PAID` / `DUE` seals.
- Tri-signatory signatures (Treasurer, General Secretary, President).
- Dedicated A4 print engine, HTML/PDF export, and WhatsApp receipt share.

---

## 🛠️ Architecture & Key Files

| Module | File Path | Description |
|---|---|---|
| **App Entry & State** | `src/App.jsx` | Global auth, theme, fontSize, appSettings, and modal orchestration |
| **Routing Engine** | `src/Router.jsx` | Dynamic lazy chunk loading for all 28 resident & admin screens |
| **Shell & Navigation** | `src/components/Shell.jsx` | Responsive desktop sidebar, mobile topbar, bottom nav & drawer |
| **Settings Screen** | `src/screens/Settings.jsx` | Display, notifications, cache, haptics & system info preferences |
| **Support Tickets** | `src/screens/Tickets.jsx` | Resident ticket creation, canvas photo compression, media preview |
| **Admin Tickets** | `src/screens/admin/Tickets.jsx` | Admin complaint review, evidence view/download, status reply |
| **Unified Log** | `src/screens/Audit.jsx` | Dual-tab Governance Audit & Activity Log with category counts |
| **Official Receipt** | `src/components/InvoiceReceiptModal.jsx` | Official letter pad money receipt engine & A4 print |
| **Official Letters** | `src/screens/admin/Letters.jsx` | Smarak register & official memo generator |
| **Community Map** | `src/components/CommunityMap.jsx` | Interactive Google Map & GPS route navigation |
| **Data Store** | `src/lib/store.js` | Supabase schema mapping, attachment parser, and local cache |
| **Data Writer** | `src/lib/write.js` | Postgres diff syncer & embedded attachment serializer |
| **Design System** | `src/theme.js` & `src/components/primitives.jsx` | Color palette, bilingual dictionaries, and UI primitives |

---

## 📋 How to Resume Work

1. **Development Server**: `npm run dev`
2. **Production Build**: `npm run build`
3. **Git Sync**: Working tree is 100% clean and pushed to `main`.
