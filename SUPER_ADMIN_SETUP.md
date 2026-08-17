# 👑 Kunjachaya Club — Super Admin & First-Officer Bootstrap Guide (SUPER_ADMIN_SETUP.md)

> Guide for bootstrapping the **Initial President** and **General Secretary** accounts for a fresh Kunjachaya Club (KC-P2) deployment.

---

## 📋 Overview

Under the Kunjachaya Constitution (ধারা-১০, ১৪, ১৭), the **President** and **General Secretary** are the top-tier authority holders who can:
- Issue official pre-approved member invitations.
- Approve or reject pending membership registrations.
- Assign executive posts and committee permissions to other residents.
- Manage constitutional amendments and standing council affairs.

---

## 🚀 Bootstrap Methods

### Method 1: Automated Node.js Seed Script (Recommended)

From the project root:

```bash
cd kunjachaya-supabase
npm install @supabase/supabase-js
```

Run the seed script with your Supabase credentials:

```bash
SUPABASE_URL="https://rohbgdxkzlvbrvmckzeg.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here" \
node scripts/seed.js
```

This automatically creates the following demo accounts:

| Name | Role / Post | Email | Default Password |
|---|---|---|---|
| **Rahim Chowdhury** | President (Top-Tier) | `admin@kunjachaya.club` | `admin123` |
| **Nasrin Akter** | Treasurer | `treasurer@kunjachaya.club` | `treasurer123` |
| **Tanvir Islam** | General Resident | `tanvir@kunjachaya.club` | `resident123` |
| **Farhana Yasmin** | General Resident | `farhana@kunjachaya.club` | `resident123` |
| **Kamal Hossain** | Life Member | `kamal@kunjachaya.club` | `resident123` |

---

### Method 2: Manual Supabase Dashboard Setup

If bootstrapping a custom real user (e.g. `yourname@gmail.com`):

#### Step 1: Create Supabase Auth User
1. Go to **Supabase Dashboard → Authentication → Users**.
2. Click **Add user** → **Create user**.
3. Enter Email: `yourname@gmail.com` and a secure password.
4. Toggle **Auto Confirm User?** to `ON`.
5. Copy the generated **User UID** (e.g. `a1b2c3d4-...`).

#### Step 2: Insert President Profile in SQL Editor
Go to **Supabase Dashboard → SQL Editor** and execute:

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
  'yourname@gmail.com',
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
Execute the same SQL for your General Secretary user with `post = 'General Secretary'`.

---

## 🔒 Security Posture

- The client application never writes plain-text passwords.
- All credentials are bcrypt hashed by Supabase Auth (GoTrue).
- Top-tier roles automatically receive mutual protection to prevent unauthorized removal.
