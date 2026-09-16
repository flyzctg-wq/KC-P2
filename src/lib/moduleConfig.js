// src/lib/moduleConfig.js
//
// Central registry for the Module Toggle System.
// Super-admin can enable/disable any module via the Modules admin screen.
// Disabled modules are hidden from nav and blocked at the Router level for
// non-admin users. Changes persist in Supabase app_config and propagate
// in real-time to all connected clients.

import {
  Vote, CalendarCheck, Scale, PieChart, FileSearch,
  Droplet, Award, CalendarRange, MessageCircle, PhoneCall,
  ArrowLeftRight, BookOpen,
} from "lucide-react";

/** Default state — all modules enabled */
export const DEFAULT_MODULE_FLAGS = {
  elections:    true,
  agm:          true,
  amendments:   true,
  budget:       true,
  audit:        true,
  bloodBank:    true,
  events:       true,
  badges:       true,
  chat:         true,
  hotlines:     true,
  handover:     true,
  constitution: true,
};

/** Maps module key → all nav view keys it controls */
export const MODULE_NAV_KEYS = {
  elections:    ["r-elections", "a-elections"],
  agm:          ["agm"],
  amendments:   ["amendments"],
  budget:       ["budget"],
  audit:        ["audit", "a-activity"],
  bloodBank:    ["bloodBank"],
  events:       ["events"],
  badges:       ["badges"],
  chat:         ["chat"],
  hotlines:     ["hotlines"],
  handover:     ["a-handover"],
  constitution: ["constitution"],
};

/** Human-readable metadata for each module (used in the admin Modules screen) */
export const MODULE_META = {
  elections:    { labelEn: "Elections",              labelBn: "নির্বাচন",          icon: Vote },
  agm:          { labelEn: "AGM",                    labelBn: "এজিএম",              icon: CalendarCheck },
  amendments:   { labelEn: "Constitutional Amendments", labelBn: "সংশোধনী",        icon: Scale },
  budget:       { labelEn: "Budget",                 labelBn: "বাজেট",              icon: PieChart },
  audit:        { labelEn: "Log & Audit",            labelBn: "লগ ও অডিট",         icon: FileSearch },
  bloodBank:    { labelEn: "Blood Bank",             labelBn: "ব্লাড ব্যাংক",       icon: Droplet },
  events:       { labelEn: "Events",                 labelBn: "ইভেন্ট",             icon: CalendarRange },
  badges:       { labelEn: "Badges",                 labelBn: "ব্যাজ",              icon: Award },
  chat:         { labelEn: "Community Chat",         labelBn: "চ্যাট ফোরাম",        icon: MessageCircle },
  hotlines:     { labelEn: "Hotlines",               labelBn: "হটলাইন",             icon: PhoneCall },
  handover:     { labelEn: "EC Handover",            labelBn: "হ্যান্ডওভার",         icon: ArrowLeftRight },
  constitution: { labelEn: "Constitution",           labelBn: "সংবিধান",            icon: BookOpen },
};

/**
 * Returns true if the given nav view key is accessible under the current module flags.
 * Unmanaged keys (like home, dashboard, settings) are always enabled.
 */
export function isNavKeyEnabled(moduleFlags, key) {
  for (const [mod, keys] of Object.entries(MODULE_NAV_KEYS)) {
    if (keys.includes(key)) return (moduleFlags ?? DEFAULT_MODULE_FLAGS)[mod] !== false;
  }
  return true;
}

/** Returns the module key that owns a given nav key, or null */
export function moduleKeyForNavKey(key) {
  for (const [mod, keys] of Object.entries(MODULE_NAV_KEYS)) {
    if (keys.includes(key)) return mod;
  }
  return null;
}
