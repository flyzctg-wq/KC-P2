import React from "react";
import { Home, Users, Bell, Wallet, Vote, LifeBuoy, User, LogOut, Menu, X, BarChart3, Award, ClipboardList, Globe, PhoneCall, Scale, ArrowLeftRight, CalendarCheck, MessageCircle, PieChart, FileSearch, Droplet, BadgeCheck, BookOpen, CalendarRange } from "lucide-react";
import { Avatar } from "../components/primitives";
import { C, LOGO_MARK } from "../theme";

/* ============================== SHELL / NAV ============================== */
const RESIDENT_NAV = [
  { key: "r-home", label: "home", icon: Home },
  { key: "r-directory", label: "directory", icon: Users },
  { key: "r-notices", label: "notices", icon: Bell },
  { key: "r-dues", label: "dues", icon: Wallet },
  { key: "r-elections", label: "elections", icon: Vote },
  { key: "agm", label: "agm", icon: CalendarCheck },
  { key: "amendments", label: "amendments", icon: Scale },
  { key: "hotlines", label: "hotlines", icon: PhoneCall },
  { key: "badges", label: "badges", icon: Award },
  { key: "chat", label: "chat", icon: MessageCircle },
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
  { key: "a-notices", label: "notices", icon: Bell },
  { key: "a-dues", label: "dues", icon: Wallet },
  { key: "a-elections", label: "elections", icon: Vote },
  { key: "agm", label: "agm", icon: CalendarCheck },
  { key: "amendments", label: "amendments", icon: Scale },
  { key: "hotlines", label: "hotlines", icon: PhoneCall },
  { key: "badges", label: "badges", icon: Award },
  { key: "chat", label: "chat", icon: MessageCircle },
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
const MOBILE_LIMIT = 5;

export default function Shell({ session, view, setView, logout, lang, setLang, t, children, navOpen, setNavOpen }) {
  const isAdmin = session.role === "admin";
  const nav = isAdmin ? ADMIN_NAV : RESIDENT_NAV;
  const mobileNav = nav.slice(0, MOBILE_LIMIT);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar = "Web Platform" */}
      <aside className="hidden lg:flex lg:w-64 flex-col shrink-0 border-r px-4 py-6" style={{ borderColor: C.outlineVariant, backgroundColor: C.surface }}>
        <div className="flex items-center gap-2 px-2 mb-8">
          <div style={{ backgroundColor: C.primary }} className="w-9 h-9 rounded-xl flex items-center justify-center p-1.5"><img src={LOGO_MARK} alt="Kunjachaya Club" className="w-full h-full object-contain" /></div>
          <div><p className="font-extrabold text-sm heading leading-none">Kunjachaya</p><p className="text-[10px] font-semibold tracking-wide" style={{ color: C.outline }}>{isAdmin ? "ADMIN PORTAL · WEB" : "RESIDENT · WEB"}</p></div>
        </div>
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto pr-1">
          {nav.map(item => {
            const Icon = item.icon; const active = view === item.key;
            return (
              <button key={item.key} onClick={() => setView(item.key)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left"
                style={active ? { backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer } : { color: C.onSurfaceVariant }}>
                <Icon size={17} strokeWidth={2.3} /> {t[item.label] || item.label}
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
            <button onClick={() => setLang(l => l === "en" ? "bn" : "en")} className="p-2 rounded-full" style={{ color: C.onSurfaceVariant }}><Globe size={17} /></button>
            <button onClick={() => setNavOpen(true)} className="p-2 rounded-full" style={{ color: C.onSurfaceVariant }}><Menu size={18} /></button>
          </div>
        </header>

        {navOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" style={{ backgroundColor: "rgba(20,25,15,0.45)" }} onClick={() => setNavOpen(false)}>
            <div onClick={e => e.stopPropagation()} style={{ backgroundColor: C.surface }} className="absolute right-0 top-0 bottom-0 w-72 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2"><div style={{ backgroundColor: C.primary }} className="w-8 h-8 rounded-lg flex items-center justify-center p-1.5"><img src={LOGO_MARK} alt="Kunjachaya Club" className="w-full h-full object-contain" /></div><span className="font-extrabold text-sm heading">Kunjachaya</span></div>
                <button onClick={() => setNavOpen(false)}><X size={18} /></button>
              </div>
              <div
                onClick={() => { setView("r-profile"); setNavOpen(false); }}
                className="flex items-center gap-2.5 p-2 rounded-xl mb-4 bg-black/5 cursor-pointer"
              >
                <Avatar name={session.name} photoUrl={session.photoUrl} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate">{session.name}</p>
                  <p className="text-[11px] truncate" style={{ color: C.outline }}>{session.post || session.memberClass}</p>
                </div>
              </div>
              <nav className="flex flex-col gap-1 flex-1">
                {nav.map(item => { const Icon = item.icon; return (
                  <button key={item.key} onClick={() => { setView(item.key); setNavOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-left"
                    style={view === item.key ? { backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer } : { color: C.onSurfaceVariant }}>
                    <Icon size={17} /> {t[item.label] || item.label}
                  </button>);
                })}
              </nav>
              <button onClick={logout} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold" style={{ color: C.error }}><LogOut size={15} /> {t.logout}</button>
            </div>
          </div>
        )}

        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 pb-24 lg:pb-10 max-w-6xl w-full mx-auto">{children}</main>

        {/* Bottom nav = Android app style */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t px-1 py-2" style={{ backgroundColor: C.surface, borderColor: C.outlineVariant }}>
          {mobileNav.map(item => { const Icon = item.icon; const active = view === item.key; return (
            <button key={item.key} onClick={() => setView(item.key)} className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl min-w-[56px]" style={{ color: active ? C.primary : C.outline }}>
              <Icon size={20} strokeWidth={active ? 2.6 : 2} />
              <span className="text-[10px] font-bold">{(t[item.label] || item.label).slice(0, 8)}</span>
            </button>);
          })}
        </nav>
      </div>
    </div>
  );
}
