# 👑 Kunjachaya Club — Initial Officer & Super Admin Setup Guide (SUPER_ADMIN_SETUP.md)

> Guide for bootstrapping the **Initial President** and **General Secretary** administrative accounts for a fresh Kunjachaya Club deployment.

---

## 📋 Overview

Under the Kunjachaya Constitution (ধারা-১০, ১৪, ১৭), the **President** and **General Secretary** are the top-tier authority holders who can:
- Issue official pre-approved member invitations.
- Approve or reject pending membership registrations.
- Assign executive committee posts and administrative permissions.
- Manage constitutional amendments and standing council affairs.

---

## 🚀 Bootstrap Methods

### Method 1: Automated Node.js Script (Recommended)

From the `kunjachaya-supabase/` directory:

```bash
cd kunjachaya-supabase
npm install @supabase/supabase-js
```

Run the seed script by supplying your own Supabase project credentials through environment variables (never commit real credentials to version control):

```bash
SUPABASE_URL="https://your-project.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key" \
node scripts/seed.js
```

> ⚠️ **Security Notice**: Always use strong, unique passwords for production accounts. Avoid using default credentials in live environments.

---

### Method 2: Manual Supabase Dashboard Setup

To create and configure an administrator account directly:

#### Step 1: Create Supabase Auth User
1. Open your **Supabase Project Dashboard → Authentication → Users**.
2. Click **Add user** → **Create user**.
3. Enter your official administrator email and a strong password.
4. Toggle **Auto Confirm User?** to `ON`.
5. Copy the generated **User UID** (UUID format, e.g. `a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).

#### Step 2: Insert President Profile in SQL Editor
Go to **Supabase Dashboard → SQL Editor** and execute the following query, replacing `'PASTE_USER_UID_HERE'`, `'Your Full Name'`, and `'yourname@example.com'` with your details:

```sql
INSERT INTO public.profiles (
  id,
  name,
  email,
  phone,
  block,
  unit,
  member_class,
  role,
  post,
  status,
  standing_council,
  blood_group,
  donor,
  earned_badges,
  permissions
) VALUES (
  'PASTE_USER_UID_HERE',
  'Your Full Name',
  'yourname@example.com',
  '+880 1700-000000',
  'A',
  'A-01',
  'Founding',
  'admin',
  'President',
  'active',
  true,
  'O+',
  false,
  ARRAY['b_founder'],
  '{"canManageMembers": true, "canManageNotices": true, "canManageFinancials": true, "canManageComplaints": true, "canDeleteItems": true}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  post = 'President',
  status = 'active',
  standing_council = true,
  permissions = '{"canManageMembers": true, "canManageNotices": true, "canManageFinancials": true, "canManageComplaints": true, "canDeleteItems": true}'::jsonb;
```

#### Step 3: Insert General Secretary Profile
Execute the query again for your General Secretary user with `post = 'General Secretary'`.

---

## 🔒 Security Posture & Safeguards

- **No Plaintext Passwords**: Client apps never store or transmit plaintext passwords; authentication is handled via secure bcrypt hashing and JWT session tokens managed by Supabase GoTrue Auth.
- **Row-Level Security (RLS)**: Database policies strictly enforce role separation across all tables.
- **Mutual Top-Tier Protection**: The system prevents top-tier administrators from kicking out one another or modifying each other's executive posts.
