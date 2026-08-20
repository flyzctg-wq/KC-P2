import React from "react";
import { Home, Users, Bell, Wallet, Vote, LifeBuoy, User, LogOut, Menu, X, BarChart3, Award, ClipboardList, Globe, PhoneCall, Scale, ArrowLeftRight, CalendarCheck, MessageCircle, PieChart, FileSearch, Droplet, BadgeCheck, BookOpen, CalendarRange, FileText } from "lucide-react";
import { Avatar } from "../components/primitives";
import { C, LOGO_MARK } from "../theme";

/* ============================== SHELL / NAV ============================== */
const RESIDENT_NAV = [
  { key: "r-home", label: "home", icon: Home },
  { key: "r-directory", label: "directory", icon: Users },
  { key: "r-dues", label: "financials", icon: Wallet },
  { key: "chat", label: "chat", icon: MessageCircle },
  { key: "r-notices", label: "notices", icon: Bell },
  { key: "r-elections", label: "elections", icon: Vote },
  { key: "agm", label: "agm", icon: CalendarCheck },
  { key: "amendments", label: "amendments", icon: Scale },
  { key: "hotlines", label: "hotlines", icon: PhoneCall },
  { key: "badges", label: "badges", icon: Award },
  { key: "budget", label: "budget", icon: PieChart },
  { key: "audit", label: "audit", icon: FileSearch },
  { key: "bloodBank", label: "bloodBank", icon: Droplet },
  { key: "officers", label: "officers", icon: BadgeCheck },
  { key: "events", label: "events", icon: CalendarRange },
  { key: "constitution", label: "constitution", icon: BookOpen },
  { key: "r-tickets", label: "tickets", icon: LifeBuoy },
  { key: "r-profile", label: "profile", icon: User },
];

const ADMIN_NAV = [
  { key: "a-dashboard", label: "dashboard", icon: BarChart3 },
  { key: "a-members", label: "members", icon: Users },
  { key: "a-dues", label: "financials", icon: Wallet },
  { key: "chat", label: "chat", icon: MessageCircle },
  { key: "a-notices", label: "notices", icon: Bell },
  { key: "a-letters", label: "letters", icon: FileText },
  { key: "a-elections", label: "elections", icon: Vote },
  { key: "agm", label: "agm", icon: CalendarCheck },
  { key: "amendments", label: "amendments", icon: Scale },
  { key: "hotlines", label: "hotlines", icon: PhoneCall },
  { key: "badges", label: "badges", icon: Award },
  { key: "budget", label: "budget", icon: PieChart },
  { key: "audit", label: "audit", icon: FileSearch },
  { key: "bloodBank", label: "bloodBank", icon: Droplet },
  { key: "officers", label: "officers", icon: BadgeCheck },
  { key: "events", label: "events", icon: CalendarRange },
  { key: "constitution", label: "constitution", icon: BookOpen },
  { key: "a-handover", label: "handover", icon: ArrowLeftRight },
  { key: "a-tickets", label: "tickets", icon: LifeBuoy },
  { key: "a-activity", label: "activity", icon: ClipboardList },
  { key: "r-profile", label: "profile", icon: User },
];

const RESIDENT_BOTTOM_NAV = [
  { key: "r-home", label: "home", icon: Home },
  { key: "r-directory", label: "members", icon: Users },
  { key: "r-dues", label: "financials", icon: Wallet },
  { key: "chat", label: "chat", icon: MessageCircle },
  { key: "r-notices", label: "notices", icon: Bell },
];

const ADMIN_BOTTOM_NAV = [
  { key: "a-dashboard", label: "dashboard", icon: BarChart3 },
  { key: "a-members", label: "members", icon: Users },
  { key: "a-dues", label: "financials", icon: Wallet },
  { key: "chat", label: "chat", icon: MessageCircle },
  { key: "a-notices", label: "notices", icon: Bell },
];

export default function Shell({ session, view, setView, logout, lang, setLang, t, children, navOpen, setNavOpen }) {
  const isAdmin = session.role === "admin";
  const nav = isAdmin ? ADMIN_NAV : RESIDENT_NAV;
  const bottomNav = isAdmin ? ADMIN_BOTTOM_NAV : RESIDENT_BOTTOM_NAV;

  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-hidden" style={{ backgroundColor: C.surface }}>
      {/* Desktop sidebar = "Web Platform" */}
      <aside className="hidden lg:flex lg:w-64 flex-col shrink-0 border-r px-4 py-6" style={{ borderColor: C.outlineVariant, backgroundColor: C.surface }}>
        <div className="flex items-center gap-2 px-2 mb-8">
          <div style={{ backgroundColor: C.primary }} className="w-9 h-9 rounded-xl flex items-center justify-center p-1.5"><img src={LOGO_MARK} alt="Kunjachaya Club" className="w-full h-full object-contain" /></div>
          <div><p className="font-extrabold text-sm heading leading-none">Kunjachaya</p><p className="text-[10px] font-semibold tracking-wide" style={{ color: C.outline }}>{isAdmin ? "ADMIN PORTAL · WEB" : "RESIDENT · WEB"}</p></div>
        </div>
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto pr-1">
          {nav.map(item => {
            const Icon = item.icon; const active = view === item.key;
            const labelText = t[item.label] || (item.label === "letters" ? (lang === "bn" ? "অফিসিয়াল পত্র ও স্মারক" : "Official Letters") : item.label);
            return (
              <button key={item.key} onClick={() => setView(item.key)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left"
                style={active ? { backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer } : { color: C.onSurfaceVariant }}>
                <Icon size={17} strokeWidth={2.3} /> {labelText}
              </button>
            );
          })}
        </nav>
        <div className="border-t pt-4 mt-4" style={{ borderColor: C.outlineVariant }}>
          <div
            onClick={() => setView("r-profile")}
            className="flex items-center gap-2.5 px-2 py-2 mb-3 rounded-xl hover:bg-black/5 cursor-pointer transition-colors"
            title="Edit Profile"
          >
            <Avatar name={session.name} photoUrl={session.photoUrl} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate">{session.name}</p>
              <p className="text-[11px] truncate" style={{ color: C.outline }}>{session.post || session.memberClass}</p>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: C.primaryContainer, color: "#fff" }}>
              {lang === "bn" ? "প্রোফাইল" : "Edit"}
            </span>
          </div>
          <button onClick={() => setLang(l => l === "en" ? "bn" : "en")} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold mb-1" style={{ color: C.onSurfaceVariant }}><Globe size={14} /> {lang === "en" ? "বাংলা" : "English"}</button>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{ color: C.error }}><LogOut size={14} /> {t.logout}</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar = "Android App" feel */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b" style={{ backgroundColor: C.surface, borderColor: C.outlineVariant }}>
          <div className="flex items-center gap-2">
            <div style={{ backgroundColor: C.primary }} className="w-8 h-8 rounded-lg flex items-center justify-center p-1.5"><img src={LOGO_MARK} alt="Kunjachaya Club" className="w-full h-full object-contain" /></div>
            <span className="font-extrabold text-sm heading">{isAdmin ? "Admin · " : ""}Kunjachaya</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setLang(l => l === "en" ? "bn" : "en")} className="p-2 rounded-full" style={{ color: C.onSurfaceVariant }} title="Change Language"><Globe size={17} /></button>
            <button onClick={() => setNavOpen(true)} className="p-2 rounded-full" style={{ color: C.onSurfaceVariant }} title="Open Menu"><Menu size={20} /></button>
          </div>
        </header>

        {/* Mobile Side Drawer (3-Line Menu) with Full Web App Modules & Smooth Scrolling */}
        {navOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" style={{ backgroundColor: "rgba(20,25,15,0.55)", backdropFilter: "blur(2px)" }} onClick={() => setNavOpen(false)}>
            <div
              onClick={e => e.stopPropagation()}
              style={{ backgroundColor: C.surface, color: C.onSurface }}
              className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] p-4 sm:p-5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
            >
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b" style={{ borderColor: C.outlineVariant }}>
                <div className="flex items-center gap-2">
                  <div style={{ backgroundColor: C.primary }} className="w-8 h-8 rounded-lg flex items-center justify-center p-1.5">
                    <img src={LOGO_MARK} alt="Kunjachaya Club" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm heading block leading-none">Kunjachaya</span>
                    <span className="text-[10px] font-semibold tracking-wider opacity-60">
                      {isAdmin ? "EXECUTIVE ADMIN" : "RESIDENT PORTAL"}
                    </span>
                  </div>
                </div>
                <button onClick={() => setNavOpen(false)} className="p-1.5 rounded-full hover:bg-black/5" style={{ color: C.onSurfaceVariant }}>
                  <X size={20} />
                </button>
              </div>

              {/* User Profile Card */}
              <div
                onClick={() => { setView("r-profile"); setNavOpen(false); }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl mb-3 border cursor-pointer hover:bg-black/5 transition-colors"
                style={{ backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }}
              >
                <Avatar name={session.name} photoUrl={session.photoUrl} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate">{session.name}</p>
                  <p className="text-[11px] truncate" style={{ color: C.outline }}>{session.post || session.memberClass}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ backgroundColor: C.primary, color: "#fff" }}>
                  {lang === "bn" ? "প্রোফাইল" : "Profile"}
                </span>
              </div>

              {/* Scrollable Navigation List with All Web App Modules */}
              <div className="text-[11px] font-bold px-2 py-1 uppercase tracking-wider opacity-50">
                {lang === "bn" ? "সকল মেনু ও সেবা" : "All Modules & Services"}
              </div>
              <nav className="flex flex-col gap-1 flex-1 overflow-y-auto pr-1 my-1">
                {nav.map(item => {
                  const Icon = item.icon;
                  const active = view === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => { setView(item.key); setNavOpen(false); }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors"
                      style={active ? { backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer } : { color: C.onSurfaceVariant }}
                    >
                      <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                      <span className="truncate">{t[item.label] || (item.label === "letters" ? (lang === "bn" ? "অফিসিয়াল পত্র ও স্মারক" : "Official Letters") : item.label)}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Drawer Footer Actions */}
              <div className="pt-3 mt-1 border-t flex flex-col gap-1" style={{ borderColor: C.outlineVariant }}>
                <button
                  onClick={() => setLang(l => l === "en" ? "bn" : "en")}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ color: C.onSurfaceVariant, backgroundColor: C.surfaceContainerLow }}
                >
                  <span className="flex items-center gap-2"><Globe size={14} /> {lang === "en" ? "ভাষা পরিবর্তন" : "Switch Language"}</span>
                  <span className="font-bold text-[11px] px-1.5 py-0.5 rounded bg-black/5">{lang === "en" ? "বাংলা" : "English"}</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                  style={{ color: C.error }}
                >
                  <LogOut size={15} /> {t.logout}
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 pb-24 lg:pb-10 max-w-6xl w-full mx-auto">{children}</main>

        {/* Bottom Nav = Clean, responsive mobile bar with 5 primary destinations */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t px-1 py-1.5 shadow-lg"
          style={{ backgroundColor: C.surface, borderColor: C.outlineVariant }}
        >
          {bottomNav.map(item => {
            const Icon = item.icon;
            const active = view === item.key;
            const labelText = t[item.label] || item.label;
            return (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className="flex flex-col items-center gap-0.5 px-1 py-1 rounded-xl min-w-[56px] transition-transform active:scale-95"
                style={{ color: active ? C.primary : C.outline }}
              >
                <div
                  className="p-1 rounded-full flex items-center justify-center transition-colors"
                  style={active ? { backgroundColor: C.secondaryContainer } : {}}
                >
                  <Icon size={19} strokeWidth={active ? 2.6 : 1.8} style={{ color: active ? C.primary : "currentColor" }} />
                </div>
                <span className="text-[10px] font-bold truncate max-w-[62px]">
                  {labelText}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
