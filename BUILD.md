# 🔨 Kunjachaya Club — Complete Build & Deployment Manual (BUILD.md)

> Instructions for building, verifying, testing, and deploying both the **Web PWA** and **Android APK** for Kunjachaya Club (KC-P2).

---

## 📋 Table of Contents
1. [Prerequisites & System Requirements](#1-prerequisites--system-requirements)
2. [Environment Configuration](#2-environment-configuration)
3. [Local Development (Web)](#3-local-development-web)
4. [Production Web Build & Vercel Deployment](#4-production-web-build--vercel-deployment)
5. [Supabase Database Setup & Schema Migrations](#5-supabase-database-setup--schema-migrations)
6. [Android APK Local Build (Capacitor + Gradle)](#6-android-apk-local-build-capacitor--gradle)
7. [GitHub Actions Automated Android CI/CD Pipeline](#7-github-actions-automated-android-cicd-pipeline)
8. [Troubleshooting & FAQ](#8-troubleshooting--faq)

---

## 1. Prerequisites & System Requirements

- **Node.js**: `v20.x` or higher (LTS recommended)
- **NPM**: `v10.x` or higher
- **JDK (Java Development Kit)**: OpenJDK 17 (`Temurin 17` or Oracle JDK 17)
- **Android SDK**: Build Tools `34.0.0`+, SDK Platform `android-34`
- **Git**: For version control and GitHub Actions automation

---

## 2. Environment Configuration

In the `kunjachaya-mobile/` directory, create your `.env` file based on `.env.example`:

```env
# Supabase PostgreSQL & Auth Credentials
VITE_SUPABASE_URL=https://rohbgdxkzlvbrvmckzeg.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_tTOX1deF-abINLa7h50-Sw_e1QkuUuB

# Production Web Domain (used for generating official invitation links)
VITE_APP_URL=https://kc-p2.vercel.app

# Optional Google Analytics Measurement ID
VITE_GA_MEASUREMENT_ID=
```

---

## 3. Local Development (Web)

To run the web app locally:

```bash
cd kunjachaya-mobile
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 4. Production Web Build & Vercel Deployment

### Build the production bundle locally:
```bash
cd kunjachaya-mobile
npm run build
```

This generates minified production assets in `kunjachaya-mobile/dist/`.

### Deploying to Vercel:
The project includes a pre-configured `vercel.json` for single-page routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Pushing commits to the `main` branch of `https://github.com/flyzctg-wq/KC-P2` automatically deploys the latest build to **Vercel** (`https://kc-p2.vercel.app`).

---

## 5. Supabase Database Setup & Schema Migrations

The database schemas reside in `kunjachaya-supabase/schema/`:

1. **`01_tables.sql`**: Initializes all tables, foreign keys, and indexes.
2. **`02_rls.sql`**: Enables Row Level Security across all 24 tables.
3. **`03_cast_vote.sql`**: Deploys the atomic `cast_vote()` procedure for secret-ballot elections.
4. **`04_rate_limits.sql`**: Protects auth and ticket endpoints from abuse.
5. **`05_fix_top_tier_rls.sql`**: Configures cascade delete policies for top-tier administrators.

To apply these, copy and run each script sequentially in the **Supabase SQL Editor**.

---

## 6. Android APK Local Build (Capacitor + Gradle)

### Step 1: Compile Web Assets
```bash
cd kunjachaya-mobile
npm run build
```

### Step 2: Sync Web Assets to Android
```bash
npx cap sync android
```

### Step 3: Build Debug or Release APK with Gradle
```bash
cd android
./gradlew assembleRelease --no-daemon
```

### Step 4: Sign the APK (if building locally)
```bash
# Locate your Android SDK build-tools apksigner
apksigner sign --ks app/kunjachaya.keystore --ks-key-alias kunjachaya --out Kunjachaya-Club.apk app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## 7. GitHub Actions Automated Android CI/CD Pipeline

The repository includes `.github/workflows/android-build.yml` which builds, signs, and publishes an Android APK on every push to `main`.

### Required Repository Secrets:
Go to **Settings → Secrets and variables → Actions → Repository secrets** on GitHub:

| Secret Name | Value Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public API key |
| `KEYSTORE_BASE64` | Base64-encoded signing keystore *(optional - workflow auto-generates if omitted)* |
| `KEYSTORE_PASSWORD` | Password for keystore *(default: `kunjachaya123`)* |
| `KEY_PASSWORD` | Password for key alias *(default: `kunjachaya123`)* |

### How the Pipeline Works:
1. Sets up Node.js 20, JDK 17, and Android SDK.
2. Runs `npm ci` and compiles Vite bundle (`npm run build`).
3. Syncs web bundle with Capacitor (`npx cap sync android`).
4. Verifies keystore with `keytool` (with self-healing fallback).
5. Compiles release APK (`./gradlew assembleRelease`).
6. Runs `zipalign` and `apksigner` with `--ks-key-alias`.
7. Tags release as `vYYYYMMDD-<short_sha>` and uploads `Kunjachaya-Club.apk` to **GitHub Releases**.

---

## 8. Troubleshooting & FAQ

### Q: "An account with this email already exists" during invite registration?
- **Fix**: The registration screen auto-detects `?invite=...` links and updates the existing invited profile instead of blocking with a duplicate email error.

### Q: "DerInputStream.getLength(): lengthTag=43, too big" during APK signing?
- **Fix**: Occurs if `KEYSTORE_BASE64` contains corrupt data. The workflow now automatically validates the keystore with `keytool -list` and falls back to a clean key if the secret is corrupted.

### Q: Kicked out member reappears after page refresh?
- **Fix**: Resolved by deleting child foreign keys (`dues`, `tickets`, `comments`, `votes`) in a cascade before deleting the profile row in Supabase.
