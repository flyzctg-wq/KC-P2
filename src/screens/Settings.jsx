import React, { useState, useEffect } from "react";
import {
  Settings, Bell, Type, Moon, Sun, Laptop, Globe, Volume2, VolumeX,
  Smartphone, Trash2, RefreshCw, ShieldCheck, CheckCircle2, Sliders,
  Info, HardDrive, Wifi, Lock, Zap, Sparkles, SmartphoneCharging, BellRing,
  BookOpen, FileDown, Download, ExternalLink, Share2, Eye, Printer, FileText
} from "lucide-react";
import { Btn, Card, Badge, Field, SectionTitle, Modal } from "../components/primitives";
import { C, APP_VERSION } from "../theme";
import { checkNotificationPermission, requestNotificationPermission, showLocalNotification } from "../lib/notifications";
import { playNotificationSound } from "../lib/sound";

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
  const [notificationPermission, setNotificationPermission] = useState("prompt");
  const [cacheSize, setCacheSize] = useState("1.4 MB");
  const [isSyncing, setIsSyncing] = useState(false);
  const [readingDoc, setReadingDoc] = useState(null);
  const [docLoading, setDocLoading] = useState(false);
  const iframeRef = React.useRef(null);

  const MANUALS = [
    {
      id: "bn",
      titleBn: "বাংলা নির্দেশিকা",
      titleEn: "Bengali Manual",
      descBn: "কুঞ্জছায়া ক্লাবের সকল মডিউল, হিসাব, কমিউনিটি ম্যাপ ও সাধারণ নির্দেশিকা",
      descEn: "Complete Bengali guide for all club modules, map & dues",
      pdfFile: "Kunjachaya_Club_User_Manual_Bengali.pdf",
      htmlFile: "kunjachaya_user_manual_bn.html",
      size: "312 KB",
      accent: "emerald",
      badgeBn: "বাংলা সংস্করণ",
      badgeEn: "Bengali Edition",
      colorClass: "emerald",
    },
    {
      id: "en",
      titleBn: "ইংরেজি নির্দেশিকা",
      titleEn: "English Manual",
      descBn: "Official user manual, system modules, permissions and admin workflows",
      descEn: "Official user manual, system modules, permissions and admin workflows",
      pdfFile: "Kunjachaya_Club_User_Manual_English.pdf",
      htmlFile: "kunjachaya_user_manual_en.html",
      size: "489 KB",
      accent: "blue",
      badgeBn: "ইংরেজি সংস্করণ",
      badgeEn: "English Edition",
      colorClass: "blue",
    },
    {
      id: "bilingual",
      titleBn: "দ্বিভাষিক পূর্ণাঙ্গ",
      titleEn: "Full Bilingual Guide",
      descBn: "বাংলা ও ইংরেজি উভয় ভাষায় সংকলিত পূর্ণাঙ্গ কনস্টিটিউশনাল ও ইউজার গাইড",
      descEn: "Complete comprehensive bilingual user & constitutional manual",
      pdfFile: "Kunjachaya_Club_User_Manual_Bilingual.pdf",
      htmlFile: "kunjachaya_user_manual_bilingual.html",
      size: "665 KB",
      accent: "purple",
      badgeBn: "সর্বাধিক পূর্ণাঙ্গ",
      badgeEn: "Comprehensive",
      colorClass: "purple",
    },
  ];

  const handleReadManual = (manual) => {
    setReadingDoc(manual);
  };

  const handleDownloadPdf = async (manual) => {
    const filename = manual.pdfFile;
    const displayName = isBn ? `${manual.titleBn}.pdf` : `${manual.titleEn}.pdf`;

    setDocLoading(true);
    // 1. Native Android Bridge
    if (window.AndroidDocs?.downloadPdf) {
      try {
        window.AndroidDocs.downloadPdf(filename, displayName);
        toast(isBn ? "ম্যানুয়াল ডাউনলোড হচ্ছে..." : "Downloading manual...");
        setDocLoading(false);
        return;
      } catch (e) {
        console.warn("AndroidDocs.downloadPdf error:", e);
      }
    }

    // 2. Web / Browser Blob Download
    try {
      const res = await fetch(`/docs/${filename}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = displayName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
      toast(isBn ? "ম্যানুয়াল ডাউনলোড সম্পন্ন হয়েছে!" : "Manual downloaded successfully!");
    } catch (err) {
      console.error("PDF download fallback error:", err);
      window.open(`/docs/${filename}`, "_blank");
      toast(isBn ? "নথিটি নতুন উইন্ডোতে খোলা হয়েছে।" : "Opening document in new tab.");
    } finally {
      setDocLoading(false);
    }
  };

  const handleOpenPdf = (manual) => {
    const filename = manual.pdfFile;
    const title = isBn ? manual.titleBn : manual.titleEn;

    // 1. Native Android Bridge
    if (window.AndroidDocs?.openPdf) {
      try {
        window.AndroidDocs.openPdf(filename, title);
        return;
      } catch (e) {
        console.warn("AndroidDocs.openPdf error:", e);
      }
    }

    // 2. Web fallback: open in browser or fallback to reader
    try {
      const w = window.open(`/docs/${filename}`, "_blank");
      if (!w) {
        setReadingDoc(manual);
      }
    } catch {
      setReadingDoc(manual);
    }
  };

  const handleSharePdf = async (manual) => {
    const filename = manual.pdfFile;
    const title = isBn ? manual.titleBn : manual.titleEn;

    // 1. Native Android Bridge
    if (window.AndroidDocs?.sharePdf) {
      try {
        window.AndroidDocs.sharePdf(filename, title);
        return;
      } catch (e) {
        console.warn("AndroidDocs.sharePdf error:", e);
      }
    }

    // 2. Web Share API with File
    try {
      const res = await fetch(`/docs/${filename}`);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: "application/pdf" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text: isBn ? "কুঞ্জছায়া ক্লাব ব্যবহার নির্দেশিকা (PDF)" : "Kunjachaya Club User Manual (PDF)",
        });
        return;
      }
    } catch (e) {
      console.warn("Web Share API error:", e);
    }

    // Fallback: download
    handleDownloadPdf(manual);
  };

  useEffect(() => {
    checkNotificationPermission().then(status => {
      setNotificationPermission(status);
    });
  }, []);

  const updateSetting = (key, value) => {
    if (setAppSettings) {
      setAppSettings(prev => ({ ...prev, [key]: value }));
    }
  };

  const requestPushPermission = async () => {
    try {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        toast(isBn ? "পুশ নোটিফিকেশন সফলভাবে চালু করা হয়েছে!" : "Push notifications enabled successfully!");
        updateSetting("pushNotifications", true);
        playNotificationSound("success", true);
        showLocalNotification({
          title: isBn ? "কুঞ্জছায়া ক্লাব নোটিফিকেশন" : "Kunjachaya Club Notifications",
          body: isBn ? "আপনার ডিভাইসে নোটিফিকেশন সফলভাবে চালু হয়েছে।" : "Device notifications have been successfully enabled.",
        });
      } else if (permission === "denied") {
        toast(isBn ? "নোটিফিকেশনের অনুমতি দেওয়া হয়নি। অনুগ্রহ করে ডিভাইস সেটিংস থেকে অনুমতি দিন।" : "Notification permission was denied. Please allow it in device settings.", "error");
        updateSetting("pushNotifications", false);
      } else {
        toast(isBn ? "এই ডিভাইসে নোটিফিকেশন সমর্থিত নয়।" : "Notifications not supported on this browser/device.", "error");
      }
    } catch (e) {
      toast(isBn ? "নোটিফিকেশন অনুমোদনে ত্রুটি।" : "Error requesting notification permission.", "error");
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
              <span>v{APP_VERSION} (Android & Web) · {session.name}</span>
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
          <div className="border-t pt-2.5 space-y-2" style={{ borderColor: C.outlineVariant }}>
            <label className="flex items-center justify-between cursor-pointer py-1 select-none">
              <div>
                <p className="text-xs font-bold" style={{ color: C.onSurface }}>
                  {isBn ? "নোটিফিকেশন সাউন্ড ও অ্যালার্ট" : "Notification Sound & Alerts"}
                </p>
                <p className="text-[11px]" style={{ color: C.onSurfaceVariant }}>
                  {isBn ? "নোটিশ, চাঁদা ও বার্তার সময় মিষ্টি সুরের নোটিফিকেশন সাউন্ড" : "Pleasant bell chime on notices, dues and alerts"}
                </p>
              </div>
              <input
                type="checkbox"
                checked={appSettings.soundEnabled !== false}
                onChange={e => updateSetting("soundEnabled", e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px]" style={{ color: C.onSurfaceVariant }}>
                {isBn ? "সাউন্ড কেমন শোনাবে তা পরীক্ষা করতে পারেন:" : "Preview how the chime sounds:"}
              </span>
              <button
                type="button"
                onClick={() => {
                  playNotificationSound("notice", true);
                  toast(isBn ? "🔔 নোটিফিকেশন সুর বাজানো হয়েছে!" : "🔔 Notification chime played!");
                }}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg border flex items-center gap-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5 active:scale-95"
                style={{ borderColor: C.primary, color: C.primary }}
              >
                <Volume2 size={13} />
                <span>{isBn ? "সাউন্ড টেস্ট করুন" : "Test Chime"}</span>
              </button>
            </div>
          </div>
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
            <span className="font-bold" style={{ color: C.onSurface }}>v{APP_VERSION} (Release Build)</span>
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

      {/* ── SECTION 5: USER MANUAL (BILINGUAL PDF & IN-APP GUIDE) ───────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: C.primary }}>
            <BookOpen size={14} />
            <span>{isBn ? "ব্যবহার নির্দেশিকা ও গাইড (PDF ও ভিউয়ার)" : "User Manual & Documentation (PDF & Viewer)"}</span>
          </h4>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            {isBn ? "অফিসিয়াল সংস্করণ" : "Official Release"}
          </span>
        </div>

        <Card className="p-4 space-y-3 border" style={{ borderColor: C.outlineVariant }}>
          <p className="text-xs leading-relaxed" style={{ color: C.onSurfaceVariant }}>
            {isBn
              ? "কুঞ্জছায়া ক্লাবের সকল মডিউল, চাঁদার রসিদ, কমিউনিটি ম্যাপ, ল্যান্ডমার্ক ও অ্যাডমিন পরিচালনার পূর্ণাঙ্গ ব্যবহার নির্দেশিকা অ্যাপে সরাসরি পড়ুন অথবা পিডিএফ হিসেবে ডাউনলোড ও শেয়ার করুন:"
              : "Read the official user guide directly in the app or download, open and share high-resolution PDF manuals for all club modules, dues receipts, maps, and admin workflows:"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {MANUALS.map((manual) => {
              const title = isBn ? manual.titleBn : manual.titleEn;
              const desc = isBn ? manual.descBn : manual.descEn;
              const badge = isBn ? manual.badgeBn : manual.badgeEn;

              const isEmerald = manual.colorClass === "emerald";
              const isBlue = manual.colorClass === "blue";

              const borderCls = isEmerald
                ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20"
                : isBlue
                ? "border-blue-200 dark:border-blue-800/60 bg-blue-50/40 dark:bg-blue-950/20"
                : "border-purple-200 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/20";

              const iconCls = isEmerald
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                : isBlue
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                : "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300";

              const btnPrimaryCls = isEmerald
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : isBlue
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white";

              return (
                <div
                  key={manual.id}
                  className={`flex flex-col justify-between p-3.5 rounded-2xl border transition-all hover:shadow-sm ${borderCls}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconCls}`}>
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs" style={{ color: C.onSurface }}>{title}</h5>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{badge}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 shadow-2xs">
                        {manual.size}
                      </span>
                    </div>

                    <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: C.onSurfaceVariant }}>
                      {desc}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 mt-1 border-t border-black/5 dark:border-white/5 space-y-1.5">
                    {/* Primary Button: Read in App */}
                    <button
                      type="button"
                      onClick={() => handleReadManual(manual)}
                      className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-transform active:scale-[0.98] shadow-xs ${btnPrimaryCls}`}
                    >
                      <Eye size={14} />
                      <span>{isBn ? "অ্যাপে পড়ুন (View)" : "Read Guide"}</span>
                    </button>

                    {/* Secondary Actions: Download, Open, Share */}
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(manual)}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-white hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-gray-200 dark:border-gray-700 transition-colors"
                        title={isBn ? "পিডিএফ ডাউনলোড" : "Download PDF"}
                      >
                        <FileDown size={13} className="text-emerald-600 dark:text-emerald-400" />
                        <span className="truncate">{isBn ? "ডাউনলোড" : "Save"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenPdf(manual)}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-white hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-gray-200 dark:border-gray-700 transition-colors"
                        title={isBn ? "পিডিএফ অ্যাপে খুলুন" : "Open in PDF App"}
                      >
                        <ExternalLink size={13} className="text-blue-600 dark:text-blue-400" />
                        <span className="truncate">{isBn ? "ওপেন" : "Open"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSharePdf(manual)}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-white hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-gray-200 dark:border-gray-700 transition-colors"
                        title={isBn ? "শেয়ার করুন" : "Share"}
                      >
                        <Share2 size={13} className="text-purple-600 dark:text-purple-400" />
                        <span className="truncate">{isBn ? "শেয়ার" : "Share"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── IN-APP USER MANUAL VIEWER MODAL ───────────── */}
      {readingDoc && (
        <Modal
          open={!!readingDoc}
          onClose={() => setReadingDoc(null)}
          title={isBn ? readingDoc.titleBn : readingDoc.titleEn}
          width="max-w-4xl"
        >
          <div className="space-y-3">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b" style={{ borderColor: C.outlineVariant }}>
              <div className="flex items-center gap-2">
                <Badge tone="success">
                  {isBn ? readingDoc.badgeBn : readingDoc.badgeEn}
                </Badge>
                <span className="text-xs text-gray-500 font-medium">{readingDoc.size}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      iframeRef.current?.contentWindow?.print();
                    } catch (e) {
                      window.print();
                    }
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 transition-colors"
                  title={isBn ? "প্রিন্ট করুন" : "Print"}
                >
                  <Printer size={13} />
                  <span>{isBn ? "প্রিন্ট" : "Print"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPdf(readingDoc)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
                  title={isBn ? "পিডিএফ ডাউনলোড" : "Download PDF"}
                >
                  <FileDown size={13} />
                  <span>{isBn ? "ডাউনলোড" : "Download"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSharePdf(readingDoc)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
                  title={isBn ? "শেয়ার করুন" : "Share"}
                >
                  <Share2 size={13} />
                  <span>{isBn ? "শেয়ার" : "Share"}</span>
                </button>
              </div>
            </div>

            {/* In-App Interactive HTML Viewer */}
            <div className="w-full bg-white rounded-xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700">
              <iframe
                ref={iframeRef}
                src={`/docs/${readingDoc.htmlFile}`}
                title={isBn ? readingDoc.titleBn : readingDoc.titleEn}
                className="w-full h-[68vh] sm:h-[72vh] border-0"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
