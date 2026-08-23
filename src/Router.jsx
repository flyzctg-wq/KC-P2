import React, { useState, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { C } from "./theme";

// Every screen is its own lazy chunk. A resident who never opens the
// admin portal, Standing Council tools, or committee handover screen
// never downloads that code — this is the fix for the page-speed
// finding in the pre-launch audit (the whole app used to ship as one
// ~270KB bundle regardless of role).
const ResidentHome = lazy(() => import("./screens/Home"));
const Directory = lazy(() => import("./screens/Directory"));
const Notices = lazy(() => import("./screens/Notices"));
const Dues = lazy(() => import("./screens/Dues"));
const Elections = lazy(() => import("./screens/Elections"));
const Tickets = lazy(() => import("./screens/Tickets"));
const Profile = lazy(() => import("./screens/Profile"));
const Hotlines = lazy(() => import("./screens/Hotlines"));
const Badges = lazy(() => import("./screens/Badges"));
const AGM = lazy(() => import("./screens/AGM"));
const Amendments = lazy(() => import("./screens/Amendments"));
const Chat = lazy(() => import("./screens/Chat"));
const Budget = lazy(() => import("./screens/Budget"));
const Audit = lazy(() => import("./screens/Audit"));
const BloodBank = lazy(() => import("./screens/BloodBank"));
const Officers = lazy(() => import("./screens/Officers"));
const Constitution = lazy(() => import("./screens/Constitution"));
const Events = lazy(() => import("./screens/Events"));
const Legal = lazy(() => import("./screens/Legal"));
const Settings = lazy(() => import("./screens/Settings"));

const AdminDashboard = lazy(() => import("./screens/admin/Dashboard"));
const AdminMembers = lazy(() => import("./screens/admin/Members"));
const AdminNotices = lazy(() => import("./screens/admin/Notices"));
const AdminDues = lazy(() => import("./screens/admin/Dues"));
const AdminElections = lazy(() => import("./screens/admin/Elections"));
const AdminTickets = lazy(() => import("./screens/admin/Tickets"));

const AdminLetters = lazy(() => import("./screens/admin/Letters"));
const PaymentHistory = lazy(() => import("./screens/admin/PaymentHistory"));
const Handover = lazy(() => import("./screens/Handover"));

function ScreenFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="animate-spin" size={22} style={{ color: C.primary }} />
    </div>
  );
}

export default function Router({
  session, db, persist, view, setView, toast, logActivity, setSession,
  lang, setLang, t, theme, setTheme, fontSize, setFontSize, appSettings, setAppSettings
}) {
  const [params, setParams] = useState({});
  const go = (v, p = {}) => { setParams(p); setView(v); };

  const props = {
    session, db, persist, toast, logActivity, go, params, setSession,
    lang, setLang, t, theme, setTheme, fontSize, setFontSize, appSettings, setAppSettings
  };

  const Screen = (() => {
    switch (view) {
      case "r-home": return ResidentHome;
      case "r-directory": return Directory;
      case "r-notices": return Notices;
      case "r-dues": return Dues;
      case "r-elections": return Elections;
      case "r-tickets": return Tickets;
      case "r-profile": return Profile;
      case "a-dashboard": return AdminDashboard;
      case "a-members": return AdminMembers;
      case "a-notices": return AdminNotices;
      case "a-dues": return AdminDues;
      case "a-elections": return AdminElections;
      case "a-tickets": return AdminTickets;
      case "a-activity": return Audit;
      case "a-letters":
      case "letters": return AdminLetters;
      case "a-payment-history": return PaymentHistory;
      case "agm": return AGM;
      case "amendments": return Amendments;
      case "hotlines": return Hotlines;
      case "badges": return Badges;
      case "a-handover": return Handover;
      case "chat": return Chat;
      case "budget": return Budget;
      case "audit": return Audit;
      case "bloodBank": return BloodBank;
      case "officers": return Officers;
      case "events": return Events;
      case "constitution": return Constitution;
      case "legal": return Legal;
      case "settings": return Settings;
      default: return ResidentHome;
    }
  })();

  return (
    <Suspense fallback={<ScreenFallback />}>
      <Screen {...props} />
    </Suspense>
  );
}
