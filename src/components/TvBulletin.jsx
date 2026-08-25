import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Siren, Zap, AlertTriangle,
  Eye, X, Clock, ExternalLink
} from "lucide-react";
import { Modal, Btn, Badge } from "./primitives";
import { C } from "../theme";
import { fmtDateTime } from "../utils";

export default function TvBulletin({
  notices = [],
  lang = "en",
  setView = () => {},
  session = null
}) {
  const isBn = lang === "bn";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [now, setNow] = useState(Date.now());
  const tickerRef = useRef(null);

  // Update clock every minute to recalculate expiry and remaining times
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Filter active bulletins
  const activeBulletins = useMemo(() => {
    if (!Array.isArray(notices) || notices.length === 0) return [];

    return notices.filter(n => {
      // Must be marked as bulletin or high-urgency bulletin
      const isMarkedBulletin = n.isBulletin === true || n.bulletinType === "breaking" || n.category === "Urgent" || n.category === "Quick";
      if (!isMarkedBulletin) return false;

      // Check expiry if set
      if (n.bulletinExpiresAt) {
        const expiryTime = new Date(n.bulletinExpiresAt).getTime();
        if (!isNaN(expiryTime) && expiryTime <= now) {
          return false; // Expired
        }
      }

      return true;
    }).sort((a, b) => {
      // Prioritize breaking > quick > important > urgent
      const priority = (x) => {
        if (x.bulletinType === "breaking") return 3;
        if (x.bulletinType === "quick" || x.category === "Urgent") return 2;
        return 1;
      };
      const diff = priority(b) - priority(a);
      if (diff !== 0) return diff;
      return new Date(b.date || 0) - new Date(a.date || 0);
    });
  }, [notices, now]);

  // Adjust index if out of bounds (kept for modal navigation)
  useEffect(() => {
    if (currentIndex >= activeBulletins.length && activeBulletins.length > 0) {
      setCurrentIndex(0);
    }
  }, [activeBulletins.length, currentIndex]);

  // Build the combined ticker text from ALL active bulletins
  // Format: "Title — Body  ◈  Title — Body  ◈ …"
  const SEPARATOR = "\u00a0\u00a0\u25c8\u00a0\u00a0"; // non-breaking spaces around ◈
  const tickerText = useMemo(() => {
    if (activeBulletins.length === 0) return "";
    return activeBulletins
      .map(n => `${n.title}\u2014${n.body || ""}`) // em-dash
      .join(SEPARATOR);
  }, [activeBulletins]);

  // Compute animation duration proportional to text length (≈ 60px per char, 100px/s)
  const tickerDuration = useMemo(() => {
    const charCount = tickerText.length || 80;
    const px = charCount * 10; // rough pixel width
    return Math.max(15, Math.round(px / 90)); // seconds, min 15s
  }, [tickerText]);

  if (activeBulletins.length === 0) {
    return null; // No active TV bulletin
  }

  const current = activeBulletins[currentIndex] || activeBulletins[0];
  const bType = current.bulletinType || (current.category === "Urgent" ? "breaking" : "quick");

  const getStyleConfig = (type) => {
    switch (type) {
      case "breaking":
        return {
          bg: "bg-red-600 dark:bg-red-950/80",
          border: "border-red-500/30 dark:border-red-800/50",
          badgeBg: "bg-red-700 text-white shadow-md shadow-red-900/30",
          badgeLabel: isBn ? "ব্রেকিং বুলেটিন" : "BREAKING",
          icon: Siren,
          iconColor: "text-amber-300",
          textColor: "text-white dark:text-red-100",
          accentColor: "#ef4444",
        };
      case "important":
        return {
          bg: "bg-emerald-800 dark:bg-emerald-950/80",
          border: "border-emerald-600/30 dark:border-emerald-800/50",
          badgeBg: "bg-emerald-900 text-emerald-100 shadow-md",
          badgeLabel: isBn ? "জরুরি ঘোষণা" : "IMPORTANT",
          icon: AlertTriangle,
          iconColor: "text-amber-400",
          textColor: "text-white dark:text-emerald-100",
          accentColor: "#10b981",
        };
      case "quick":
      default:
        return {
          bg: "bg-amber-600 dark:bg-amber-950/80",
          border: "border-amber-500/30 dark:border-amber-800/50",
          badgeBg: "bg-amber-700 text-white shadow-md shadow-amber-950/30",
          badgeLabel: isBn ? "কুইক নোটিশ" : "QUICK NOTICE",
          icon: Zap,
          iconColor: "text-amber-200",
          textColor: "text-white dark:text-amber-50",
          accentColor: "#f59e0b",
        };
    }
  };

  const style = getStyleConfig(bType);
  const IconComp = style.icon;

  // Calculate remaining time string
  const getRemainingTimeStr = (expiresAt) => {
    if (!expiresAt) return isBn ? "স্থায়ী (সক্রিয়)" : "Active (Until removed)";
    const diff = new Date(expiresAt).getTime() - now;
    if (diff <= 0) return isBn ? "মেয়াদোত্তীর্ণ" : "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      const remHours = hours % 24;
      return isBn
        ? `সময় বাকি: ${days} দিন ${remHours} ঘণ্টা`
        : `Expires in: ${days}d ${remHours}h`;
    }
    if (hours > 0) {
      return isBn
        ? `সময় বাকি: ${hours} ঘণ্টা ${mins} মিনিট`
        : `Expires in: ${hours}h ${mins}m`;
    }
    return isBn ? `সময় বাকি: ${mins} মিনিট` : `Expires in: ${mins}m`;
  };

  const handleOpenNotice = (notice) => {
    setSelectedNotice(notice);
  };

  const navigateToNotices = () => {
    setSelectedNotice(null);
    if (session?.role === "admin") {
      setView("a-notices");
    } else {
      setView("r-notices");
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-full px-3 py-1 flex items-center justify-between text-xs border-b transition-all duration-300" style={{ backgroundColor: C.surfaceContainer, borderColor: C.outlineVariant }}>
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-1.5 font-bold hover:underline"
          style={{ color: style.accentColor }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse-live" style={{ backgroundColor: style.accentColor }} />
          <span>{style.badgeLabel} ({activeBulletins.length})</span>
          <span className="opacity-70 font-normal truncate max-w-[200px] sm:max-w-md">— {current.title}</span>
        </button>
        <button
          onClick={() => setIsCollapsed(false)}
          className="text-[11px] font-bold px-2 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
        >
          {isBn ? "প্রদর্শন করুন" : "Show Banner"}
        </button>
      </div>
    );
  }

  return (
    <>
      <section
        aria-label="Live TV Bulletin"
        className={`w-full relative z-20 border-b overflow-hidden shadow-sm transition-all duration-300 ${style.bg} ${style.border}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className="flex items-center justify-between h-9 sm:h-10 px-2 sm:px-4 gap-2">
          {/* Left TV Bulletin Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-black tracking-wider uppercase ${style.badgeBg}`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <IconComp size={13} className={style.iconColor} />
              <span className="whitespace-nowrap">{style.badgeLabel}</span>
            </div>
            {activeBulletins.length > 1 && (
              <span className="text-[10px] font-extrabold text-white/80 hidden xs:inline px-1 py-0.5 rounded bg-black/20">
                {currentIndex + 1}/{activeBulletins.length}
              </span>
            )}
          </div>

          {/* Scrolling Marquee Ticker — right to left, all bulletins */}
          <div
            className="flex-1 min-w-0 overflow-hidden cursor-pointer relative"
            style={{ maskImage: "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)" }}
            title={isBn ? "বিস্তারিত পড়তে ক্লিক করুন" : "Click to read full bulletin"}
            onClick={() => handleOpenNotice(current)}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Duplicate the text so the loop is seamless */}
            <div
              ref={tickerRef}
              className={`animate-ticker ${isPaused ? "animate-ticker-paused" : ""} ${style.textColor}`}
              style={{ animationDuration: `${tickerDuration * 2}s` }}
            >
              {/* First copy */}
              <span className="text-xs sm:text-sm font-semibold pr-16">
                {tickerText}
              </span>
              {/* Seamless duplicate */}
              <span className="text-xs sm:text-sm font-semibold pr-16" aria-hidden="true">
                {tickerText}
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 text-white">
            <button
              type="button"
              onClick={() => handleOpenNotice(activeBulletins[0])}
              className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-white/20 hover:bg-white/30 hidden sm:flex items-center gap-1 transition-colors"
            >
              <Eye size={12} /> {isBn ? "বিস্তারিত" : "Read"}
            </button>

            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded hover:bg-white/20 opacity-70 hover:opacity-100 transition-opacity"
              title={isBn ? "মিনিমাইজ করুন" : "Collapse Banner"}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Bulletin Detail Read Modal */}
      {selectedNotice && (
        <Modal
          open={!!selectedNotice}
          onClose={() => setSelectedNotice(null)}
          title={isBn ? "টিভি বুলেটিন বিস্তারিত" : "TV Bulletin Notice Details"}
        >
          <div className="space-y-4 py-1">
            <div className="flex items-center justify-between gap-2 border-b pb-2" style={{ borderColor: C.outlineVariant }}>
              <div className="flex items-center gap-2">
                <Badge tone={selectedNotice.bulletinType === "breaking" ? "danger" : selectedNotice.bulletinType === "important" ? "success" : "warning"}>
                  {style.badgeLabel}
                </Badge>
                <span className="text-xs font-semibold" style={{ color: C.outline }}>
                  {fmtDateTime(selectedNotice.date)}
                </span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1" style={{ backgroundColor: C.surfaceContainerLow, color: C.primary }}>
                <Clock size={12} /> {getRemainingTimeStr(selectedNotice.bulletinExpiresAt)}
              </span>
            </div>

            <div>
              <h2 className="text-base font-extrabold heading leading-snug mb-2">
                {selectedNotice.title}
              </h2>
              <div
                className="text-xs sm:text-sm leading-relaxed p-3.5 rounded-xl border whitespace-pre-wrap"
                style={{ backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant, color: C.onSurface }}
              >
                {selectedNotice.body}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1" style={{ color: C.onSurfaceVariant }}>
              <span>
                {isBn ? "প্রকাশক: " : "Published by: "}
                <strong>{selectedNotice.authorName || "Kunjachaya Admin"}</strong>
              </span>
              <span>
                {selectedNotice.reactions?.like?.length || 0} {isBn ? "পছন্দ" : "likes"} · {selectedNotice.comments?.length || 0} {isBn ? "মন্তব্য" : "comments"}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: C.outlineVariant }}>
              <Btn full onClick={navigateToNotices} icon={ExternalLink}>
                {isBn ? "নোটিশ বোর্ডে যান ও প্রতিক্রিয়া দিন" : "Open in Notice Board"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
