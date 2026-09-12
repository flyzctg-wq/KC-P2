import React from "react";
import {
  Home, Users, Bell, Wallet, Vote, LifeBuoy, User, LogOut, Menu, X, BarChart3,
  Award, ClipboardList, Globe, PhoneCall, Scale, ArrowLeftRight, CalendarCheck,
  MessageCircle, PieChart, FileSearch, Droplet, BadgeCheck, BookOpen, CalendarRange,
  FileText, Sun, Moon, Laptop, Receipt, Settings, ChevronDown
} from "lucide-react";
import { Avatar } from "../components/primitives";
import { C, LOGO_MARK } from "../theme";
import TvBulletin from "./TvBulletin";

/* ============================== SHELL / NAV ============================== */
/* ---- Grouped nav: each group has a heading label + items array ---- */
const RESIDENT_NAV_GROUPS = [
  {
    groupLabel: { en: "Main", bn: "মূল" },
    items: [
      { key: "r-home", label: "home", icon: Home },
      { key: "r-directory", label: "directory", icon: Users },
      { key: "r-dues", label: "financials", icon: Wallet },
      { key: "chat", label: "chat", icon: MessageCircle },
      { key: "r-notices", label: "notices", icon: Bell },
    ],
  },
  {
    groupLabel: { en: "Governance", bn: "পরিচালনা" },
    items: [
      { key: "r-elections", label: "elections", icon: Vote },
      { key: "agm", label: "agm", icon: CalendarCheck },
      { key: "amendments", label: "amendments", icon: Scale },
      { key: "officers", label: "officers", icon: BadgeCheck },
      { key: "constitution", label: "constitution", icon: BookOpen },
    ],
  },
  {
    groupLabel: { en: "Community", bn: "সম্প্রদায়" },
    items: [
      { key: "hotlines", label: "hotlines", icon: PhoneCall },
      { key: "bloodBank", label: "bloodBank", icon: Droplet },
      { key: "events", label: "events", icon: CalendarRange },
      { key: "badges", label: "badges", icon: Award },
      { key: "budget", label: "budget", icon: PieChart },
      { key: "audit", label: "audit", icon: FileSearch },
    ],
  },
  {
    groupLabel: { en: "Account", bn: "অ্যাকাউন্ট" },
    items: [
      { key: "r-tickets", label: "tickets", icon: LifeBuoy },
      { key: "settings", label: "settings", icon: Settings },
      { key: "r-profile", label: "profile", icon: User },
    ],
  },
];
// Flat list derived from groups (used for active-state lookup)
const RESIDENT_NAV = RESIDENT_NAV_GROUPS.flatMap(g => g.items);

const ADMIN_NAV_GROUPS = [
  {
    groupLabel: { en: "Management", bn: "ব্যবস্থাপনা" },
    items: [
      { key: "a-dashboard", label: "dashboard", icon: BarChart3 },
      { key: "a-members", label: "members", icon: Users },
      { key: "a-dues", label: "financials", icon: Wallet },
      { key: "a-payment-history", label: "paymentHistory", icon: Receipt },
    ],
  },
  {
    groupLabel: { en: "Communication", bn: "যোগাযোগ" },
    items: [
      { key: "chat", label: "chat", icon: MessageCircle },
      { key: "a-notices", label: "notices", icon: Bell },
      { key: "a-letters", label: "letters", icon: FileText },
      { key: "hotlines", label: "hotlines", icon: PhoneCall },
    ],
  },
  {
    groupLabel: { en: "Governance", bn: "পরিচালনা" },
    items: [
      { key: "a-elections", label: "elections", icon: Vote },
      { key: "agm", label: "agm", icon: CalendarCheck },
      { key: "amendments", label: "amendments", icon: Scale },
      { key: "officers", label: "officers", icon: BadgeCheck },
      { key: "constitution", label: "constitution", icon: BookOpen },
      { key: "a-handover", label: "handover", icon: ArrowLeftRight },
    ],
  },
  {
    groupLabel: { en: "Community", bn: "সম্প্রদায়" },
    items: [
      { key: "bloodBank", label: "bloodBank", icon: Droplet },
      { key: "events", label: "events", icon: CalendarRange },
      { key: "badges", label: "badges", icon: Award },
      { key: "budget", label: "budget", icon: PieChart },
      { key: "audit", label: "log", icon: FileSearch },
    ],
  },
  {
    groupLabel: { en: "Account", bn: "অ্যাকাউন্ট" },
    items: [
      { key: "a-tickets", label: "tickets", icon: LifeBuoy },
      { key: "settings", label: "settings", icon: Settings },
      { key: "r-profile", label: "profile", icon: User },
    ],
  },
];
const ADMIN_NAV = ADMIN_NAV_GROUPS.flatMap(g => g.items);

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

export default function Shell({
  session, db, persist, view, setView, logout, lang, setLang, t, children,
  navOpen, setNavOpen, theme = "system", setTheme = () => {}
}) {
  const isAdmin = session.role === "admin";
  const nav = isAdmin ? ADMIN_NAV : RESIDENT_NAV;
  const bottomNav = isAdmin ? ADMIN_BOTTOM_NAV : RESIDENT_BOTTOM_NAV;

  const isDarkMode = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const navGroups = isAdmin ? ADMIN_NAV_GROUPS : RESIDENT_NAV_GROUPS;
  const [openGroups, setOpenGroups] = React.useState(() => {
    const initial = {};
    navGroups.forEach((group, idx) => {
      const containsActive = group.items.some(item => item.key === view);
      initial[idx] = containsActive || idx === 0;
    });
    return initial;
  });

  React.useEffect(() => {
    navGroups.forEach((group, idx) => {
      if (group.items.some(item => item.key === view)) {
        setOpenGroups(prev => ({ ...prev, [idx]: true }));
      }
    });
  }, [view, navGroups]);

  const toggleGroup = (idx) => {
    setOpenGroups(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleThemeNext = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-hidden" style={{ backgroundColor: C.surface }}>
      {/* Desktop sidebar = "Web Platform" with pinned footer (Issue #10) */}
      <aside className="hidden lg:flex lg:w-64 flex-col shrink-0 h-screen sticky top-0 border-r px-3.5 py-4 overflow-hidden" style={{ borderColor: C.outlineVariant, backgroundColor: C.surface }}>
        <div className="flex items-center gap-2 px-2 mb-4 shrink-0">
          <div style={{ backgroundColor: C.primary }} className="w-8 h-8 rounded-xl flex items-center justify-center p-1.5 shadow-sm">
            <img src={LOGO_MARK} alt="Kunjachaya Club" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="font-extrabold text-sm heading leading-none">Kunjachaya</p>
            <p className="text-[10px] font-semibold tracking-[0.04em] capitalize" style={{ color: C.outline, fontVariantCaps: "small-caps" }}>
              {isAdmin ? "Admin Portal · Web" : "Resident · Web"}
            </p>
          </div>
        </div>

        {/* Issue #5: Collapsible Categorized Navigation to avoid wall-of-choices */}
        <nav className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-1" aria-label="Main navigation">
          {navGroups.map((group, gi) => {
            const isOpen = !!openGroups[gi];
            const groupName = lang === "bn" ? group.groupLabel.bn : group.groupLabel.en;
            const hasActiveItem = group.items.some(item => item.key === view);

            return (
              <div key={gi} className="rounded-xl overflow-hidden mb-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(gi)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-left transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ color: hasActiveItem ? C.primary : C.outline }}
                >
                  <span>{groupName}</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`}
                  />
                </button>

                {isOpen && (
                  <div className="flex flex-col gap-0.5 mt-0.5 pl-1">
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const active = view === item.key;
                      const labelText = t[item.label] || (item.label === "letters" ? (lang === "bn" ? "অফিসিয়াল পত্র ও স্মারক" : "Official Letters") : item.label);
                      return (
                        <button
                          key={item.key}
                          onClick={() => setView(item.key)}
                          aria-current={active ? "page" : undefined}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors text-left w-full"
                          style={active ? { backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer } : { color: C.onSurfaceVariant }}
                        >
                          <Icon size={16} strokeWidth={active ? 2.4 : 2} />
                          <span className="truncate">{labelText}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Issue #10: Pinned Desktop Footer (Settings & Logout always above the fold) */}
        <footer className="shrink-0 pt-3 mt-auto border-t space-y-1" style={{ borderColor: C.outlineVariant }}>
          <button
            type="button"
            onClick={() => setView("r-profile")}
            aria-label={lang === "bn" ? "প্রোফাইল দেখুন ও সম্পাদনা করুন" : "View and edit profile"}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none transition-colors text-left"
            title="Edit Profile"
          >
            <Avatar name={session.name} photoUrl={session.photoUrl} size={32} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate">{session.name}</p>
              <p className="text-[10px] truncate" style={{ color: C.outline }}>{session.post || session.memberClass}</p>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: C.primaryContainer, color: "#fff" }}>
              {lang === "bn" ? "প্রোফাইল" : "Edit"}
            </span>
          </button>

          {/* Desktop Theme Switcher */}
          <button
            type="button"
            onClick={toggleThemeNext}
            aria-label={lang === "bn" ? `থিম পরিবর্তন করুন (বর্তমান: ${theme})` : `Toggle theme (Current: ${theme})`}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none transition-colors"
            style={{ color: C.onSurfaceVariant }}
            title="Toggle Theme"
          >
            <span className="flex items-center gap-2">
              {theme === "dark" ? <Moon size={14} className="text-amber-400" /> : theme === "light" ? <Sun size={14} className="text-amber-500" /> : <Laptop size={14} />}
              {lang === "bn" ? "থিম মোড" : "Theme"}
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: C.surfaceContainer, color: C.onSurface }}>
              {theme === "dark" ? (lang === "bn" ? "ডার্ক" : "Dark") : theme === "light" ? (lang === "bn" ? "লাইট" : "Light") : (lang === "bn" ? "অটো" : "Auto")}
            </span>
          </button>

          {/* Desktop Settings Shortcut */}
          <button
            type="button"
            onClick={() => setView("settings")}
            aria-label={lang === "bn" ? "অ্যাপ সেটিংস" : "App Settings"}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none transition-colors"
            style={view === "settings" ? { backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer } : { color: C.onSurfaceVariant }}
            title="App Settings"
          >
            <span className="flex items-center gap-2">
              <Settings size={14} />
              {lang === "bn" ? "অ্যাপ সেটিংস" : "App Settings"}
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: C.surfaceContainer, color: C.onSurface }}>
              v1.8
            </span>
          </button>

          <button
            type="button"
            onClick={() => setLang(l => l === "en" ? "bn" : "en")}
            aria-label={lang === "en" ? "Switch language to Bangla" : "Switch language to English"}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
            style={{ color: C.onSurfaceVariant }}
          >
            <Globe size={14} /> {lang === "en" ? "বাংলা" : "English"}
          </button>

          <button
            type="button"
            onClick={logout}
            aria-label={t.logout}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 focus-visible:ring-2 focus-visible:ring-red-500 outline-none transition-colors"
            style={{ color: C.error }}
          >
            <LogOut size={14} /> {t.logout}
          </button>
        </footer>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar = "Android App" feel */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b backdrop-blur-md" style={{ backgroundColor: C.surface, borderColor: C.outlineVariant }}>
          <div className="flex items-center gap-2">
            <div style={{ backgroundColor: C.primary }} className="w-8 h-8 rounded-lg flex items-center justify-center p-1.5 shadow-sm">
              <img src={LOGO_MARK} alt="Kunjachaya Club" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-sm heading">{isAdmin ? "Admin · " : ""}Kunjachaya</span>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Mobile Fast Theme Toggle Button */}
            <button
              onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
              aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              style={{ color: C.onSurfaceVariant }}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
            </button>

            {/* Mobile Settings Direct Button */}
            <button
              onClick={() => setView("settings")}
              aria-label="Settings"
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              style={{ color: view === "settings" ? C.primary : C.onSurfaceVariant }}
              title="Settings"
            >
              <Settings size={17} />
            </button>

            {/* Language Selector */}
            <button
              onClick={() => setLang(l => l === "en" ? "bn" : "en")}
              aria-label={lang === "en" ? "Switch language to Bengali" : "Switch language to English"}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: C.onSurfaceVariant }}
              title="Change Language"
            >
              <Globe size={17} />
            </button>

            {/* Drawer Menu Button */}
            <button
              onClick={() => setNavOpen(true)}
              aria-label="Open navigation menu"
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: C.onSurfaceVariant }}
              title="Open Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* Mobile Side Drawer (3-Line Menu) */}
        {navOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setNavOpen(false)}>
            <div
              onClick={e => e.stopPropagation()}
              style={{ backgroundColor: C.surface, color: C.onSurface }}
              className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] p-4 sm:p-5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
            >
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b" style={{ borderColor: C.outlineVariant }}>
                <div className="flex items-center gap-2">
                  <div style={{ backgroundColor: C.primary }} className="w-8 h-8 rounded-lg flex items-center justify-center p-1.5 shadow-sm">
                    <img src={LOGO_MARK} alt="Kunjachaya Club" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm heading block leading-none">Kunjachaya</span>
                    <span className="text-[10px] font-semibold tracking-[0.04em] opacity-60">
                      {isAdmin ? "Executive Admin" : "Resident Portal"}
                    </span>
                  </div>
                </div>
                <button onClick={() => setNavOpen(false)} aria-label="Close navigation menu" className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5" style={{ color: C.onSurfaceVariant }}>
                  <X size={20} />
                </button>
              </div>

              {/* User Profile Card */}
              <button
                type="button"
                onClick={() => { setView("r-profile"); setNavOpen(false); }}
                aria-label={lang === "bn" ? "প্রোফাইল দেখুন ও সম্পাদনা করুন" : "View and edit profile"}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl mb-3 border hover:bg-black/5 dark:hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none transition-colors text-left"
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
              </button>

              {/* Scrollable Navigation List (Collapsible) */}
              <nav className="flex flex-col flex-1 overflow-y-auto pr-1 my-1 space-y-1" aria-label="Main navigation">
                {navGroups.map((group, gi) => {
                  const isOpen = !!openGroups[gi];
                  const groupName = lang === "bn" ? group.groupLabel.bn : group.groupLabel.en;
                  const hasActiveItem = group.items.some(item => item.key === view);

                  return (
                    <div key={gi} className="rounded-xl overflow-hidden mb-1">
                      <button
                        type="button"
                        onClick={() => toggleGroup(gi)}
                        aria-expanded={isOpen}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-left transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                        style={{ color: hasActiveItem ? C.primary : C.outline }}
                      >
                        <span>{groupName}</span>
                        <ChevronDown
                          size={13}
                          className={`transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`}
                        />
                      </button>

                      {isOpen && (
                        <div className="flex flex-col gap-0.5 mt-0.5 pl-1">
                          {group.items.map(item => {
                            const Icon = item.icon;
                            const active = view === item.key;
                            return (
                              <button
                                key={item.key}
                                onClick={() => { setView(item.key); setNavOpen(false); }}
                                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-left transition-colors w-full"
                                style={active ? { backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer } : { color: C.onSurfaceVariant }}
                              >
                                <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                                <span className="truncate">{t[item.label] || (item.label === "letters" ? (lang === "bn" ? "অফিসিয়াল পত্র ও স্মারক" : "Official Letters") : item.label)}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Drawer Footer Theme and Language Controls */}
              <div className="pt-3 mt-1 border-t space-y-2" style={{ borderColor: C.outlineVariant }}>
                {/* 3-Option Theme Segmented Bar */}
                <div className="p-1 rounded-xl flex items-center gap-1 border" style={{ backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }}>
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${theme === "light" ? "bg-white dark:bg-slate-800 text-amber-600 shadow-sm" : "opacity-60"}`}
                  >
                    <Sun size={13} /> {lang === "bn" ? "লাইট" : "Light"}
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${theme === "dark" ? "bg-emerald-700 text-white shadow-sm" : "opacity-60"}`}
                  >
                    <Moon size={13} /> {lang === "bn" ? "ডার্ক" : "Dark"}
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${theme === "system" ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm" : "opacity-60"}`}
                  >
                    <Laptop size={13} /> {lang === "bn" ? "অটো" : "Auto"}
                  </button>
                </div>

                <button
                  onClick={() => setLang(l => l === "en" ? "bn" : "en")}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ color: C.onSurfaceVariant, backgroundColor: C.surfaceContainerLow }}
                >
                  <span className="flex items-center gap-2"><Globe size={14} /> {lang === "en" ? "ভাষা পরিবর্তন" : "Switch Language"}</span>
                  <span className="font-bold text-[11px] px-1.5 py-0.5 rounded" style={{ backgroundColor: C.surfaceContainer, color: C.onSurface }}>{lang === "en" ? "বাংলা" : "English"}</span>
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

        {/* TV Bulletin / News Ticker Bar (Mobile & Web) */}
        <TvBulletin notices={db?.notices || []} lang={lang} setView={setView} session={session} />

        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 pb-24 lg:pb-10 max-w-6xl w-full mx-auto">
          {/* #6: Every page must have an H1 for accessibility & SEO. Visually hidden but present in the DOM. */}
          <h1 className="sr-only">Kunjachaya Club — {isAdmin ? "Admin Portal" : "Resident Portal"}</h1>
          {children}
        </main>

        {/* Bottom Nav = Clean, responsive mobile bar with 5 primary destinations */}
        <nav
          aria-label="Bottom primary navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t px-1 py-1.5 shadow-lg backdrop-blur-md"
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
                aria-label={labelText}
                aria-current={active ? "page" : undefined}
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
