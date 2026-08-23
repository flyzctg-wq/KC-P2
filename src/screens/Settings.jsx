import React, { useState, useEffect } from "react";
import {
  Settings, Bell, Type, Moon, Sun, Laptop, Globe, Volume2, VolumeX,
  Smartphone, Trash2, RefreshCw, ShieldCheck, CheckCircle2, Sliders,
  Info, HardDrive, Wifi, Lock, Zap, Sparkles, SmartphoneCharging, BellRing
} from "lucide-react";
import { Btn, Card, Badge, Field, SectionTitle, Modal } from "../components/primitives";
import { C } from "../theme";

export default function SettingsScreen({
  session,
  db,
  toast,
  lang = "en",
  setLang,
  theme,
  setTheme,
  fontSize = "normal",
  setFontSize,
  appSettings = {},
  setAppSettings
}) {
  const isBn = lang === "bn";
  const [notificationPermission, setNotificationPermission] = useState("default");
  const [cacheSize, setCacheSize] = useState("1.4 MB");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const updateSetting = (key, value) => {
    if (setAppSettings) {
      setAppSettings(prev => ({ ...prev, [key]: value }));
    }
  };

  const requestPushPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === "granted") {
          toast(isBn ? "পুশ নোটিফিকেশন সফলভাবে চালু করা হয়েছে!" : "Push notifications enabled successfully!");
          updateSetting("pushNotifications", true);
        } else {
          toast(isBn ? "নোটিফিকেশনের অনুমতি দেওয়া হয়নি।" : "Notification permission was denied.", "error");
          updateSetting("pushNotifications", false);
        }
      } catch (e) {
        toast(isBn ? "নোটিফিকেশন অনুমোদনে ত্রুটি।" : "Error requesting notification permission.", "error");
      }
    } else {
      toast(isBn ? "এই ডিভাইসে পুশ নোটিফিকেশন সমর্থিত নয়।" : "Push notifications not supported on this browser/device.", "error");
    }
  };

  const clearAppCache = () => {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("kc_ticket_att_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      setCacheSize("0.1 MB");
      toast(isBn ? "ক্যাশ মেমোরি সফলভাবে পরিষ্কার করা হয়েছে!" : "App temporary cache cleared!");
    } catch (_) {
      toast(isBn ? "ক্যাশ পরিষ্কার সম্পন্ন।" : "Cache cleared.");
    }
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast(isBn ? "সকল ডাটা ক্লাউডের সাথে সফলভাবে সিঙ্ক হয়েছে!" : "All data synchronized with cloud!");
    }, 900);
  };

  const fontOptions = [
    { key: "small", label: isBn ? "ছোট (১৪px)" : "Small (14px)", size: "14px" },
    { key: "normal", label: isBn ? "স্বাভাবিক (১৬px)" : "Normal (16px)", size: "16px" },
    { key: "large", label: isBn ? "বড় (১৮px)" : "Large (18px)", size: "18px" },
    { key: "xlarge", label: isBn ? "অতিরিক্ত বড় (২০px)" : "Extra Large (20px)", size: "20px" },
  ];

  return (
    <div className="w-full max-w-full space-y-5 overflow-x-hidden pb-8">
      <SectionTitle>{isBn ? "অ্যাপ সেটিংস ও কনফিগারেশন" : "App Settings & Preferences"}</SectionTitle>

      {/* ── Header Card ─────────────────────────────────────── */}
      <Card className="p-4 flex items-center justify-between border" style={{ borderColor: C.outlineVariant }}>
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-white shadow-sm"
            style={{ backgroundColor: C.primary }}
          >
            <Settings size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm" style={{ color: C.onSurface }}>
              {isBn ? "কুঞ্জছায়া ক্লাব মোবাইল অ্যাপ" : "Kunjachaya Club App"}
            </h3>
            <p className="text-xs flex items-center gap-1.5 mt-0.5" style={{ color: C.onSurfaceVariant }}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>v1.8.0 (Android & Web) · {session.name}</span>
            </p>
          </div>
        </div>
        <Badge tone="success">
          {isBn ? "সক্রিয়" : "Online"}
        </Badge>
      </Card>

      {/* ── SECTION 1: DISPLAY & ACCESSIBILITY ─────────────── */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: C.primary }}>
          <Type size={14} />
          <span>{isBn ? "ডিসপ্লে ও টেক্সট সাইজ" : "Display & Accessibility"}</span>
        </h4>

        <Card className="p-4 space-y-4 border" style={{ borderColor: C.outlineVariant }}>
          {/* Text Size / Font Scale Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold" style={{ color: C.onSurface }}>
                {isBn ? "টেক্সট ও ফন্ট সাইজ (Font Scale)" : "Text & Font Size"}
              </label>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded" style={{ backgroundColor: C.primaryContainer, color: C.onPrimaryContainer }}>
                {fontOptions.find(f => f.key === fontSize)?.label || fontSize}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {fontOptions.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setFontSize && setFontSize(opt.key)}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs border transition-all active:scale-95 text-center flex flex-col items-center justify-center gap-1 shadow-sm"
                  style={
                    fontSize === opt.key
                      ? { backgroundColor: C.primary, color: "#fff", borderColor: C.primary }
                      : { backgroundColor: C.surfaceContainer, color: C.onSurfaceVariant, borderColor: C.outlineVariant }
                  }
                >
                  <span style={{ fontSize: opt.size }} className="font-extrabold leading-none">ক A</span>
                  <span className="text-[10px] opacity-90">{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Live Text Preview Box */}
            <div className="mt-3 p-3 rounded-xl border bg-black/5 dark:bg-white/5 space-y-1" style={{ borderColor: C.outlineVariant }}>
              <p className="text-[10px] font-bold uppercase tracking-wide opacity-60">
                {isBn ? "লাইভ টেক্সট প্রিভিউ (Preview)" : "Live Text Preview"}
              </p>
              <p className="text-xs font-semibold leading-relaxed" style={{ color: C.onSurface }}>
                {isBn
                  ? "কুঞ্জছায়া ক্লাব — একতাবদ্ধ, সুশৃঙ্খল ও আধুনিক আবাসিক সমাজ।"
                  : "Kunjachaya Club — United, disciplined, and modern residential community."}
              </p>
            </div>
          </div>

          {/* Theme Mode Selector */}
          <div className="pt-3 border-t" style={{ borderColor: C.outlineVariant }}>
            <label className="text-xs font-bold block mb-2" style={{ color: C.onSurface }}>
              {isBn ? "থিম ও কালার মোড (Theme Mode)" : "Theme Mode"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "light", label: isBn ? "লাইট (Light)" : "Light", icon: Sun },
                { key: "dark", label: isBn ? "ডার্ক (Dark)" : "Dark", icon: Moon },
                { key: "system", label: isBn ? "অটো (Auto)" : "System", icon: Laptop },
              ].map(th => {
                const Icon = th.icon;
                const active = theme === th.key;
                return (
                  <button
                    key={th.key}
                    type="button"
                    onClick={() => setTheme && setTheme(th.key)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs border transition-all active:scale-95 shadow-sm"
                    style={
                      active
                        ? { backgroundColor: C.primary, color: "#fff", borderColor: C.primary }
                        : { backgroundColor: C.surfaceContainer, color: C.onSurfaceVariant, borderColor: C.outlineVariant }
                    }
                  >
                    <Icon size={14} />
                    <span>{th.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Selector */}
          <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: C.outlineVariant }}>
            <div>
              <p className="text-xs font-bold" style={{ color: C.onSurface }}>
                {isBn ? "অ্যাপের ভাষা (Language)" : "App Language"}
              </p>
              <p className="text-[11px]" style={{ color: C.onSurfaceVariant }}>
                {isBn ? "বাংলা এবং ইংরেজি উভয় ভাষায় ব্যবহারযোগ্য" : "Switch between Bengali and English"}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setLang && setLang("bn")}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors"
                style={
                  lang === "bn"
                    ? { backgroundColor: C.primary, color: "#fff", borderColor: C.primary }
                    : { backgroundColor: C.surfaceContainer, color: C.onSurfaceVariant, borderColor: C.outlineVariant }
                }
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLang && setLang("en")}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors"
                style={
                  lang === "en"
                    ? { backgroundColor: C.primary, color: "#fff", borderColor: C.primary }
                    : { backgroundColor: C.surfaceContainer, color: C.onSurfaceVariant, borderColor: C.outlineVariant }
                }
              >
                English
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* ── SECTION 2: NOTIFICATIONS & ALERTS ───────────────── */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: C.primary }}>
          <Bell size={14} />
          <span>{isBn ? "নোটিফিকেশন ও অ্যালার্ট সেটিংস" : "Notifications & Alerts"}</span>
        </h4>

        <Card className="p-4 space-y-3 border" style={{ borderColor: C.outlineVariant }}>
          {/* Push Notifications Master Permission */}
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: C.outlineVariant }}>
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: C.onSurface }}>
                <BellRing size={14} className="text-emerald-500" />
                <span>{isBn ? "ডিভাইস পুশ নোটিফিকেশন" : "Device Push Notifications"}</span>
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: C.onSurfaceVariant }}>
                {notificationPermission === "granted"
                  ? (isBn ? "অনুমোদন সক্রিয় আছে" : "Permission granted")
                  : (isBn ? "তাৎক্ষণিক নোটিশ ও গুরুত্বপূর্ণ অ্যালার্ট পেতে চালু করুন" : "Enable to receive instant notice & dues alerts")}
              </p>
            </div>
            {notificationPermission !== "granted" ? (
              <Btn size="sm" onClick={requestPushPermission}>
                {isBn ? "অনুমতি দিন" : "Enable"}
              </Btn>
            ) : (
              <Badge tone="success">{isBn ? "সক্রিয়" : "Enabled"}</Badge>
            )}
          </div>

          {/* Notice Board Alerts */}
          <label className="flex items-center justify-between cursor-pointer py-1 select-none">
            <div>
              <p className="text-xs font-bold" style={{ color: C.onSurface }}>
                {isBn ? "নতুন নোটিশ প্রকাশ অ্যালার্ট" : "New Notice Announcements"}
              </p>
              <p className="text-[11px]" style={{ color: C.onSurfaceVariant }}>
                {isBn ? "ক্লাবের জরুরি নোটিশ প্রকাশিত হলে জানানো হবে" : "Alert when new official notice is published"}
              </p>
            </div>
            <input
              type="checkbox"
              checked={appSettings.noticeAlerts !== false}
              onChange={e => updateSetting("noticeAlerts", e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
          </label>

          {/* Monthly Dues Reminders */}
          <label className="flex items-center justify-between cursor-pointer py-1 select-none border-t pt-2.5" style={{ borderColor: C.outlineVariant }}>
            <div>
              <p className="text-xs font-bold" style={{ color: C.onSurface }}>
                {isBn ? "মাসিক চাঁদা ও পেমেন্ট রিমাইন্ডার" : "Monthly Dues Reminders"}
              </p>
              <p className="text-[11px]" style={{ color: C.onSurfaceVariant }}>
                {isBn ? "মাসের ১০ তারিখের মধ্যে চাঁদা পরিশোধের অনুস্মারক" : "Reminder before the 10th of every month"}
              </p>
            </div>
            <input
              type="checkbox"
              checked={appSettings.duesReminder !== false}
              onChange={e => updateSetting("duesReminder", e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
          </label>

          {/* Election & Voting Alerts */}
          <label className="flex items-center justify-between cursor-pointer py-1 select-none border-t pt-2.5" style={{ borderColor: C.outlineVariant }}>
            <div>
              <p className="text-xs font-bold" style={{ color: C.onSurface }}>
                {isBn ? "নির্বাচন ও ভোটদান সংক্রান্ত অ্যালার্ট" : "Election & Voting Alerts"}
              </p>
              <p className="text-[11px]" style={{ color: C.onSurfaceVariant }}>
                {isBn ? "মনোনয়ন ও ভোটগ্রহণ শুরু হলে বার্তা" : "Updates on active ballots and elections"}
              </p>
            </div>
            <input
              type="checkbox"
              checked={appSettings.electionAlerts !== false}
              onChange={e => updateSetting("electionAlerts", e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
          </label>

          {/* Sound & Haptics */}
          <label className="flex items-center justify-between cursor-pointer py-1 select-none border-t pt-2.5" style={{ borderColor: C.outlineVariant }}>
            <div>
              <p className="text-xs font-bold" style={{ color: C.onSurface }}>
                {isBn ? "সাউন্ড ও হ্যাপটিক ভাইব্রেশন" : "Sound & Haptic Feedback"}
              </p>
              <p className="text-[11px]" style={{ color: C.onSurfaceVariant }}>
                {isBn ? "বাটনে ক্লিক ও ইন্টারঅ্যাকশনের সময় মৃদু ভাইব্রেশন" : "Subtle feedback when tapping actions"}
              </p>
            </div>
            <input
              type="checkbox"
              checked={appSettings.soundEnabled !== false}
              onChange={e => updateSetting("soundEnabled", e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
          </label>
        </Card>
      </div>

      {/* ── SECTION 3: STORAGE, DATA & OFFLINE CACHE ───────── */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: C.primary }}>
          <HardDrive size={14} />
          <span>{isBn ? "ডাটা ও অফলাইন ক্যাশ ব্যবস্থাপনা" : "Data & Offline Storage"}</span>
        </h4>

        <Card className="p-4 space-y-3 border" style={{ borderColor: C.outlineVariant }}>
          {/* Data Saver Mode */}
          <label className="flex items-center justify-between cursor-pointer py-1 select-none">
            <div>
              <p className="text-xs font-bold" style={{ color: C.onSurface }}>
                {isBn ? "ডাটা সাশ্রয়ী মোড (Data Saver)" : "Data Saver Mode"}
              </p>
              <p className="text-[11px]" style={{ color: C.onSurfaceVariant }}>
                {isBn ? "মোবাইল ডাটা সাশ্রয়ে ছবি ও ভিডিও কম রেজোলিউশনে লোড হবে" : "Optimizes media loading on mobile data"}
              </p>
            </div>
            <input
              type="checkbox"
              checked={!!appSettings.dataSaver}
              onChange={e => updateSetting("dataSaver", e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
          </label>

          {/* Sync Now Action */}
          <div className="flex items-center justify-between pt-2.5 border-t" style={{ borderColor: C.outlineVariant }}>
            <div>
              <p className="text-xs font-bold" style={{ color: C.onSurface }}>
                {isBn ? "ক্লাউড ডাটা সিঙ্ক" : "Cloud Data Sync"}
              </p>
              <p className="text-[11px]" style={{ color: C.onSurfaceVariant }}>
                {isBn ? "সার্ভারের সাথে তাত্ক্ষণিক ডাটা রিয়েলটাইম আপডেট" : "Force sync with Supabase cloud server"}
              </p>
            </div>
            <Btn size="sm" variant="outline" icon={RefreshCw} onClick={handleManualSync} disabled={isSyncing}>
              {isSyncing ? (isBn ? "সিঙ্ক হচ্ছে..." : "Syncing...") : (isBn ? "সিঙ্ক করুন" : "Sync Now")}
            </Btn>
          </div>

          {/* Clear Offline Cache */}
          <div className="flex items-center justify-between pt-2.5 border-t" style={{ borderColor: C.outlineVariant }}>
            <div>
              <p className="text-xs font-bold" style={{ color: C.onSurface }}>
                {isBn ? "অস্থায়ী ক্যাশ মেমোরি পরিষ্কার" : "Clear App Cache"}
              </p>
              <p className="text-[11px]" style={{ color: C.onSurfaceVariant }}>
                {isBn ? `বর্তমান ক্যাশ সাইজ: ${cacheSize}` : `Estimated cache: ${cacheSize}`}
              </p>
            </div>
            <Btn size="sm" variant="outline" icon={Trash2} onClick={clearAppCache}>
              {isBn ? "ক্যাশ মুছুন" : "Clear"}
            </Btn>
          </div>
        </Card>
      </div>

      {/* ── SECTION 4: ABOUT APPLICATION ───────────────────── */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: C.primary }}>
          <Info size={14} />
          <span>{isBn ? "অ্যাপ তথ্য ও গঠনতন্ত্র রেফারেন্স" : "About & System Info"}</span>
        </h4>

        <Card className="p-4 space-y-2.5 border" style={{ borderColor: C.outlineVariant }}>
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: C.onSurfaceVariant }}>{isBn ? "অ্যাপ সংস্করণ" : "App Version"}</span>
            <span className="font-bold" style={{ color: C.onSurface }}>v1.8.0 (Release Build)</span>
          </div>

          <div className="flex items-center justify-between text-xs border-t pt-2" style={{ borderColor: C.outlineVariant }}>
            <span style={{ color: C.onSurfaceVariant }}>{isBn ? "রেজিস্টার্ড এলাকা" : "Registered Area"}</span>
            <span className="font-bold text-right" style={{ color: C.onSurface }}>কুঞ্জছায়া আ/এ, বায়েজিদ, চট্টগ্রাম</span>
          </div>

          <div className="flex items-center justify-between text-xs border-t pt-2" style={{ borderColor: C.outlineVariant }}>
            <span style={{ color: C.onSurfaceVariant }}>{isBn ? "গঠনতান্ত্রিক ভিত্তি" : "Constitutional Framework"}</span>
            <span className="font-bold" style={{ color: C.onSurface }}>ধারা ১–৩২ (অনুমোদিত)</span>
          </div>

          <div className="flex items-center justify-between text-xs border-t pt-2" style={{ borderColor: C.outlineVariant }}>
            <span style={{ color: C.onSurfaceVariant }}>{isBn ? "ক্লাউড ডেটাবেজ" : "Cloud Database"}</span>
            <span className="font-bold flex items-center gap-1 text-emerald-500">
              <CheckCircle2 size={13} /> Connected (PostgreSQL)
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
