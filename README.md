# Kunjachaya Club — unified web + Android project (Supabase backend)

One React codebase, one Postgres database (via Supabase), two shipped
apps: a normal website, and this same site wrapped by Capacitor into a
real installable Android app. Both read and write the same tables in
real time — approve a member on the web dashboard and it shows up
instantly on a resident's phone.

This project now uses **Supabase** instead of Firebase — see
`../kunjachaya-supabase/` for the schema, security policies, and
server-side functions this depends on. Set that up first.

## Project structure & code-splitting

The app used to ship as a single ~270KB `App.jsx` — every resident
downloaded the entire admin portal, Standing Council tools, and audit
screens even if they never opened them (audit finding #7: page speed).
It's now split so each screen is its own file, lazy-loaded on demand:

```
src/theme.js              — colors, fonts, logo, static content (loaded eagerly — small)
src/utils.js              — formatters (uid, dates, currency)
src/components/           — Btn/Card/Modal/etc. primitives, AuthScreen, Shell/nav
src/Router.jsx            — React.lazy() + <Suspense> per screen
src/screens/*.jsx         — one file per resident-facing screen
src/screens/admin/*.jsx   — one file per admin screen
src/App.jsx               — ~150 lines: auth state, db bootstrap, top-level layout only
```

A resident logging in downloads `App.jsx`, `theme.js`, `utils.js`, the
primitives, and only the screens they actually visit — `screens/admin/*`
never loads unless the account is an admin and navigates there. Run
`npm run build` and check `dist/assets/` to see the separate chunk per
screen.

## 1. Set up the database

Follow `../kunjachaya-supabase/README.md` first: create a Supabase
project, run the SQL in `schema/`, deploy the two Edge Functions, and
run the seed script. You need that done before this app has anything
to show.

## 2. Connect this app to it

```
cp .env.example .env
```
Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your
Supabase project settings (Project Settings → API — use the **anon
public** key here, never the service-role key, which must never reach
client code).

## 3. Run it as a website

```
npm install
npm run dev
```
Opens at `http://localhost:5173`. `npm run build` produces a static
`dist/` folder deployable anywhere — Vercel, Netlify, Cloudflare Pages,
or Firebase Hosting purely as a static CDN (the included `firebase.json`
is only for that — HSTS/caching headers — it has nothing to do with the
database anymore).

## 4. Package it as an Android app

Same as before — these commands only work on your own machine (Android
Studio, Android SDK, a JDK), not inside a chat sandbox:
```
npm install
npm run build
npx cap add android        # first time only
npm run android:sync
npx cap open android
```
Build → Generate Signed Bundle / APK from Android Studio.

### App identity
- Package name: `club.kunjachaya.app` (`capacitor.config.ts`)
- Icon/splash source: `public/logo-mark.png` (512×503, from the
  original Stitch export) — use it in Android Studio's Image Asset
  tool. It's crisp at icon sizes but was upscaled from a 450×554
  source, so avoid blowing it up much larger.

## How the data layer works

Every screen in `src/App.jsx` still just calls `persist(d => ({ ...d,
someKey: newValue }))`, same pattern as the original Firestore-blob
prototype — that didn't need to change. What's different is what's
underneath:

- **`src/lib/store.js`** — reads every Postgres table and reshapes the
  rows back into the exact nested `db.users` / `db.notices` / etc.
  shape every screen already expects (joining child tables like
  `notice_comments` back onto their parent, etc).
- **`src/lib/write.js`** — the write side. Diffs the old and new `db`
  object per entity and issues targeted inserts/updates/deletes to the
  right tables, instead of overwriting one JSON blob.
- **`src/lib/authBridge.js`** — real Supabase Auth (bcrypt-hashed
  server-side) instead of a stored plaintext password.
- **Voting is the one exception** to the generic write path — casting
  a ballot calls the `cast_vote()` Postgres function directly via
  `supabase.rpc(...)`, not `persist()`, because it needs a real atomic
  "insert or reject as duplicate" guarantee that a generic diff can't
  give you. See `kunjachaya-supabase/schema/03_cast_vote.sql`.

## What's still simplified

~~Dues can be marked "paid" directly by the resident~~ — fixed: the
Dues screen now redirects to a real PipraPay checkout via the
`piprapay-checkout` Edge Function, and only the `piprapay-webhook`
function (service-role key, bypasses RLS) can mark a due paid. This
can't be tested from this sandbox (no live Supabase project, no
PipraPay credentials) — it's written to the contract the Edge Function
expects, not verified end-to-end. Test it for real before trusting it
with actual payments.
