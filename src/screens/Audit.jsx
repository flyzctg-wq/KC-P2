import React, { useState } from "react";
import {
  FileSearch, ShieldCheck, FileDown, Wallet, Vote, Users, AlertCircle, ScrollText,
} from "lucide-react";
import { Btn, Card, Empty, SectionTitle } from "../components/primitives";
import { C } from "../theme";
import { fmtDateTime, currentMonthYM } from "../utils";

/* -----------------------------------------------------------------
   GOVERNANCE AUDIT LOG
   Shows only significant accountability-level actions.
   Routine operational noise stays in the Activity Log only.
   ----------------------------------------------------------------- */

const NOISE_PATTERNS = [
  /^added emergency contact/i,
  /^removed emergency contact/i,
  /^uploaded scanned membership form/i,
  /^completed handover item/i,
  /^responded to ticket/i,
  /^submitted support ticket/i,
  /^created event/i,
  /^rsvp/i,
  /^digitally inducted/i,
  /\btest\b/i,
];

const isAuditSignificant = (action = "") =>
  !NOISE_PATTERNS.some(pat => pat.test(action));

export default function Audit({ session, db, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [cat, setCat] = useState("all");

  const isCouncil = !!session.standingCouncil;
  const isTopTier =
    session.role === "admin" &&
    (session.post === "President" || session.post === "General Secretary");
  const canViewFinancial =
    session.role === "admin" && session.permissions?.canManageFinancials;
  const allowed = isCouncil || isTopTier || canViewFinancial;

  const categorize = (action) => {
    const a = action.toLowerCase();
    if (
      a.includes("paid") || a.includes("dues") || a.includes("budget") ||
      a.includes("chanda") || a.includes("financial") ||
      a.includes("expense") || a.includes("payment") ||
      (a.includes("issued") && a.includes("monthly"))
    ) return "financial";
    if (
      a.includes("vote") || a.includes("election") || a.includes("ballot") ||
      a.includes("nomination") || a.includes("certified")
    ) return "election";
    if (
      a.includes("member") || a.includes("approved") || a.includes("rejected") ||
      a.includes("role") || a.includes("kicked") || a.includes("awarded") ||
      a.includes("badge")
    ) return "membership";
    return "other";
  };

  const CAT_META = {
    financial:  { icon: Wallet,     color: "#16a34a" },
    election:   { icon: Vote,       color: "#7c3aed" },
    membership: { icon: Users,      color: "#0284c7" },
    other:      { icon: ScrollText, color: "#64748b" },
  };

  const entries = (db.activity || [])
    .filter(a => isAuditSignificant(a.action))
    .map(a => ({ ...a, cat: categorize(a.action) }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const filtered = cat === "all" ? entries : entries.filter(e => e.cat === cat);

  const cats = [
    { k: "all",        l: isBn ? "সকল"       : "All" },
    { k: "financial",  l: isBn ? "আর্থিক"    : "Financial" },
    { k: "election",   l: isBn ? "নির্বাচন"  : "Election" },
    { k: "membership", l: isBn ? "সদস্যপদ"   : "Membership" },
    { k: "other",      l: isBn ? "অন্যান্য"  : "Other" },
  ];

  const exportCSV = () => {
    const rows = [
      ["Date", "Actor", "Category", "Action"],
      ...filtered.map(e => [fmtDateTime(e.date), e.actor, e.cat, e.action.replace(/,/g, ";")]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kunjachaya_audit_${cat}_${currentMonthYM()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!allowed) {
    return (
      <div>
        <SectionTitle>{isBn ? "গভর্ন্যান্স অডিট লগ" : "Governance Audit Log"}</SectionTitle>
        <Empty
          icon={ShieldCheck}
          title={isBn ? "অনুমতি সংরক্ষিত" : "Restricted"}
          subtitle={
            isBn
              ? "অডিট লগ শুধুমাত্র স্থায়ী পরিষদ সদস্য এবং শীর্ষ নির্বাহীদের জন্য উন্মুক্ত।"
              : "Audit access is limited to Standing Council members and top-tier committee officers."
          }
        />
      </div>
    );
  }

  return (
    <div>
      <SectionTitle
        action={
          <Btn size="sm" icon={FileDown} onClick={exportCSV}>
            {isBn ? "সিএসভি ডাউনলোড" : "Export CSV"}
          </Btn>
        }
      >
        {isBn ? "গভর্ন্যান্স অডিট লগ (ধারা-২৬)" : "Governance Audit Log"}
      </SectionTitle>

      {/* Explanation banner */}
      <div
        className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-xl text-xs"
        style={{ backgroundColor: C.surfaceContainer, color: C.onSurfaceVariant }}
      >
        <AlertCircle size={13} className="shrink-0 mt-0.5" />
        <span>
          {isBn
            ? "এই লগে শুধুমাত্র গুরুত্বপূর্ণ গভর্ন্যান্স কার্যক্রম প্রদর্শিত হয়। সম্পূর্ণ রেকর্ডের জন্য কার্যক্রমের রেকর্ড পৃষ্ঠা দেখুন।"
            : "Only significant governance actions are displayed. For the full operational log, see the Activity Log page."}
        </span>
      </div>

      {/* Filter pills with counts */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {cats.map(c => {
          const count = c.k === "all" ? entries.length : entries.filter(e => e.cat === c.k).length;
          const isActive = c.k === cat;
          return (
            <button
              key={c.k}
              onClick={() => setCat(c.k)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors"
              style={
                isActive
                  ? { backgroundColor: C.primary, color: "#fff" }
                  : { backgroundColor: C.surfaceContainer, color: C.onSurfaceVariant }
              }
            >
              {c.l}
              <span
                className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-none"
                style={
                  isActive
                    ? { backgroundColor: "rgba(255,255,255,0.25)", color: "#fff" }
                    : { backgroundColor: C.outlineVariant, color: C.onSurface }
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <Card className="p-2">
        {filtered.map((a, i) => {
          const meta = CAT_META[a.cat] || CAT_META.other;
          const CatIcon = meta.icon;
          return (
            <div
              key={a.id}
              className="flex items-start gap-3 px-3 py-3"
              style={{ borderTop: i ? `1px solid ${C.outlineVariant}` : "none" }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: meta.color + "1a" }}
              >
                <CatIcon size={14} style={{ color: meta.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">
                  <span className="font-bold">{a.actor}</span>{" "}
                  <span style={{ color: C.onSurfaceVariant }}>{a.action}</span>
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <p className="text-[11px]" style={{ color: C.outline }}>
                    {fmtDateTime(a.date)}
                  </p>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{ backgroundColor: meta.color + "1a", color: meta.color }}
                  >
                    {isBn ? (cats.find(c => c.k === a.cat)?.l || a.cat) : a.cat}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <Empty
            icon={FileSearch}
            title={isBn ? "কোনো অডিট রেকর্ড পাওয়া যায়নি" : "No audit entries"}
            subtitle={
              isBn
                ? "এই শ্রেণিতে কোনো গুরুত্বপূর্ণ গভর্ন্যান্স কার্যক্রম নেই।"
                : "No significant governance actions in this category."
            }
          />
        )}
      </Card>
    </div>
  );
}
