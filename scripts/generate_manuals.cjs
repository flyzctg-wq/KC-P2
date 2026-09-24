const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const os = require('os');

const docsDir = path.resolve('docs/user_manual');
const publicDocsDir = path.resolve('public/docs');

fs.mkdirSync(docsDir, { recursive: true });
fs.mkdirSync(publicDocsDir, { recursive: true });

const css = `
@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&family=Inter:wght@400;500;600;700;800&display=swap');

@page {
  size: A4;
  margin: 16mm 14mm 16mm 14mm;
  @bottom-right {
    content: counter(page);
  }
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', 'Hind Siliguri', 'Segoe UI', 'SolaimanLipi', 'Kalpurush', sans-serif;
  color: #1e293b;
  background: #ffffff;
  font-size: 13px;
  line-height: 1.6;
}

.cover-page {
  page-break-after: always;
  height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 20px;
  border: 2px solid #10b981;
  border-radius: 16px;
  background: linear-gradient(145deg, #f0fdf4 0%, #ffffff 50%, #f8fafc 100%);
  position: relative;
}

.cover-badge {
  display: inline-block;
  background: #059669;
  color: #ffffff;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 6px 14px;
  border-radius: 9999px;
  margin-bottom: 20px;
}

.cover-title {
  font-size: 32px;
  font-weight: 800;
  color: #064e3b;
  line-height: 1.25;
  margin-bottom: 12px;
}

.cover-subtitle {
  font-size: 17px;
  color: #047857;
  font-weight: 600;
  margin-bottom: 24px;
}

.cover-desc {
  font-size: 13.5px;
  color: #475569;
  max-width: 580px;
  line-height: 1.65;
}

.cover-meta {
  border-top: 1px solid #cbd5e1;
  padding-top: 24px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  font-size: 12px;
}

.cover-meta strong {
  color: #0f172a;
}

.page {
  page-break-after: always;
  padding: 10px 0;
}

.page:last-child {
  page-break-after: avoid;
}

h1 {
  font-size: 22px;
  font-weight: 800;
  color: #064e3b;
  border-bottom: 2px solid #10b981;
  padding-bottom: 6px;
  margin-top: 18px;
  margin-bottom: 14px;
  page-break-after: avoid;
}

h2 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin-top: 16px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  page-break-after: avoid;
}

h2::before {
  content: "";
  display: inline-block;
  width: 5px;
  height: 16px;
  background: #10b981;
  border-radius: 2px;
}

h3 {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-top: 12px;
  margin-bottom: 6px;
  page-break-after: avoid;
}

p {
  margin-bottom: 9px;
  color: #334155;
  text-align: justify;
}

ul, ol {
  margin-left: 20px;
  margin-bottom: 10px;
  color: #334155;
}

li {
  margin-bottom: 4px;
}

.box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #059669;
  border-radius: 8px;
  padding: 12px 14px;
  margin: 12px 0;
  font-size: 12.5px;
}

.box.warning {
  background: #fffbeb;
  border-color: #fde68a;
  border-left-color: #d97706;
}

.box.info {
  background: #f0fdf4;
  border-color: #bbf7d0;
  border-left-color: #10b981;
}

.box.admin {
  background: #f5f3ff;
  border-color: #ddd6fe;
  border-left-color: #7c3aed;
}

.box-title {
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 4px;
  color: #0f172a;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 12px;
}

th, td {
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  text-align: left;
}

th {
  background: #064e3b;
  color: #ffffff;
  font-weight: 600;
}

tr:nth-child(even) {
  background: #f8fafc;
}

.badge {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.badge-emerald { background: #d1fae5; color: #065f46; }
.badge-purple { background: #ede9fe; color: #5b21b6; }
.badge-blue { background: #dbeafe; color: #1e40af; }
.badge-amber { background: #fef3c7; color: #92400e; }

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 12px 0;
}

.card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  background: #ffffff;
}

.card-title {
  font-weight: 700;
  color: #064e3b;
  margin-bottom: 4px;
  font-size: 13px;
}

.footer-nav {
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 20px;
  border-top: 1px solid #e2e8f0;
  padding-top: 8px;
}
`;

function getEnglishContent() {
  return `
  <div class="cover-page">
    <div>
      <span class="cover-badge">Official Documentation • v2.4</span>
      <h1 class="cover-title">KUNJACHAYA CLUB</h1>
      <div class="cover-subtitle">Complete Mobile & Web Application User Manual</div>
      <p class="cover-desc">
        A comprehensive guide for Residents, General Members, Executive Committee Officers, and Super Administrators of Kunjachaya Housing Society.
        Includes interactive navigation, live community map, dues management, voting, digital letterhead, and system configuration.
      </p>
    </div>
    <div class="cover-meta">
      <div>
        <strong>Application:</strong> Kunjachaya Mobile PWA<br>
        <strong>Platform:</strong> Android (Capacitor) & Modern Web<br>
        <strong>Backend:</strong> Supabase PostgreSQL (Realtime & RLS)
      </div>
      <div>
        <strong>Target Audience:</strong> Residents & Administrative Council<br>
        <strong>Supported Languages:</strong> English & Bengali (বাংলা)<br>
        <strong>Published:</strong> September 2026
      </div>
    </div>
  </div>

  <div class="page">
    <h1>1. System Overview & Getting Started</h1>
    
    <h2>1.1 About Kunjachaya Club App</h2>
    <p>
      The Kunjachaya Club Application is an all-in-one digital governance and community portal built specifically for the residents and governing committee of Kunjachaya Housing Society. It unites communications, billing, emergency services, democratic elections, official notices, and interactive mapping into a high-performance progressive web application.
    </p>

    <h2>1.2 Installation & Device Support</h2>
    <ul>
      <li><strong>Android App (APK / Play Store):</strong> Native Android application powered by Capacitor with push notifications and local offline caching.</li>
      <li><strong>Progressive Web App (PWA):</strong> Open in Chrome or Safari on any smartphone or desktop, tap <em>"Add to Home Screen"</em> to install without app store download.</li>
      <li><strong>Responsive Web:</strong> Operates seamlessly across desktop monitors, tablets, and handheld devices.</li>
    </ul>

    <h2>1.3 User Roles & Permission Hierarchy</h2>
    <table>
      <thead>
        <tr>
          <th>User Role</th>
          <th>Designations</th>
          <th>Key Privileges</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="badge badge-emerald">Resident</span></td>
          <td>Flat Owners, Tenants, Family Members</td>
          <td>Access home dashboard, view notices, pay dues, download receipts, report complaints, use blood bank, view community map & share live location, participate in polls & secret ballot elections.</td>
        </tr>
        <tr>
          <td><span class="badge badge-blue">Committee Officer</span></td>
          <td>Vice-President, Joint Secretary, Treasurer, Organizing Sec., etc.</td>
          <td>Manage specific portfolios: financial vouchers, complaints tracking, notice publication, membership verifications according to constitutional powers.</td>
        </tr>
        <tr>
          <td><span class="badge badge-amber">Officer-in-Charge</span></td>
          <td>Officer-in-Charge, Joint Secretary</td>
          <td>Full access to <strong>Map Landmarks Management</strong> (add/edit GPS coordinates, icons, color codes), community event coordination.</td>
        </tr>
        <tr>
          <td><span class="badge badge-purple">Super Admin</span></td>
          <td>President, General Secretary</td>
          <td>Highest tier (Article 17). Dynamic Module Toggle (turn entire tabs on/off), full member invitations, officer appointment, map landmark editing, official letters generator, EC handover.</td>
        </tr>
      </tbody>
    </table>

    <div class="box info">
      <div class="box-title">Bilingual & Theme Support</div>
      Switch between <strong>English</strong> and <strong>বাংলা</strong> anytime using the language toggle in the top-right header or Profile screen. Dark Mode, Light Mode, and System Theme preferences are saved locally.
    </div>
  </div>

  <div class="page">
    <h1>2. Resident & Member Guide</h1>

    <h2>2.1 Home Dashboard & Quick Access</h2>
    <p>
      Upon signing in, residents arrive at the Home Dashboard, which highlights:
    </p>
    <ul>
      <li><strong>Active Alerts & Pinned Circulars:</strong> Critical security notices, water/electricity outage alerts.</li>
      <li><strong>Monthly Dues Status:</strong> Quick card showing pending dues and one-tap payment options.</li>
      <li><strong>Quick Actions:</strong> Shortcuts to Emergency Hotlines, Blood Bank, Maintenance Complaints, and Map.</li>
    </ul>

    <h2>2.2 Interactive Community Map & Live Location</h2>
    <p>
      The <strong>Community Map</strong> provides an interactive Leaflet-powered satellite/street map of the entire Kunjachaya society boundary:
    </p>
    <ul>
      <li><strong>Landmarks & Facilities:</strong> Browse custom markers including the Central Mosque, Club House, Main Gate, Sub-Gates, Children's Play Zone, Waste Drop Points, and Water Pump House.</li>
      <li><strong>Pin Details & Directions:</strong> Tap any landmark icon to read its details, operating hours, and tap <em>"Get Directions"</em> to open Google Maps turn-by-turn navigation directly to the landmark.</li>
      <li><strong>Live Location Sharing:</strong> Tap <em>"Share My Live Location"</em> to broadcast your real-time position within the society. Ideal for emergencies, delivery guides, or event gatherings. Your battery level and timestamp are safely displayed. You can turn off sharing anytime with a single tap.</li>
    </ul>

    <h2>2.3 Financials, Dues & Verified Receipts</h2>
    <ul>
      <li><strong>Dues Breakdown:</strong> View monthly society maintenance fees, security charges, and utility dues.</li>
      <li><strong>Payment Gateways:</strong> Pay through digital channels (bKash, Nagad, Bank Deposit) or record cash handed to the Treasurer.</li>
      <li><strong>Official Stamped Receipts:</strong> Instantly generate and print or download official payment receipts equipped with verification QR codes and presidential signatures.</li>
    </ul>

    <h2>2.4 Emergency Services & Blood Bank</h2>
    <div class="grid-2">
      <div class="card">
        <div class="card-title">Emergency Hotlines</div>
        <p>Direct 1-tap dialer for Society Security Gate, On-duty Electrician, Plumber, President, Local Police Station, and Fire Brigade.</p>
      </div>
      <div class="card">
        <div class="card-title">Community Blood Bank</div>
        <p>Search resident volunteer donors by blood group (A+, B+, O+, AB+, etc.) with direct contact buttons for urgent medical emergencies.</p>
      </div>
    </div>

    <h2>2.5 Maintenance Complaints & Service Tickets</h2>
    <p>
      Encounter an electrical malfunction, water leakage, or cleanliness issue? Submit a ticket under <strong>Tickets / Complaints</strong>:
    </p>
    <ol>
      <li>Click <em>"New Complaint"</em> and choose the issue category.</li>
      <li>Enter flat number, issue description, and attach photos if required.</li>
      <li>Track progress in real time as the committee assigns maintenance personnel and marks it <strong>Resolved</strong>.</li>
    </ol>
  </div>

  <div class="page">
    <h1>3. Governance, Elections & Community Features</h1>

    <h2>3.1 Democratic Secret Ballot Elections</h2>
    <p>
      The Kunjachaya constitution mandates fair and digital elections for Executive Committee terms:
    </p>
    <ul>
      <li><strong>Voter Eligibility:</strong> Verified active members in good financial standing receive digital ballot access.</li>
      <li><strong>Secret Ballot:</strong> Each member casts 1 encrypted vote per candidate seat. Results are stored with cryptographic integrity.</li>
      <li><strong>Candidate Profiles:</strong> Review candidates, photos, and election manifestos before voting.</li>
      <li><strong>Real-time Counting:</strong> When the Election Commission closes voting, verified vote counts and winning candidate declarations are published instantly.</li>
    </ul>

    <h2>3.2 Annual General Meeting (AGM) & Resolutions</h2>
    <p>
      Access upcoming AGM schedules, digital agenda booklets, financial audit reports, and vote on formal constitutional amendments online.
    </p>

    <h2>3.3 Constitution & Bylaws</h2>
    <p>
      A complete, searchable repository of all 20+ articles of the Kunjachaya Society Constitution in both English and Bengali, including officer role guidelines, quorum rules, and disciplinary procedures.
    </p>

    <h2>3.4 Community Chat & Events</h2>
    <ul>
      <li><strong>Discussion Forum:</strong> Engage with neighbors in moderated topic threads.</li>
      <li><strong>Society Events & RSVP:</strong> View community picnics, sports tournaments, Eid celebrations, and register attendee headcounts for catering.</li>
    </ul>
  </div>

  <div class="page">
    <h1>4. Administrator & Executive Committee Guide</h1>

    <h2>4.1 Navigation Structure</h2>
    <p>
      Admins have access to an expanded navigation drawer grouped into 5 collapsible categories:
    </p>
    <ul>
      <li><strong>Management (ব্যবস্থাপনা):</strong> Executive Dashboard, Members, Financials, Payment History, Expenses, App Modules.</li>
      <li><strong>Communication (যোগাযোগ):</strong> Community Chat, Notice Board, Official Letters, Hotlines.</li>
      <li><strong>Governance (পরিচালনা):</strong> Elections Manager, AGM, Constitutional Amendments, Officers, Handover.</li>
      <li><strong>Community (সম্প্রদায়):</strong> Blood Bank, Events, Badges, Budget, Audit Log, <strong>Map Landmarks</strong>.</li>
      <li><strong>Account (অ্যাকাউন্ট):</strong> Support Tickets, Profile, System Settings.</li>
    </ul>

    <h2>4.2 Managing Community Map Landmarks (Super Admin & OIC)</h2>
    <div class="box admin">
      <div class="box-title">Access Route: Admin Drawer → Community → Map Landmarks</div>
      Authorized: <strong>President, General Secretary, Joint Secretary, Officer-in-Charge</strong>.
    </div>
    <p>This dedicated screen allows administrators to configure society map pins without writing code:</p>
    <ul>
      <li><strong>Add New Landmark:</strong> Enter Title (EN & BN), Category (Mosque, Gate, Park, Utility, etc.), GPS Latitude and Longitude.</li>
      <li><strong>Icon & Color Picker:</strong> Choose from 28 custom emoji icons and 15 curated color palettes.</li>
      <li><strong>Google Maps Preview:</strong> Click the preview button to verify exact coordinates on satellite imagery before saving.</li>
      <li><strong>Show / Hide Toggle:</strong> Temporarily hide seasonal landmarks (e.g. temporary Eid stalls) without deleting them.</li>
      <li><strong>Save to Database:</strong> Saves to Supabase <code>app_config</code> and instantly pushes updates to all residents via Realtime.</li>
      <li><strong>Reset to Defaults:</strong> One-tap button to restore the original 10 verified society landmarks.</li>
    </ul>

    <h2>4.3 Super Admin Module Toggle System</h2>
    <p>
      Located under <strong>Admin Drawer → Management → App Modules</strong> (Super Admin Only: President / General Secretary):
    </p>
    <ul>
      <li>Turn individual modules ON or OFF with a single toggle switch (e.g. disable Elections between terms, disable Chat during maintenance).</li>
      <li>Disabled modules are instantly hidden from navigation drawers and protected by security routers for all non-admin users.</li>
    </ul>

    <h2>4.4 Official Letterhead & Notices Generator</h2>
    <p>
      Under <strong>Admin Drawer → Communication → Official Letters</strong>:
    </p>
    <ul>
      <li>Issue formal letters, circulars, meeting notices, and warning letters with pre-formatted society header, emblem, reference number, and date.</li>
      <li>Digitally signed by President / General Secretary.</li>
      <li>One-click <em>"Print / PDF"</em> to generate clean printable documents.</li>
    </ul>

    <h2>4.5 Financial Management & Expense Vouchers</h2>
    <ul>
      <li><strong>Billing:</strong> Batch-generate monthly subscription invoices for all flats.</li>
      <li><strong>Expense Tracker:</strong> Record utility bills, security guard wages, cleaning supplies, and repair invoices.</li>
      <li><strong>Approval Workflow:</strong> Expenses require Presidential sign-off before closing accounts.</li>
    </ul>
  </div>

  <div class="page">
    <h1>5. Troubleshooting & Security Best Practices</h1>
    
    <h2>5.1 Location & GPS Permissions</h2>
    <ul>
      <li>Ensure <strong>Location Access (Precise / High Accuracy)</strong> is allowed in your phone browser settings (Chrome/Safari) or Android App permissions.</li>
      <li>If coordinates do not update on the Community Map, verify that your device GPS is switched on.</li>
    </ul>

    <h2>5.2 Account Security</h2>
    <ul>
      <li>Never share your committee or resident login password.</li>
      <li>Use the <em>"Change Password"</em> option in Profile to update credentials regularly.</li>
      <li>If an officer steps down, the Super Admin must update their role in <strong>Members → Committee Appointment</strong> (Article 17) to revoke admin privileges immediately.</li>
    </ul>

    <div class="box warning">
      <div class="box-title">Support & Inquiries</div>
      For technical assistance or society inquiries, contact the Kunjachaya Executive Committee office or reach the technical team via the in-app Support Tickets.
    </div>

    <div class="footer-nav">
      Kunjachaya Club (কুঞ্জছায়া ক্লাব) • Official User Manual • All Rights Reserved © 2026
    </div>
  </div>
  `;
}

function getBengaliContent() {
  return `
  <div class="cover-page">
    <div>
      <span class="cover-badge">অফিসিয়াল নির্দেশিকা • সংস্করণ ২.৪</span>
      <h1 class="cover-title">কুঞ্জছায়া ক্লাব</h1>
      <div class="cover-subtitle">মোবাইল ও ওয়েব অ্যাপ্লিকেশন সম্পূর্ণ ব্যবহারকারী নির্দেশিকা</div>
      <p class="cover-desc">
        কুঞ্জছায়া হাউজিং সোসাইটির আবাসিক সদস্য, কার্যনির্বাহী পরিষদ এবং সুপার অ্যাডমিনদের জন্য প্রণীত পূর্ণাঙ্গ ডিজিটাল ব্যবহার বিধি।
        এর মধ্যে রয়েছে সোসাইটির নোটিশ বোর্ড, চাঁদা ও ডিজিটাল রসিদ, লাইভ কমিউনিটি ম্যাপ, রক্ত ব্যাংক, গণতান্ত্রিক নির্বাচন এবং কার্যনির্বাহী পরিচালনা নির্দেশিকা।
      </p>
    </div>
    <div class="cover-meta">
      <div>
        <strong>অ্যাপ্লিকেশন:</strong> কুঞ্জছায়া মোবাইল পিডব্লিউএ (PWA)<br>
        <strong>প্ল্যাটফর্ম:</strong> অ্যান্ড্রয়েড (Capacitor) ও আধুনিক ওয়েব<br>
        <strong>ডাটাবেজ:</strong> সুপাবেস পোস্টগ্রেসকিউএল (রিয়েলটাইম ও RLS)
      </div>
      <div>
        <strong>ব্যবহারকারী:</strong> সাধারণ সদস্য ও পরিচালনা পরিষদ<br>
        <strong>ভাষা:</strong> বাংলা ও ইংরেজি (English)<br>
        <strong>প্রকাশকাল:</strong> সেপ্টেম্বর ২০২৬
      </div>
    </div>
  </div>

  <div class="page">
    <h1>১. ভূমিকা ও প্রাথমিক পরিচিতি</h1>

    <h2>১.১ কুঞ্জছায়া ক্লাব অ্যাপ সম্পর্কে</h2>
    <p>
      কুঞ্জছায়া ক্লাব অ্যাপ হলো একটি আধুনিক সমন্বিত ডিজিটাল প্ল্যাটফর্ম, যা কুঞ্জছায়া হাউজিং সোসাইটির সার্বিক পরিচালনা, সদস্য যোগাযোগ, মাসিক হিসাব-নিকাশ, জরুরি পরিষেবা এবং প্রশাসনিক স্বচ্ছতা নিশ্চিত করতে তৈরি করা হয়েছে। এটি যেকোনো স্মার্টফোন ও কম্পিউটারে ব্রাউজার বা অ্যান্ড্রয়েড অ্যাপ হিসেবে ব্যবহার করা যায়।
    </p>

    <h2>১.২ ইনস্টলেশন ও ব্যবহার পদ্ধতি</h2>
    <ul>
      <li><strong>অ্যান্ড্রয়েড অ্যাপ:</strong> স্থানীয় অফলাইন ক্যাশিং ও পুশ নোটিফিকেশন সহ ক্যাপাসিটর চালিত দেশীয় অ্যান্ড্রয়েড অ্যাপ।</li>
      <li><strong>পিডব্লিউএ (PWA):</strong> ক্রোম বা সাফারি ব্রাউজারে সাইটটি খুলে <em>"Add to Home Screen"</em> (হোম স্ক্রিনে যুক্ত করুন) চাপলেই কোনো প্লে-স্টোর ঝামেলা ছাড়াই অ্যাপের মতো ইনস্টল হয়ে যায়।</li>
      <li><strong>রেসপনসিভ ওয়েব:</strong> কম্পিউটার, ল্যাপটপ, ট্যাবলেট বা যেকোনো মোবাইলের স্ক্রিনের সাথে স্বয়ংক্রিয়ভাবে খাপ খায়।</li>
    </ul>

    <h2>১.৩ ব্যবহারকারীর পদমর্যাদা ও অধিকার</h2>
    <table>
      <thead>
        <tr>
          <th>ভূমিকা / রোল</th>
          <th>পদবীসমূহ</th>
          <th>প্রধান সুবিধাসমূহ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="badge badge-emerald">আবাসিক সদস্য</span></td>
          <td>ফ্ল্যাট মালিক, ভাড়াটিয়া, পরিবারের সদস্য</td>
          <td>হোম ড্যাশবোর্ড, নোটিশ দেখা, মাসিক চাঁদা পরিশোধ ও রসিদ ডাউনলোড, অভিযোগ দাখিল, রক্ত ব্যাংক, কমিউনিটি ম্যাপ ও লাইভ লোকেশন শেয়ার, সাধারণ সভা ও নির্বাচনে ভোট প্রদান।</td>
        </tr>
        <tr>
          <td><span class="badge badge-blue">কমিটি কর্মকর্তা</span></td>
          <td>সহ-সভাপতি, যুগ্ম সাধারণ সম্পাদক, কোষাধ্যক্ষ, সাংগঠনিক সম্পাদক ইত্যাদি</td>
          <td>নিজ নিজ দায়িত্বাধীন ক্ষেত্র পরিচালনা: খরচের ভাউচার, অভিযোগ তদারকি, নোটিশ জারি ও সদস্য অনুমোদন।</td>
        </tr>
        <tr>
          <td><span class="badge badge-amber">দায়িত্বপ্রাপ্ত কর্মকর্তা</span></td>
          <td>দায়িত্বপ্রাপ্ত কর্মকর্তা (OIC), যুগ্ম সম্পাদক</td>
          <td><strong>ম্যাপ ল্যান্ডমার্ক ব্যবস্থাপনা</strong> (সোসাইটির জিপিএস পয়েন্ট যোগ/সম্পাদনা, আইকন ও রঙ নির্ধারণ) এবং ইভেন্ট পরিচালনা।</td>
        </tr>
        <tr>
          <td><span class="badge badge-purple">সুপার অ্যাডমিন</span></td>
          <td>সভাপতি, সাধারণ সম্পাদক</td>
          <td>সর্বোচ্চ প্রশাসনিক ক্ষমতা (ধারা ১৭): মডিউল অন/অফ সুইচ, কর্মকর্তা নিয়োগ ও দায়িত্ব বণ্টন, ল্যান্ডমার্ক নিয়ন্ত্রণ, অফিসিয়াল চিঠি ইস্যু ও কমিটি হস্তান্তর।</td>
        </tr>
      </tbody>
    </table>

    <div class="box info">
      <div class="box-title">দ্বিভাষিক ও ডার্ক মোড সুবিধা</div>
      অ্যাপের উপরের ডান কোণে বা প্রোফাইল পেজে গিয়ে যেকোনো সময় <strong>বাংলা</strong> ও <strong>English</strong> ভাষার মধ্যে পরিবর্তন করতে পারবেন। এছাড়া চোখের সুরক্ষায় ডার্ক মোড ও লাইট মোড পছন্দ নির্ধারণ করা যায়।
    </div>
  </div>

  <div class="page">
    <h1>২. সাধারণ ও আবাসিক সদস্যদের ব্যবহার নির্দেশিকা</h1>

    <h2>২.১ হোম ড্যাশবোর্ড</h2>
    <p>
      লগইন করার পরপরই হোম ড্যাশবোর্ডে সোসাইটির গুরুত্বপূর্ণ আপডেট প্রদর্শিত হয়:
    </p>
    <ul>
      <li><strong>জরুরি ঘোষণা ও পিন করা নোটিশ:</strong> বিদ্যুৎ, পানি বা নিরাপত্তা সংক্রান্ত তাৎক্ষণিক নোটিশ।</li>
      <li><strong>মাসিক চাঁদার সংক্ষিপ্ত চিত্র:</strong> আপনার কোনো চাঁদা বকেয়া আছে কি না তা সরাসরি দেখা এবং পরিশোধের ব্যবস্থা।</li>
      <li><strong>দ্রুত অ্যাকশন:</strong> জরুরি হটলাইন, রক্ত ব্যাংক, অভিযোগ ও ম্যাপের শর্টকাট বোতাম।</li>
    </ul>

    <h2>২.২ ইন্টারেক্টিভ কমিউনিটি ম্যাপ ও লাইভ লোকেশন</h2>
    <p>
      সোসাইটির সকল গুরুত্বপূর্ণ স্থান ও পথ চিহ্নিত করতে <strong>কমিউনিটি ম্যাপ</strong> ব্যবহার করুন:
    </p>
    <ul>
      <li><strong>ল্যান্ডমার্ক ও স্থাপনা:</strong> কেন্দ্রীয় জামে মসজিদ, ক্লাব ভবন, প্রধান ফটক, সাব-গেট, শিশুদের খেলার মাঠ, ময়লা ফেলার নির্ধারিত স্থান এবং পানির পাম্পের অবস্থান ম্যাপে সরাসরি প্রদর্শিত হয়।</li>
      <li><strong>বিস্তারিত তথ্য ও গুগল ম্যাপ নেভিগেশন:</strong> যেকোনো ল্যান্ডমার্কের ওপর ট্যাপ করলে তার বিস্তারিত দেখা যাবে এবং <em>"নেভিগেশন পান"</em> চাপলে সরাসরি গুগল ম্যাপে রুট চালু হবে।</li>
      <li><strong>লাইভ লোকেশন শেয়ারিং:</strong> জরুরি পরিস্থিতিতে বা সোসাইটির ভেতর কাউকে অবস্থান জানাতে <em>"লাইভ লোকেশন শেয়ার করুন"</em> চাপুন। আপনার বর্তমান অবস্থান, ব্যাটারি পারসেন্টেজ এবং সময় অন্যান্য সদস্যদের নিকট নিরাপদে প্রদর্শিত হবে। যেকোনো সময় এক ক্লিকেই লোকেশন শেয়ার বন্ধ করা যাবে।</li>
    </ul>

    <h2>২.৩ মাসিক চাঁদা ও অফিশিয়াল রসিদ</h2>
    <ul>
      <li><strong>হিসাবের বিবরণ:</strong> ক্লাবের মাসিক চাঁদা, নিরাপত্তা ফি এবং পরিচ্ছন্নতা বিলের বিস্তারিত বিবরণ।</li>
      <li><strong>পরিশোধের মাধ্যম:</strong> বিকাশ, নগদ, ব্যাংক ট্রান্সফার বা সরাসরি কোষাধ্যক্ষের কাছে ক্যাশ প্রদান।</li>
      <li><strong>স্বাক্ষরিত অফিসিয়াল রসিদ:</strong> চাঁদা পরিশোধের পর কিউআর কোড (QR) ও সভাপতির ডিজিটাল স্বাক্ষর সম্বলিত ভেরিফাইড রসিদ তাৎক্ষণিক ডাউনলোড ও প্রিন্ট করার সুবিধা।</li>
    </ul>

    <h2>২.৪ জরুরি হটলাইন ও রক্ত ব্যাংক</h2>
    <div class="grid-2">
      <div class="card">
        <div class="card-title">জরুরি হটলাইন</div>
        <p>এক ক্লিকেই সিকিউরিটি গেট, অন-কল ইলেকট্রিশিয়ান, প্লাম্বার, সভাপতি, থানা পুলিশ ও ফায়ার সার্ভিসের নম্বরে সরাসরি ফোন করুন।</p>
      </div>
      <div class="card">
        <div class="card-title">কমিউনিটি ব্লাড ব্যাংক</div>
        <p>জরুরি প্রয়োজনে রক্তের গ্রুপভিত্তিক (A+, B+, O+, AB+ ইত্যাদি) রক্তদাতাদের তালিকা থেকে সহজে সরাসরি যোগাযোগ করুন।</p>
      </div>
    </div>

    <h2>২.৫ অভিযোগ ও সার্ভিস টিকিট দাখিল</h2>
    <p>
      সোসাইটিতে বিদ্যুৎ সমস্যা, পানির লাইনে ত্রুটি, ময়লা বা নিরাপত্তার সমস্যা দেখা দিলে:
    </p>
    <ol>
      <li><strong>টিকেট / অভিযোগ</strong> মেনুতে গিয়ে <em>"নতুন অভিযোগ"</em> নির্বাচন করুন।</li>
      <li>সমস্যার ধরন, ফ্ল্যাট নম্বর ও বিস্তারিত বিবরণ লিখুন এবং প্রয়োজনে ছবি যুক্ত করুন।</li>
      <li>কমিটি পদক্ষেপ গ্রহণ করলে আবেদনের অগ্রগতি (খোলা → প্রক্রিয়াধীন → সমাধান) ট্র্যাকিং দেখতে পাবেন।</li>
    </ol>
  </div>

  <div class="page">
    <h1>৩. গঠনতন্ত্র, গণতান্ত্রিক নির্বাচন ও সভা</h1>

    <h2>৩.১ ডিজিটাল গোপন ব্যালটে কার্যনির্বাহী নির্বাচন</h2>
    <p>
      কুঞ্জছায়া ক্লাবের কার্যনির্বাহী কমিটি গঠনে ডিজিটাল নির্বাচন ব্যবস্থা চালু রয়েছে:
    </p>
    <ul>
      <li><strong>ভোটার তালিকা:</strong> অনুমোদিত এবং চাঁদা হালনাগাদ থাকা সদস্যগণ ডিজিটাল ব্যালট পেপারে প্রবেশাধিকার পান।</li>
      <li><strong>গোপন ব্যালট:</strong> প্রতিটি পদের বিপরীতে ১ জন সদস্য মাত্র ১টি ভোট দিতে পারেন। ব্যালট সম্পূর্ণ গোপনীয় ও এনক্রিপ্টেড।</li>
      <li><strong>প্রার্থীদের পরিচিতি:</strong> ভোট দেওয়ার পূর্বে প্রার্থীদের ছবি ও নির্বাচনী ইশতেহার পড়ার সুযোগ রয়েছে।</li>
      <li><strong>ফলাফল ঘোষণা:</strong> নির্বাচন কমিশন ভোটগ্রহণ সমাপ্ত করার সাথে সাথেই ডিজিটাল গণনার ভিত্তিতে বিজয়ীদের তালিকা প্রকাশিত হয়।</li>
    </ul>

    <h2>৩.২ বার্ষিক সাধারণ সভা (AGM) ও সিদ্ধান্তসমূহ</h2>
    <p>
      বার্ষিক সাধারণ সভার তারিখ, আলোচ্যসূচি, প্রস্তাবনাবলী এবং অডিট রিপোর্ট ডিজিটালভাবে সংরক্ষণ করা হয় এবং সদস্যরা যেকোনো রেজুলেশনের ওপর মতামত প্রদান করতে পারেন।
    </p>

    <h2>৩.৩ সংবিধান ও উপবিধি</h2>
    <p>
      কুঞ্জছায়া হাউজিং ক্লাবের সকল ধারা ও উপ-ধারা বাংলা ও ইংরেজি উভয় ভাষায় সহজেই অনুসন্ধান ও পাঠ করা যায়।
    </p>

    <h2>৩.৪ কমিউনিটি চ্যাট ও ইভেন্ট</h2>
    <ul>
      <li><strong>সোসাইটি চ্যাট ফোরাম:</strong> প্রতিবেশীদের সাথে গঠনমূলক আলোচনা ও গুরুত্বপূর্ণ তথ্য আদান-প্রদান।</li>
      <li><strong>ক্লাব ইভেন্ট ও আরএসভিপি (RSVP):</strong> সোসাইটির পিকনিক, ক্রীড়া প্রতিযোগিতা বা বার্ষিক অনুষ্ঠানে পরিবারের সদস্য সংখ্যা নিশ্চিত করার ব্যবস্থা।</li>
    </ul>
  </div>

  <div class="page">
    <h1>৪. প্রশাসক ও পরিচালনা পরিষদ গাইড (অ্যাডমিন)</h1>

    <h2>৪.১ অ্যাডমিন ড্রয়ার মেনুর পরিচিতি</h2>
    <p>
      প্রশাসকদের জন্য নেভিগেশন ড্রয়ারে ৫টি প্রধান গ্রুপ রয়েছে:
    </p>
    <ul>
      <li><strong>ব্যবস্থাপনা:</strong> অ্যাডমিন ড্যাশবোর্ড, সদস্য তালিকা, চাঁদার হিসাব, পেমেন্ট হিস্ট্রি, খরচ/ব্যয়, মডিউল অন/অফ।</li>
      <li><strong>যোগাযোগ:</strong> কমিউনিটি চ্যাট, নোটিশ বোর্ড, অফিসিয়াল চিঠি, হটলাইন।</li>
      <li><strong>পরিচালনা:</strong> নির্বাচন পরিচালনা, এজিএম, সংবিধান সংশোধন, কর্মকর্তা তালিকা, কমিটি হস্তান্তর।</li>
      <li><strong>সম্প্রদায়:</strong> ব্লাড ব্যাংক, ইভেন্ট, ব্যাজ, বাজেট, অডিট লগ এবং <strong>ম্যাপ ল্যান্ডমার্ক</strong>।</li>
      <li><strong>অ্যাকাউন্ট:</strong> অভিযোগ সমাধান, প্রোফাইল, সিস্টেম সেটিংস।</li>
    </ul>

    <h2>৪.২ ম্যাপ ল্যান্ডমার্ক ব্যবস্থাপনা (সুপার অ্যাডমিন ও OIC)</h2>
    <div class="box admin">
      <div class="box-title">মেনুর অবস্থান: অ্যাডমিন ড্রয়ার → সম্প্রদায় → ম্যাপ ল্যান্ডমার্ক</div>
      অনুমতিপ্রাপ্ত: <strong>সভাপতি, সাধারণ সম্পাদক, যুগ্ম সাধারণ সম্পাদক, দায়িত্বপ্রাপ্ত কর্মকর্তা (OIC)</strong>।
    </div>
    <p>সোসাইটির ম্যাপের যেকোনো স্থাপনা যোগ ও সংশোধন করার পূর্ণাঙ্গ নিয়ন্ত্রণ:</p>
    <ul>
      <li><strong>নতুন ল্যান্ডমার্ক যুক্ত করা:</strong> নাম (বাংলা ও ইংরেজি), ক্যাটাগরি, জিপিএস অক্ষাংশ (Latitude) ও দ্রাঘিমাংশ (Longitude) লিখুন।</li>
      <li><strong>আইকন ও রঙ নির্বাচন:</strong> ২৮টি ইমোজি আইকন এবং ১৫টি আকর্ষণীয় রঙের মধ্য থেকে পছন্দ করুন।</li>
      <li><strong>গুগল ম্যাপ প্রিভিউ:</strong> সেভ করার আগেই গুগল ম্যাপ লিংকে ক্লিক করে পয়েন্টের নির্ভুল অবস্থান যাচাই করুন।</li>
      <li><strong>হাইড / আনহাইড:</strong> কোনো সাময়িক স্থাপনা মুছে না ফেলে সাময়িকভাবে বন্ধ রাখতে "ম্যাপে দেখান" সুইচটি বন্ধ করুন।</li>
      <li><strong>ডাটাবেজে সংরক্ষণ:</strong> "Save to Database" চাপলেই এটি সরাসরি সুপাবেস ক্লাউডে সংরক্ষিত হবে এবং সকল বাসিন্দার ফোনে আপডেট চলে যাবে।</li>
      <li><strong>পূর্বনির্ধারিত অবস্থায় রিসেট:</strong> প্রয়োজন হলে "Reset to Defaults" চেপে মূল ১০টি প্রধান ল্যান্ডমার্ক পুনরুদ্ধার করতে পারবেন।</li>
    </ul>

    <h2>৪.৩ সুপার অ্যাডমিন মডিউল অন/অফ সিস্টেম</h2>
    <p>
      <strong>ব্যবস্থাপনা → মডিউল</strong> (শুধুমাত্র সভাপতি ও সাধারণ সম্পাদকের জন্য):
    </p>
    <ul>
      <li>যেকোনো সময় কোনো মডিউল (যেমন: নির্বাচন, চ্যাট, বাজেট) সাধারণ ব্যবহারকারীদের জন্য অন বা অফ করতে পারবেন।</li>
      <li>বন্ধ করা মডিউলটি সাথে সাথে সাধারণ সদস্যদের মেনু থেকে অদৃশ্য হয়ে যাবে।</li>
    </ul>

    <h2>৪.৪ অফিসিয়াল চিঠি ও নোটিশ জেনারেটর</h2>
    <p>
      <strong>যোগাযোগ → অফিসিয়াল চিঠি</strong> মেনুর মাধ্যমে সোসাইটির অফিশিয়াল প্যাডে সরাসরি নোটিশ, সাধারণ চিঠি বা সতর্কবার্তা তৈরি করা যায়। এতে স্বয়ংক্রিয় স্মারক নম্বর, তারিখ এবং সভাপতির স্বাক্ষর যুক্ত হয় যা সরাসরি ১-ক্লিকে প্রিন্ট ও পিডিএফ করা সম্ভব।
    </p>

    <h2>৪.৫ আয়-ব্যয় হিসাব ও ভাউচার</h2>
    <ul>
      <li><strong>চাঁদা আদায়:</strong> এক ক্লিকে সকল ফ্ল্যাটের জন্য মাসিক বিল তৈরি এবং আদায় রেকর্ড করা।</li>
      <li><strong>খরচের হিসাব:</strong> নিরাপত্তা প্রহরীর বেতন, পরিচ্ছন্নতা খরচ ও রক্ষণাবেক্ষণ ভাউচার এন্ট্রি এবং সভাপতির ডিজিটাল অনুমোদন।</li>
    </ul>
  </div>

  <div class="page">
    <h1>৫. সমস্যা সমাধান ও নিরাপত্তা নির্দেশনা</h1>

    <h2>৫.১ জিপিএস (GPS) লোকেশন সমস্যা হলে</h2>
    <ul>
      <li>ফোনের সেটিংস থেকে ক্রোম বা অ্যাপটিকে <strong>Location (সঠিক অবস্থান)</strong> ব্যবহারের অনুমতি দিন।</li>
      <li>ফোনের লোকেশন সার্ভিস (GPS) চালু আছে কি না তা যাচাই করুন।</li>
    </ul>

    <h2>৫.২ অ্যাকাউন্ট ও পাসওয়ার্ড নিরাপত্তা</h2>
    <ul>
      <li>আপনার লগইন পাসওয়ার্ড কখনো অন্য কারো সাথে শেয়ার করবেন না।</li>
      <li>কোনো কর্মকর্তা দায়িত্ব থেকে অব্যাহতি পেলে সুপার অ্যাডমিন <strong>সদস্য → কমিটি নিয়োগ</strong> পেজ থেকে তাৎক্ষণিক তার অ্যাডমিন অনুমতি প্রত্যাহার করবেন।</li>
    </ul>

    <div class="box warning">
      <div class="box-title">যোগাযোগ ও কারিগরি সহায়তা</div>
      যেকোনো তথ্য বা প্রযুক্তিগত সহায়তার জন্য কুঞ্জছায়া ক্লাব কার্যালয়ে যোগাযোগ করুন অথবা অ্যাপের অভিযোগ ও সাপোর্ট সেকশনে টিকেট দাখিল করুন।
    </div>

    <div class="footer-nav">
      কুঞ্জছায়া ক্লাব • সর্বস্বত্ব সংরক্ষিত © ২০২৬ • অফিসিয়াল ব্যবহার নির্দেশিকা
    </div>
  </div>
  `;
}

function buildHtml(title, langBadge, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>${css}</style>
</head>
<body>
  ${content}
</body>
</html>`;
}

// 1. Generate English HTML
const enHtml = buildHtml("Kunjachaya Club - User Manual", "EN", getEnglishContent());
fs.writeFileSync(path.join(docsDir, "kunjachaya_user_manual_en.html"), enHtml, "utf8");
fs.writeFileSync(path.join(publicDocsDir, "kunjachaya_user_manual_en.html"), enHtml, "utf8");

// 2. Generate Bengali HTML
const bnbHtml = buildHtml("কুঞ্জছায়া ক্লাব - ব্যবহারকারী নির্দেশিকা", "BN", getBengaliContent());
fs.writeFileSync(path.join(docsDir, "kunjachaya_user_manual_bn.html"), bnbHtml, "utf8");
fs.writeFileSync(path.join(publicDocsDir, "kunjachaya_user_manual_bn.html"), bnbHtml, "utf8");

// 3. Generate Combined Bilingual HTML
const biHtml = buildHtml("Kunjachaya Club - Bilingual User Manual (দ্বিভাষিক নির্দেশিকা)", "Bilingual", getEnglishContent() + '<div style="page-break-before: always;"></div>' + getBengaliContent());
fs.writeFileSync(path.join(docsDir, "kunjachaya_user_manual_bilingual.html"), biHtml, "utf8");
fs.writeFileSync(path.join(publicDocsDir, "kunjachaya_user_manual_bilingual.html"), biHtml, "utf8");

console.log("HTML files generated successfully in docs/user_manual and public/docs");

// PDF conversion using headless Chrome
const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function renderPdf(htmlName, pdfName) {
  const htmlFile = path.join(docsDir, htmlName);
  const pdfFile = path.join(docsDir, pdfName);
  const publicPdfFile = path.join(publicDocsDir, pdfName);
  const tempProfile = path.join(os.tmpdir(), 'chrome_pdf_' + Math.random().toString(36).slice(2));

  try {
    execFileSync(chromePath, [
      '--headless=new',
      '--disable-gpu',
      '--user-data-dir=' + tempProfile,
      '--no-first-run',
      '--no-default-browser-check',
      '--no-pdf-header-footer',
      '--print-to-pdf=' + pdfFile,
      'file:///' + htmlFile.replace(/\\/g, '/')
    ], { timeout: 25000 });

    if (fs.existsSync(pdfFile)) {
      fs.copyFileSync(pdfFile, publicPdfFile);
      console.log(`[SUCCESS] Generated: ${pdfName} (${fs.statSync(pdfFile).size} bytes)`);
    } else {
      console.error(`[FAIL] ${pdfName} was not created`);
    }
    try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch (_) {}
  } catch (err) {
    console.error(`[ERROR] Rendering ${pdfName}:`, err.message);
    try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch (_) {}
  }
}

renderPdf("kunjachaya_user_manual_en.html", "Kunjachaya_Club_User_Manual_English.pdf");
renderPdf("kunjachaya_user_manual_bn.html", "Kunjachaya_Club_User_Manual_Bengali.pdf");
renderPdf("kunjachaya_user_manual_bilingual.html", "Kunjachaya_Club_User_Manual_Bilingual.pdf");
