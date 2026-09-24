import { Home, Wallet, Award, CalendarCheck, Star, Gift } from "lucide-react";

/* ============================== LOGO ============================== */
// The real Kunjachaya Club mark, extracted from the original Stitch
// export and embedded as a data URI (no external file hosting exists
// inside this artifact runtime, so this is the reliable way to ship a
// real image asset with the component).
export const LOGO_MARK = "/logo-mark.png";
export const LOGO_FULL = "/logo-full.png"; // mark + Bengali wordmark, for splash/login

/* ============================== VERSION ============================== */
// Single source of truth — update this on every release. Imported by
// Shell.jsx (sidebar badge) and Settings.jsx (app info card + about section).
export const APP_VERSION = "2.3.0";

export const C = {
  primary: "var(--c-primary, #154212)",
  primaryContainer: "var(--c-primary-container, #2d5a27)",
  onPrimaryContainer: "var(--c-on-primary-container, #eaffe0)",
  onPrimary: "var(--c-on-primary, #ffffff)",
  secondary: "var(--c-secondary, #526345)",
  secondaryContainer: "var(--c-secondary-container, #d2e6c0)",
  onSecondaryContainer: "var(--c-on-secondary-container, #263219)",
  tertiary: "var(--c-tertiary, #5e2b00)",
  tertiaryContainer: "var(--c-tertiary-container, #7e3f09)",
  onTertiaryContainer: "var(--c-on-tertiary-container, #ffe4cc)",
  background: "var(--c-background, #fbf9f5)",
  surface: "var(--c-surface, #ffffff)",
  surfaceVariant: "var(--c-surface-variant, #e4e2de)",
  surfaceContainer: "var(--c-surface-container, #efeeea)",
  surfaceContainerLow: "var(--c-surface-container-low, #f5f3ef)",
  surfaceContainerHigh: "var(--c-surface-container-high, #eae8e4)",
  onSurface: "var(--c-on-surface, #1b1c1a)",
  onSurfaceVariant: "var(--c-on-surface-variant, #42493e)",
  outline: "var(--c-outline, #8a9182)",
  outlineVariant: "var(--c-outline-variant, #dfe3d9)",
  error: "var(--c-error, #ba1a1a)",
  errorContainer: "var(--c-error-container, #ffdad6)",
  onErrorContainer: "var(--c-on-error-container, #93000a)",
  gold: "var(--c-gold, #a06a00)",
  goldContainer: "var(--c-gold-container, #ffe3ac)",
  successContainer: "var(--c-success-container, #d2e6c0)",
  onSuccessContainer: "var(--c-on-success-container, #154212)",
  infoContainer: "var(--c-info-container, #dbe6ff)",
  onInfoContainer: "var(--c-on-info-container, #1e3a8a)",
};

export const STR = {
  en: {
    appName: "Kunjachaya Club", tagline: "Community, governed together",
    home: "Home", directory: "Directory", notices: "Notices", dues: "Dues",
    financials: "Financials & Dues",
    paymentHistory: "Payment History",
    elections: "Elections", tickets: "Support", profile: "Profile",
    dashboard: "Dashboard", members: "Members", activity: "Activity Log",
    login: "Log in", register: "Create account", logout: "Log out",
    hotlines: "Hotlines", badges: "Badges", agm: "AGM", amendments: "Amendments",
    handover: "Handover", chat: "Chat", budget: "Budget", audit: "Audit",
    bloodBank: "Blood Bank", officers: "Officers", constitution: "Constitution", events: "Events",
    log: "Log & Audit", settings: "Settings",
    modules: "App Modules", letters: "Official Letters", expenses: "Expenses Ledger",
    all: "All", block: "Block", unit: "Unit", save: "Save", edit: "Edit", delete: "Delete",
    cancel: "Cancel", status: "Status", active: "Active", pending: "Pending",
    donor: "Donor", listed: "Listed", bloodGroup: "Blood Group",
    availableToDonate: "Available to donate", notSet: "Not set", search: "Search",
    filter: "Filter", yourInfo: "Your info", total: "Total", paid: "Paid",
    due: "Due", unpaid: "Unpaid", vote: "Vote", voted: "Voted",
    candidates: "Candidates", manifesto: "Manifesto", approve: "Approve",
    reject: "Reject", confirm: "Confirm", back: "Back", submit: "Submit",
    details: "Details", actions: "Actions", date: "Date", amount: "Amount",
    category: "Category", description: "Description", title: "Title",
    noRecords: "No records found", welcomeBack: "Welcome back",
    call: "Call", whatsapp: "WhatsApp", email: "Email",
    kickOut: "Kick Out Member", kickOutConfirm: "Are you sure you want to remove/kick out this member?",
    viewProfile: "Quick View", phone: "Phone",
  },
  bn: {
    appName: "কুঞ্জছায়া ক্লাব", tagline: "একতাবদ্ধ আবাসিক সম্প্রদায়",
    home: "হোম", directory: "সদস্য তালিকা", notices: "নোটিশ", dues: "চাঁদা",
    financials: "চাঁদা ও আর্থিক",
    paymentHistory: "চাঁদা আদায়ের ইতিহাস",
    elections: "নির্বাচন", tickets: "অভিযোগ ও সহায়তা", profile: "প্রোফাইল",
    dashboard: "ড্যাশবোর্ড", members: "সদস্য", activity: "কার্যক্রমের রেকর্ড",
    login: "লগ ইন", register: "অ্যাকাউন্ট তৈরি করুন", logout: "লগ আউট",
    hotlines: "জরুরি হটলাইন", badges: "সম্মাননা ব্যাজ", agm: "বার্ষিক সাধারণ সভা", amendments: "সংশোধনী",
    handover: "দায়িত্ব হস্তান্তর", chat: "চ্যাট", budget: "আয়-ব্যয় বাজেট", audit: "আর্থিক নিরীক্ষা",
    bloodBank: "ব্লাড ব্যাংক", officers: "কর্মকর্তাগণ", constitution: "গঠনতন্ত্র", events: "অনুষ্ঠানসমূহ",
    log: "লগ ও অডিট", settings: "সেটিংস",
    modules: "অ্যাপ মডিউল", letters: "অফিসিয়াল পত্র ও স্মারক", expenses: "ব্যয় খতিয়ান",
    all: "সকল", block: "ব্লক", unit: "ইউনিট", save: "সংরক্ষণ", edit: "সম্পাদনা", delete: "মুছুন",
    cancel: "বাতিল", status: "অবস্থা", active: "সক্রিয়", pending: "অপেক্ষমাণ",
    donor: "রক্তদাতা", listed: "তালিকাভুক্ত", bloodGroup: "রক্তের গ্রুপ",
    availableToDonate: "রক্তদানে আগ্রহী", notSet: "নির্ধারিত নয়", search: "অনুসন্ধান",
    filter: "ফিল্টার", yourInfo: "আপনার তথ্য", total: "মোট", paid: "পরিশোধিত",
    due: "বকেয়া", unpaid: "অপরিশোধিত", vote: "ভোট দিন", voted: "ভোট সম্পন্ন",
    candidates: "প্রার্থীগণ", manifesto: "ইশতেহার", approve: "অনুমোদন",
    reject: "প্রত্যাখ্যান", confirm: "নিশ্চিত করুন", back: "ফিরে যান", submit: "জমা দিন",
    details: "বিস্তারিত", actions: "কার্যক্রম", date: "তারিখ", amount: "পরিমাণ",
    category: "শ্রেণি", description: "বিবরণ", title: "শিরোনাম",
    noRecords: "কোনো তথ্য পাওয়া যায়নি", welcomeBack: "পুনরায় স্বাগতম",
    call: "ফোন করুন", whatsapp: "হোয়াটসঅ্যাপ", email: "ইমেইল",
    kickOut: "সদস্যপদ বাতিল / বহিষ্কার", kickOutConfirm: "আপনি কি নিশ্চিতভাবে এই সদস্যকে বহিষ্কার / বাতিল করতে চান?",
    viewProfile: "সংক্ষিপ্ত প্রোফাইল দেখুন", phone: "ফোন নম্বর",
  },
};

export const BADGE_CATALOG = [
  { id: "b_founder", name: "Founding Member", icon: "Star", description: "Awarded to residents who established the club in its founding year." },
  { id: "b_treasurer", name: "Financial Steward", icon: "Wallet", description: "Recognizes exceptional service managing club finances." },
  { id: "b_volunteer", name: "Community Champion", icon: "Award", description: "Given for outstanding volunteer contribution to events and drives." },
  { id: "b_donor", name: "Generous Donor", icon: "Gift", description: "Awarded to members who've made significant donations to the club fund." },
  { id: "b_perfect", name: "Perfect Attendance", icon: "CalendarCheck", description: "For attending every AGM and general meeting in a term." },
];
export const BADGE_ICONS = { Star, Wallet, Award, Gift, CalendarCheck };

export const CONSTITUTION_ARTICLES = [
  { num: 1, title: "Name of the Organization", en: "The organization shall be named \"Kunjachaya Club.\"", bn: "প্রতিষ্ঠানটির নাম হবে \"কুঞ্জছায়া ক্লাব\"।" },
  { num: 2, title: "Address", en: "Kunjachhaya Residential Area, Police Station: Bayezid Bostami, District: Chattogram.", bn: "কুঞ্জছায়া আবাসিক এলাকা, থানা: বায়েজিদ বোস্তামী, জেলা: চট্টগ্রাম।" },
  { num: 3, title: "Area of Operation", en: "The area of operation of this organization shall be strictly confined to Kunjachhaya Residential Area.", bn: "এই প্রতিষ্ঠানের কার্য এলাকা কুঞ্জছায়া আবাসিক এলাকায় সীমাবদ্ধ থাকবে।" },
  { num: 4, title: "Nature and Characteristics", en: "The organization shall operate social development activities as a non-political and voluntary organization. The organization is Not-for-Profit, and none of its income or assets shall be distributed among the members personally.", bn: "প্রতিষ্ঠানটি একটি অরাজনৈতিক ও স্বেচ্ছাসেবী সংগঠন হিসেবে সামাজিক উন্নয়নমূলক কাজ পরিচালনা করবে। প্রতিষ্ঠানটি অলাভজনক এবং ইহার কোনো আয় বা সম্পদ সদস্যদের মধ্যে ব্যক্তিগতভাবে বণ্টিত হবে না।" },
  { num: 5, title: "Aims and Objectives", en: "The organization is committed to taking up multi-dimensional self-employment programs including socio-economic, educational, cultural, sports, and overall development for the backward and underprivileged segments of society, alongside maintaining convenience and amenities for local residents through social development and philanthropic activities.", bn: "প্রতিষ্ঠানটি সমাজ-উন্নয়নমূলক ও মানবহিতৈষী কর্মকাণ্ডের লক্ষ্যে এলাকার জনগণের সুযোগ-সুবিধা বজায় রাখার পাশাপাশি সমাজের পশ্চাৎপদ ও অনগ্রসর জনগোষ্ঠীর আর্থ-সামাজিক, শিক্ষা, সংস্কৃতি, ক্রীড়া ও উন্নয়নসহ বহুমুখী কর্মসূচি গ্রহণ করবে।" },
  { num: 6, title: "Categories of Membership", en: "Membership shall be organized into categories including New, General, Founding, Advisory, Life, and Donor members, each with defined rights and eligibility as set out by the Executive Committee.", bn: "সদস্যপদ নতুন, সাধারণ, প্রতিষ্ঠাতা, উপদেষ্টা, আজীবন এবং দাতা সদস্য শ্রেণিতে বিভক্ত থাকবে, প্রতিটির নির্দিষ্ট অধিকার ও যোগ্যতা নির্বাহী কমিটি দ্বারা নির্ধারিত হবে।" },
  { num: 17, title: "Officer Roles & Appointment", en: "Committee posts and role permissions may only be assigned or amended by the President or the General Secretary.", bn: "কমিটির পদ ও অনুমতি কেবল সভাপতি বা সাধারণ সম্পাদক দ্বারা নিয়োগ বা সংশোধন করা যাবে।" },
  { num: 18, title: "Standing Council Powers and Responsibilities", en: "The Standing Council holds the ultimate authority to make final decisions regarding constitutional amendments, annual club reports, and budget approvals. The Council is explicitly responsible for overseeing the Election Commission and ensuring its independent operation during election cycles.", bn: "সংবিধান সংশোধন, ক্লাবের বার্ষিক প্রতিবেদন এবং বাজেট অনুমোদনের বিষয়ে চূড়ান্ত সিদ্ধান্ত নেওয়ার ক্ষমতা স্থায়ী পরিষদের রয়েছে। পরিষদ নির্বাচন কমিশন তদারকি ও নির্বাচনের সময় এর স্বাধীন কার্যক্রম নিশ্চিত করার জন্য দায়ী।" },
  { num: 21, title: "AGM Quorum", en: "A quorum shall consist of one-third of active general members.", bn: "কোরাম গঠনে সক্রিয় সাধারণ সদস্যদের এক-তৃতীয়াংশ প্রয়োজন হবে।" },
  { num: 23, title: "Election Commission", en: "An independent Election Commission consisting of exactly 3 (three) members shall be formed to conduct club elections impartially. This commission operates autonomously during the election period, subject only to the procedural oversight of the Standing Council.", bn: "ক্লাবের নির্বাচন নিরপেক্ষভাবে পরিচালনার জন্য ঠিক ৩ জন সদস্য নিয়ে একটি স্বাধীন নির্বাচন কমিশন গঠন করা হবে। এই কমিশন নির্বাচনের সময় স্বায়ত্তশাসিতভাবে কাজ করে, কেবল স্থায়ী পরিষদের পদ্ধতিগত তদারকির সাপেক্ষে।" },
];

export const BLOCKS = ["A", "B", "C", "D", "E"];
export const MEMBER_CLASSES = ["New", "General", "Founding", "Advisory", "Life", "Donor"];
export const PERMISSION_KEYS = ["canManageMembers", "canManageNotices", "canManageFinancials", "canManageComplaints", "canDeleteItems"];

export const COMMITTEE_POSTS = [
  "President",
  "Vice-President",
  "General Secretary",
  "Assistant General Secretary",
  "Treasurer",
  "Organizing Secretary",
  "Social Welfare Secretary",
  "Literature & Cultural Secretary",
  "Publicity Secretary",
  "Sports Secretary",
  "Women's Affairs Secretary",
  "Executive Member",
];

export const EC_CONSTITUTIONAL_STRUCTURE = [
  { id: 1, titleBn: "সভাপতি", titleEn: "President", seats: 1, key: "President" },
  { id: 2, titleBn: "সহ-সভাপতি", titleEn: "Vice-President", seats: 2, key: "Vice-President" },
  { id: 3, titleBn: "সাধারণ সম্পাদক", titleEn: "General Secretary", seats: 1, key: "General Secretary" },
  { id: 4, titleBn: "সহ-সাধারণ সম্পাদক", titleEn: "Assistant General Secretary", seats: 1, key: "Assistant General Secretary" },
  { id: 5, titleBn: "কোষাধ্যক্ষ", titleEn: "Treasurer", seats: 1, key: "Treasurer" },
  { id: 6, titleBn: "সাংগঠনিক সম্পাদক", titleEn: "Organizing Secretary", seats: 1, key: "Organizing Secretary" },
  { id: 7, titleBn: "সমাজকল্যাণ সম্পাদক", titleEn: "Social Welfare Secretary", seats: 1, key: "Social Welfare Secretary" },
  { id: 8, titleBn: "সাহিত্য ও সংস্কৃতি সম্পাদক", titleEn: "Literature & Cultural Secretary", seats: 1, key: "Literature & Cultural Secretary" },
  { id: 9, titleBn: "প্রচার সম্পাদক", titleEn: "Publicity Secretary", seats: 1, key: "Publicity Secretary" },
  { id: 10, titleBn: "ক্রীড়া সম্পাদক", titleEn: "Sports Secretary", seats: 1, key: "Sports Secretary" },
  { id: 11, titleBn: "মহিলাবিষয়ক সম্পাদক", titleEn: "Women's Affairs Secretary", seats: 1, key: "Women's Affairs Secretary" },
  { id: 12, titleBn: "কার্যকরী সদস্য", titleEn: "Executive Member", seats: 3, key: "Executive Member" },
];

export const POST_DEFAULT_PERMISSIONS = {
  "President": { canManageMembers: true, canManageNotices: true, canManageFinancials: true, canManageComplaints: true, canDeleteItems: true },
  "General Secretary": { canManageMembers: true, canManageNotices: true, canManageFinancials: true, canManageComplaints: true, canDeleteItems: true },
  "Treasurer": { canManageMembers: false, canManageNotices: false, canManageFinancials: true, canManageComplaints: false, canDeleteItems: false },
  "Publicity Secretary": { canManageMembers: false, canManageNotices: true, canManageFinancials: false, canManageComplaints: false, canDeleteItems: false },
  "Social Welfare Secretary": { canManageMembers: false, canManageNotices: false, canManageFinancials: false, canManageComplaints: true, canDeleteItems: false },
};
