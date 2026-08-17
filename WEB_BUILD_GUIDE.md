# 🌐 Kunjachaya Club — Web & PWA Build Guide (WEB_BUILD_GUIDE.md)

> Focused guide for developing, optimizing, building, and hosting the **Kunjachaya Club Web Application** and Progressive Web App (PWA).

---

## 📋 Table of Contents
- [1. Web Tech Stack](#1-web-tech-stack)
- [2. Project Structure (Frontend)](#2-project-structure-frontend)
- [3. Local Development Server](#3-local-development-server)
- [4. Environment Variables](#4-environment-variables)
- [5. Production Build & Optimization](#5-production-build--optimization)
- [6. Vercel Hosting Configuration](#6-vercel-hosting-configuration)
- [7. Responsive Layouts & Mobile Navigation](#7-responsive-layouts--mobile-navigation)
- [8. Localization (Bengali & English)](#8-localization-bengali--english)

---

## 1. Web Tech Stack

- **Framework**: React 18
- **Bundler & Tooling**: Vite 5
- **Styling**: Tailwind CSS & Modern Vanilla CSS Design Tokens (HSL system)
- **Icons**: Lucide React
- **Client Backend Bridge**: `@supabase/supabase-js`
- **Routing**: Internal State Router with Browser History Integration

---

## 2. Project Structure (Frontend)

```
kunjachaya-mobile/
├── src/
│   ├── components/
│   │   ├── Shell.jsx           # Main navigation layout (Bottom Bar + Side Drawer)
│   │   ├── AuthScreen.jsx      # Login, Register & Invite Auto-Detection
│   │   ├── primitives.jsx      # UI Elements: Card, Btn, Badge, Avatar, Modal, Field
│   │   ├── ConsentBanner.jsx   # Cookie and Analytics privacy banner
│   │   └── SplashIntro.jsx     # Onboarding intro animation
│   ├── screens/
│   │   ├── Home.jsx            # Resident Dashboard & Overview
│   │   ├── Directory.jsx       # Member Directory (Phone, WhatsApp, Quick View)
│   │   ├── BloodBank.jsx       # Blood Donors (Call, WhatsApp Emergency)
│   │   ├── Dues.jsx            # Resident Dues & PipraPay Checkout
│   │   ├── Notices.jsx         # Notice Board with Reactions & Comments
│   │   ├── Elections.jsx       # Election voting & candidate manifestos
│   │   ├── Profile.jsx         # Personal information & Form Details editor
│   │   ├── Tickets.jsx         # Complaint & service request tracking
│   │   ├── AGM.jsx             # General Assembly meetings & resolutions
│   │   ├── Amendments.jsx      # Constitutional Amendment voting
│   │   ├── Budget.jsx          # Annual budget allocations & review
│   │   ├── Chat.jsx            # Real-time community & council chat
│   │   └── admin/              # Executive Committee administrative screens
│   │       ├── Dashboard.jsx   # Admin Executive Overview
│   │       ├── Members.jsx     # Member Approval, Invites & Kick-out
│   │       ├── Officers.jsx    # Committee Post management
│   │       └── Dues.jsx        # Dues generation & payment logs
│   ├── lib/
│   │   ├── supabase.js         # Supabase client singleton
│   │   ├── authBridge.js       # GoTrue Auth wrapper (Bcrypt, JWT)
│   │   ├── store.js            # fetchAll() and subscribeDB() realtime engine
│   │   └── write.js            # syncChanges() Postgres diff & mutation engine
│   ├── theme.js                # Theme tokens, colors, Bengali & English STR dictionaries
│   ├── utils.js                # getAppBaseUrl(), cleanPhone(), date & currency formatters
│   ├── App.jsx                 # App root, session manager, notification toasts
│   └── main.jsx                # React DOM mount point
├── index.html                  # HTML entry point with Google Fonts
└── package.json
```

---

## 3. Local Development Server

Run the development server with Hot Module Replacement (HMR):

```bash
cd kunjachaya-mobile
npm install
npm run dev
```

The app will start at `http://localhost:5173`.

---

## 4. Environment Variables

Create `.env` in the `kunjachaya-mobile/` directory:

```env
VITE_SUPABASE_URL=https://rohbgdxkzlvbrvmckzeg.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_tTOX1deF-abINLa7h50-Sw_e1QkuUuB
VITE_APP_URL=https://kc-p2.vercel.app
```

---

## 5. Production Build & Optimization

To produce an optimized production bundle:

```bash
npm run build
```

The output is emitted to `dist/`:
- JavaScript chunks are code-split and minified.
- CSS is purged and tree-shaken with Tailwind.
- HTML is minified and prepared for CDN delivery.

---

## 6. Vercel Hosting Configuration

The project uses `vercel.json` for single-page application (SPA) rewrite rules:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures deep links (such as `/?invite=kc_inv_...&email=...`) route correctly to the app without 404 errors.

---

## 7. Responsive Layouts & Mobile Navigation

- **Desktop (Web)**: Left-hand navigation sidebar displaying all modules categorized into Core, Administration, and Community.
- **Mobile Devices (Web & App)**:
  - **Bottom Navigation Bar**: Highlights the 5 essential daily modules in priority order:
    1. 🏠 **Dashboard / Home**
    2. 👥 **Members / Directory**
    3. 💳 **Financials & Dues**
    4. 💬 **Chat**
    5. 📢 **Notices**
  - **Side Drawer (3-Line Hamburger)**: Full scrollable drawer providing access to all 20+ modules, language toggle, and account logout.

---

## 8. Localization (Bengali & English)

All user-facing strings are defined in `src/theme.js` under `STR.en` and `STR.bn`:
- Users can switch between **বাংলা** and **English** at any time.
- State is preserved across reloads via local state.
