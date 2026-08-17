# 📋 Kunjachaya Club — Operations & Constitutional Workflow Guide (WORKFLOW.md)

> Detailed breakdown of administrative workflows, constitutional hierarchies, and operational procedures implemented in **Kunjachaya Club (KC-P2)**.

---

## 📑 Index
1. [Membership Registration & Approval Workflow (ধারা-১০)](#1-membership-registration--approval-workflow-ধারা-১০)
2. [Official Top-Tier Invitation & Pre-Approval Workflow](#2-official-top-tier-invitation--pre-approval-workflow)
3. [Kick-Out & Member Removal Hierarchy (ধারা-১৪, ১৭)](#3-kick-out--member-removal-hierarchy-ধারা-১৪-১৭)
4. [Executive Committee Appointments & Permissions Matrix](#4-executive-committee-appointments--permissions-matrix)
5. [Dues Management & PipraPay Payment Workflow (ধারা-১৭৫)](#5-dues-management--piprapay-payment-workflow-ধারা-১৭৫)
6. [Emergency Blood Bank Direct Contact Workflow](#6-emergency-blood-bank-direct-contact-workflow)
7. [Election & Secret-Ballot Voting Workflow (ধারা-২১)](#7-election--secret-ballot-voting-workflow-ধারা-২১)
8. [Constitutional Amendments & Standing Council (ধারা-১৩খ, ৩০)](#8-constitutional-amendments--standing-council-ধারা-১৩খ-৩০)

---

## 1. Membership Registration & Approval Workflow (ধারা-১০)

```
[ New Resident ] ──► Submits Registration Form
                           │
                           ▼
              Supabase Auth User Created
              Profile status = "pending"
                           │
                           ▼
          Resident sees: "Awaiting Article 10 Approval"
          (Login blocked until approved)
                           │
                           ▼
         [ President / GS / canManageMembers Admin ]
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
           [ APPROVE ]          [ REJECT ]
                 │                   │
                 ▼                   ▼
       Profile status = "active"   Profile deleted
       Resident can now login     Application cancelled
```

### Steps:
1. User enters Full Name, Email, Mobile Phone, Block, Unit, Blood Group, and Password on the Register screen.
2. `signUpResident()` creates an unauthenticated Supabase Auth account and a profile row with `status: 'pending'`.
3. The pending resident appears under the **Pending** tab in the **Admin Members** screen.
4. An authorized officer (`canManageMembers` or Top-Tier) reviews the block and unit information.
5. Upon clicking **Approve**, the status becomes `active` and member class defaults to `General`. The resident can now immediately sign in.

---

## 2. Official Top-Tier Invitation & Pre-Approval Workflow

```
[ President / General Secretary ]
               │
               ▼ Opens "Invite Member" Modal
               │
               ▼ Enters Name, Email, Phone, Block, Unit, Member Class
               │ Toggle: "Direct Pre-Approval" (Default: True)
               │
               ▼ Generates Invitation Link
         https://kc-p2.vercel.app/?invite=kc_inv_xxxx&email=user@domain.com
               │
               ▼ One-Click Share via WhatsApp or Email
               │
               ▼ [ Invited Resident Clicks Link ]
               │
               ▼ App detects ?invite= and auto-switches to "Create Account"
               │ Pre-fills Name, Email, Phone, Block, Unit
               │ Shows "Official Invitation Detected" banner
               │
               ▼ Resident sets Password & Submits
               │
               ▼ Account Activated Immediately (No Waiting in Queue)
```

---

## 3. Kick-Out & Member Removal Hierarchy (ধারা-১৪, ১৭)

Under the constitution, the authority to terminate membership or remove committee officers is strictly governed by rank and accountability.

### 🛡️ Mutual Protection Rule:
- **President cannot kick out General Secretary.**
- **General Secretary cannot kick out President.**
- **Neither leader can modify the other's Executive Committee post.**
- Only the **General Assembly (AGM)** or **Standing Council** has constitutional jurisdiction over disputes between the two top-tier officers.

### Hierarchy Matrix:

```
┌──────────────────────────────────┬────────────────────────────────────────────────────────┐
│ Actor                            │ Permitted Actions                                      │
├──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ President                        │ • Can kick out all residents, admins, and officers     │
│                                  │ • CANNOT kick out General Secretary or self            │
│                                  │ • CANNOT change General Secretary's post               │
├──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ General Secretary                │ • Can kick out all residents, admins, and officers     │
│                                  │ • CANNOT kick out President or self                    │
│                                  │ • CANNOT change President's post                       │
├──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ Executive Admin                  │ • Can kick out standard residents                      │
│ (with canManageMembers = true)   │ • CANNOT kick out President, GS, or officers with post │
│                                  │ • CANNOT change any EC posts                           │
├──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ Standard Resident                │ • No administrative or kick-out permissions            │
└──────────────────────────────────┴────────────────────────────────────────────────────────┘
```

### 🗑️ Permanent Database Cascade:
When a member is removed:
1. All referencing child records in `dues`, `tickets`, `notice_comments`, `chat_messages`, `event_rsvps`, `agm_attendees`, `agm_proxies`, `amendment_votes`, `budget_votes`, and `nominations` are removed.
2. The user profile is deleted from Supabase `profiles`.
3. An entry is permanently logged into the **Audit Trail (Activity Log)** with timestamp, actor name, and kicked member identity.

---

## 4. Executive Committee Appointments & Permissions Matrix

Executive posts are assigned by the President or General Secretary in the **Role Editor**:

| Post (ধারা-১৪) | Default Assigned Permissions | Standing Council Seat? |
|---|---|:---:|
| **President** | All Permissions (`canManageMembers`, `Notices`, `Financials`, `Complaints`, `DeleteItems`) | ✅ Yes |
| **General Secretary** | All Permissions (`canManageMembers`, `Notices`, `Financials`, `Complaints`, `DeleteItems`) | ✅ Yes |
| **Vice President (2 Seats)** | `canManageNotices`, `canManageComplaints` | ❌ No |
| **Treasurer** | `canManageFinancials` (Issue dues, verify ledger) | ❌ No |
| **Organizing Secretary** | `canManageNotices`, `canManageComplaints` | ❌ No |
| **Social Welfare Secretary** | `canManageComplaints` | ❌ No |
| **Publicity Secretary** | `canManageNotices` | ❌ No |
| **Founding Member (Class)** | Resident Permissions + Standing Council Vote | ✅ Yes (Article 13b) |

---

## 5. Dues Management & PipraPay Payment Workflow (ধারা-১৭.৫)

```
[ Treasurer / EC Financial Lead ] ──► Generates Monthly Dues
                                            │
                                            ▼
                           Residents receive Due Notification
                                            │
                                            ▼
                           Resident clicks "Pay with PipraPay"
                                            │
                                            ▼
                          PipraPay Hosted Checkout (bKash/Nagad)
                                            │
                                            ▼
                           PipraPay Webhook triggers Supabase
                           Due status updated to "paid"
                           Transaction reference saved
                                            │
                                            ▼
                         Resident can download Printable PDF Receipt
```

---

## 6. Emergency Blood Bank Direct Contact Workflow

1. **Resident Registration**: Members save their blood group (`A+`, `B+`, `O+`, `AB+`, etc.) and toggle **"Available to Donate"**.
2. **Emergency Discovery**: Anyone searching for blood filters by group or searches block/unit.
3. **Instant Actions**:
   - 📞 **Direct Call Button**: Dialing opens the resident's mobile phone with Bangladesh standard normalization (`+880...`).
   - 💬 **WhatsApp Chat Button**: Launches WhatsApp with a pre-filled emergency request message in Bengali/English:
     `"আসসালামু আলাইকুম [নাম] ভাই/আপু, কুঞ্জছায়া ক্লাব থেকে রক্তের প্রয়োজনে আপনার সাথে যোগাযোগ করছি (গ্রুপ: [গ্রুপ])।"`

---

## 7. Election & Secret-Ballot Voting Workflow (ধারা-২১)

1. **Nomination Phase**: Top-tier leaders open nomination window. Residents self-nominate for specific seats (e.g. Treasurer, Secretary) with manifesto submission.
2. **Review & Approval**: Top-tier verifies candidate eligibility and publishes candidate list.
3. **Ballot Phase**: Active members cast one secret vote per seat. The `cast_vote()` Postgres function enforces `UNIQUE(election_id, position, voter_id)` atomically at the database level.
4. **Results & Handover**: Live vote counts calculate winners; winners can be officially inducted into the Executive Committee list.

---

## 8. Constitutional Amendments & Standing Council (ধারা-১৩খ, ৩০)

1. **Proposal**: Any active resident proposes an amendment referencing a specific constitutional article.
2. **Standing Council Review**: The Standing Council (Founding members, President, General Secretary) reviews the proposed text.
3. **Council Voting**: Council members vote *For* or *Against*. Once 2/3 majority is achieved, the status changes to **Ratified** and the amendment is recorded in the permanent constitution ledger.
