# 🏡 Kunjachaya Club Management Platform (KC-P2)

> A constitutional community management platform for **Kunjachaya Residential Area** (*কুঞ্জছায়া আবাসিক এলাকা*), built as a modern unified web app and signed Android APK powered by **Supabase (PostgreSQL + Auth + Storage + RLS)** and **Capacitor Android**.

---

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Live Deployments & Downloads](#-live-deployments--downloads)
- [Key Features](#-key-features)
- [Constitutional Governance Model](#-constitutional-governance-model)
- [Role & Permission Matrix](#-role--permission-matrix)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Repository Structure](#-repository-structure)
- [Getting Started](#-getting-started)
- [Database & Security (RLS)](#-database--security-rls)
- [CI/CD & Android APK Automation](#-cicd--android-apk-automation)
- [Documentation Index](#-documentation-index)

---

## 🌟 Project Overview

**Kunjachaya Club (KC-P2)** replaces manual paperwork and generic management scripts with a software system strictly engineered around the **Written Constitution of Kunjachaya Residential Area** (*কুঞ্জছায়া সমাজ কল্যাণ পরিষদ গঠনতন্ত্র*).

Every feature — from member admission, official invitations, emergency blood bank requests, dues management with PipraPay, to constitutional amendments and secret-ballot elections — directly mirrors the club's constitutional articles (ধারা ১–৩১).

---

## 🚀 Live Deployments & Downloads

| Platform | Deployment / Download | Status |
|---|---|---|
| 🌐 **Web App** | [https://kc-p2.vercel.app](https://kc-p2.vercel.app) | Live (Vercel) |
| 📱 **Android APK** | [GitHub Releases](https://github.com/flyzctg-wq/KC-P2/releases) | Auto-built on `main` push |
| 🗄️ **Database Backend** | Supabase Postgres (Singapore `ap-southeast-1`) | Live with RLS |

---

## 🎯 Key Features

### 1. 👥 Member Directory & Quick Contact
- Real-time resident roster searchable by **Name, Bengali Name, Block, Unit, Mobile Number, or Email**.
- Direct **One-Click Phone Call (`tel:`)** and **WhatsApp Chat (`https://wa.me/`)** action buttons on every resident card.
- **Quick Profile View Modal**: Displays blood group, profession, education, NID/ID, and joining date.

### 2. 🩸 Emergency Blood Bank Directory
- Filter by blood groups (`O+`, `O-`, `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`).
- Resident opt-in system (*Available to Donate* toggle).
- Direct **Emergency Phone Call** and **Pre-Composed Urgent WhatsApp Blood Request Message** targeting listed donors.

### 3. 🔐 Registration, Invitations & Approval Flow (ধারা-১০)
- **Standard Registration**: New signups automatically start in `pending` status, requiring Article 10 approval by authorized leadership before login is granted.
- **Official Top-Tier Invitation Links**: President and General Secretary can generate official pre-approved invitation links (`https://kc-p2.vercel.app/?invite=...&email=...`).
- When opened, the app automatically detects the invitation, switches to the account setup screen, and pre-fills member credentials.

### 4. ⚖️ Member Removal & Mutual Protection (ধারা-১৪, ১৭)
- **Top-Tier Leaders (President & General Secretary)**: Can kick out/remove any resident or officer.
- **Mutual Protection Rule**: President and General Secretary **cannot kick out each other**, and **neither can change the other's Executive Committee post** (Article 14 protection).
- **Executive Admins (`canManageMembers`)**: Can remove standard residents, but cannot remove top-tier leaders or themselves.
- **Permanent Postgres Cascade Deletion**: Deleting a member cleans up all child references (`dues`, `tickets`, `comments`, `votes`) so records never reappear.

### 5. 💳 Financials, Dues & PipraPay Payments (ধারা-১৭.৫)
- Automated monthly due generation across blocks.
- Real payment integration with **PipraPay** checkout gateway and automated webhook receipt confirmation.
- Printable PDF payment vouchers and ledger audit history.

### 6. 🗳️ Secret-Ballot Elections (ধারা-২১)
- Candidate nominations, manifesto reviews, and ballot casting.
- Enforces atomic database-level vote integrity via the `cast_vote()` Postgres stored procedure (`UNIQUE(election_id, position, voter_id)`).

### 7. 📜 Constitutional Amendments & Standing Council (ধারা-১৩খ, ৩০)
- Constitutional amendment proposals with tracked article references.
- Standing Council voting chamber for Founders and Top-Tier leadership.

---

## 🏛️ Constitutional Governance Model

```
                     ┌─────────────────────────────────────────┐
                     │            GENERAL ASSEMBLY             │
                     │          (All Active Members)           │
                     └────────────────────┬────────────────────┘
                                          │ Elects / Governs
                     ┌────────────────────┴────────────────────┐
                     │          STANDING COUNCIL               │
                     │  (Founders + President + Gen Secretary) │
                     └────────────────────┬────────────────────┘
                                          │ Oversees Amendments & Handover
                     ┌────────────────────┴────────────────────┐
                     │      EXECUTIVE COMMITTEE (15 Seats)     │
                     ├─────────────────────────────────────────┤
                     │  • President (Top-Tier)                 │
                     │  • 2× Vice President                    │
                     │  • General Secretary (Top-Tier)         │
                     │  • Assistant General Secretary          │
                     │  • Treasurer (Financial Lead)           │
                     │  • Organizing Secretary                 │
                     │  • Social Welfare Secretary             │
                     │  • Literature & Culture Secretary       │
                     │  • Publicity Secretary                  │
                     │  • Sports Secretary                     │
                     │  • Women's Affairs Secretary            │
                     │  • 3× Executive Members                 │
                     └─────────────────────────────────────────┘
```

---

## 🔑 Role & Permission Matrix

| Capability | President | General Secretary | Treasurer | EC Member (`canManage...`) | General Resident |
|---|:---:|:---:|:---:|:---:|:---:|
| **Approve Pending Members** (ধারা-১০) | ✅ | ✅ | ❌ | ✅ (`canManageMembers`) | ❌ |
| **Issue Official Pre-Approved Invites** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Kick Out Standard Resident** | ✅ | ✅ | ❌ | ✅ (`canManageMembers`) | ❌ |
| **Kick Out President / General Secretary** | ❌ (Blocked) | ❌ (Blocked) | ❌ | ❌ | ❌ |
| **Edit Committee Posts & Permissions** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Issue & Manage Dues** (ধারা-১৭.৫) | ✅ | ✅ | ✅ | ✅ (`canManageFinancials`) | ❌ |
| **Publish Notices & Announcements** | ✅ | ✅ | ❌ | ✅ (`canManageNotices`) | ❌ |
| **Resolve Resident Complaints** | ✅ | ✅ | ❌ | ✅ (`canManageComplaints`) | ❌ |
| **Vote on Constitutional Amendments** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Cast Election Ballot** (ধারা-২১) | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 💻 Architecture & Tech Stack

```
   ┌────────────────────────────────────────────────────────┐
   │                  CLIENT APPLICATIONS                   │
   │  ┌───────────────────────────┐  ┌───────────────────┐  │
   │  │   Vite + React (Web PWA)  │  │   Capacitor App   │  │
   │  │    https://kc-p2.vercel   │  │   (Android APK)   │  │
   │  └─────────────┬─────────────┘  └─────────┬─────────┘  │
   └────────────────┼──────────────────────────┼────────────┘
                    │                          │
                    ▼                          ▼
   ┌────────────────────────────────────────────────────────┐
   │                  SUPABASE CLOUD BACKEND                │
   │  • GoTrue Auth (Bcrypt hash, JWT sessions)             │
   │  • PostgreSQL 15 Database (Row-Level Security Enabled) │
   │  • Realtime Replication Engine (Live Data Subscriptions│
   │  • Edge Functions (PipraPay Checkout & Webhooks)       │
   └────────────────────────────────────────────────────────┘
```

- **Frontend Core**: React 18, Vite 5, Tailwind CSS, Lucide Icons
- **Mobile Engine**: Capacitor 6 (Android Bridge)
- **Backend Database**: Supabase PostgreSQL 15 with Postgres RLS
- **Authentication**: Supabase GoTrue Auth (Email/Password)
- **Payments**: PipraPay Payment Gateway Integration
- **CI/CD**: GitHub Actions (`android-build.yml`) & Vercel Automated Deployments

---

## 📂 Repository Structure

```
KC P2/
├── kunjachaya-mobile/             # Unified Mobile & Web Frontend (React + Vite + Capacitor)
│   ├── .github/workflows/        # GitHub Actions CI/CD (Android APK Build & Release)
│   │   └── android-build.yml
│   ├── android/                  # Native Android Studio project generated by Capacitor
│   │   ├── app/src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   └── res/              # App icons, splash screens, drawables
│   │   └── build.gradle
│   ├── src/
│   │   ├── components/           # Shell, AuthScreen, Primitives, SplashIntro, Modals
│   │   ├── lib/                  # supabase.js, store.js, write.js, authBridge.js
│   │   ├── screens/              # Directory, BloodBank, Dues, Notices, Elections, AGM
│   │   │   └── admin/            # Members.jsx (Kick-out & Invites), Officers.jsx, Budget.jsx
│   │   ├── theme.js              # Colors, Bengali/English i18n STR, Badges catalog
│   │   ├── utils.js              # getAppBaseUrl(), cleanPhone(), formatters
│   │   └── App.jsx               # App container, auth state, router & session restore
│   ├── capacitor.config.json     # Capacitor appId, appName, androidScheme
│   ├── vite.config.js            # Vite build configuration
│   └── package.json
│
├── README.md                      # Master Documentation (This file)
├── WORKFLOW.md                    # Constitutional & Operations Workflow Guide
├── BUILD.md                       # Complete Build & Deployment Manual
├── WEB_BUILD_GUIDE.md             # Web PWA & Vercel Guide
├── GRADLE_BUILD_GUIDE.md          # Android Gradle & APK Signing Guide
└── SUPER_ADMIN_SETUP.md           # First-Officer Bootstrap Guide
```

---

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/flyzctg-wq/KC-P2.git
cd KC-P2
```

### 2. Configure Environment Variables
Create `.env` in `kunjachaya-mobile/`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=https://kc-p2.vercel.app
```

### 3. Install dependencies and run locally
```bash
npm install
npm run dev
```

The web application will launch at `http://localhost:5173`.

---

## 🔒 Database & Security (RLS)

All 24 PostgreSQL tables enforce Row Level Security (RLS):
1. **Unauthenticated Access Blocked**: Unauthenticated requests receive empty sets via RLS.
2. **Pending User Isolation**: Unapproved accounts (`status = 'pending'`) cannot access notices, dues, chat, or member lists.
3. **Atomic Ballot Security**: Direct write access to `votes` is blocked; all votes pass through the `cast_vote()` security-definer procedure.

---

## 🤖 CI/CD & Android APK Automation

Every push to `main` triggers GitHub Actions (`.github/workflows/android-build.yml`):
1. Compiles Vite Web assets (`npm run build`).
2. Syncs web bundle to Capacitor Android (`npx cap sync android`).
3. Decodes and verifies release keystore (`keytool -list`).
4. Builds release APK (`./gradlew assembleRelease`).
5. Signs and aligns the APK using Android Build Tools (`apksigner`).
6. Publishes a versioned **GitHub Release** with direct `.apk` download.

---

## 📚 Documentation Index

- 📘 [**WORKFLOW.md**](./WORKFLOW.md) — Operational workflows, approval chains, mutual protection rules.
- ⚙️ [**BUILD.md**](./BUILD.md) — Step-by-step build manual for Web and Android APK.
- 🌐 [**WEB_BUILD_GUIDE.md**](./WEB_BUILD_GUIDE.md) — Vercel and PWA optimization guide.
- 📱 [**GRADLE_BUILD_GUIDE.md**](./GRADLE_BUILD_GUIDE.md) — Android Studio, Gradle, and signing manual.
- 👑 [**SUPER_ADMIN_SETUP.md**](./SUPER_ADMIN_SETUP.md) — Initial President and General Secretary bootstrap guide.
