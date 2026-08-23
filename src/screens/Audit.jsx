import React, { useState } from "react";
import {
  FileSearch, ShieldCheck, FileDown, Wallet, Vote, Users, ScrollText,
  ClipboardList, AlertCircle, Clock,
} from "lucide-react";
import { Btn, Card, Empty, SectionTitle } from "../components/primitives";
import { C } from "../theme";
import { fmtDateTime, currentMonthYM } from "../utils";

/* ============================================================
   UNIFIED LOG — two tabs in one screen:
     [Governance Audit]  significant accountability actions only
     [Activity Log]      full chronological operational log
   ============================================================ */

// Routine actions excluded from the Governance Audit tab
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
const isSignificant = (action = "") =>
  !NOISE_PATTERNS.some(p => p.test(action));

const categorize = (action) => {
  const a = action.toLowerCase();
  if (
    a.includes("paid") || a.includes("dues") || a.includes("budget") ||
    a.includes("financial") || a.includes("expense") || a.includes("payment") ||
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

export default function Audit({ session, db, lang = "en", t = {} }) {
  const isBn = lang === "bn";

  // Access control (Governance tab)
  const isCouncil = !!session.standingCouncil;
  const isTopTier =
    session.role === "admin" &&
    (session.post === "President" || session.post === "General Secretary");
  const canViewFinancial =
    session.role === "admin" && session.permissions?.canManageFinancials;
  const canAudit = isCouncil || isTopTier || canViewFinancial;

  const [tab, setTab] = useState(canAudit ? "audit" : "activity");
  const [cat, setCat] = useState("all");

  // ── AUDIT tab data ──────────────────────────────────────────
  const auditEntries = (db.activity || [])
    .filter(a => isSignificant(a.action))
    .map(a => ({ ...a, cat: categorize(a.action) }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const auditCats = [
    { k: "all",        l: isBn ? "সকল"       : "All" },
    { k: "financial",  l: isBn ? "আর্থিক"    : "Financial" },
    { k: "election",   l: isBn ? "নির্বাচন"  : "Election" },
    { k: "membership", l: isBn ? "সদস্যপদ"   : "Membership" },
    { k: "other",      l: isBn ? "অন্যান্য"  : "Other" },
  ];
  const auditFiltered =
    cat === "all" ? auditEntries : auditEntries.filter(e => e.cat === cat);

  // ── ACTIVITY tab data ───────────────────────────────────────
  const activityEntries = [...(db.activity || [])].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // ── Export CSV ──────────────────────────────────────────────
  const exportCSV = () => {
    const rows =
      tab === "audit"
        ? [["Date", "Actor", "Category", "Action"], ...auditFiltered.map(e => [fmtDateTime(e.date), e.actor, e.cat, e.action.replace(/,/g, ";")])]
        : [["Date", "Actor", "Action"],             ...activityEntries.map(e => [fmtDateTime(e.date), e.actor, e.action.replace(/,/g, ";")])];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kunjachaya_${tab}_${currentMonthYM()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <SectionTitle
        action={
          <Btn size="sm" icon={FileDown} onClick={exportCSV}>
            {isBn ? "সিএসভি ডাউনলোড" : "Export CSV"}
          </Btn>
        }
      >
        {isBn ? "লগ ও অডিট" : "Log & Audit"}
      </SectionTitle>

      {/* ── Tab switcher ─────────────────────────────────────── */}
      <div
        className="flex gap-1 mb-5 p-1 rounded-xl"
        style={{ backgroundColor: C.surfaceContainer }}
      >
        {canAudit && (
          <button
            onClick={() => setTab("audit")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
            style={
              tab === "audit"
                ? { backgroundColor: C.surface, color: C.primary, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }
                : { color: C.onSurfaceVariant }
            }
          >
            <ShieldCheck size={13} />
            {isBn ? "গভর্ন্যান্স অডিট" : "Governance Audit"}
          </button>
        )}
        <button
          onClick={() => setTab("activity")}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
          style={
            tab === "activity"
              ? { backgroundColor: C.surface, color: C.primary, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }
              : { color: C.onSurfaceVariant }
          }
        >
          <ClipboardList size={13} />
          {isBn ? "কার্যক্রম লগ" : "Activity Log"}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB: GOVERNANCE AUDIT
          ══════════════════════════════════════════════════════ */}
      {tab === "audit" && (
        canAudit ? (
          <div>
            {/* Info note */}
            <div
              className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-xl text-xs"
              style={{ backgroundColor: C.surfaceContainer, color: C.onSurfaceVariant }}
            >
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              <span>
                {isBn
                  ? "গুরুত্বপূর্ণ গভর্ন্যান্স কার্যক্রম মাত্র। রুটিন অপারেশনাল অ্যাকশন কার্যক্রম লগ ট্যাবে দেখুন।"
                  : "Significant governance actions only. Routine operational entries are in the Activity Log tab."}
              </span>
            </div>

            {/* Category filter pills */}
            <div className="flex gap-1.5 mb-4 flex-wrap">
              {auditCats.map(c => {
                const count = c.k === "all" ? auditEntries.length : auditEntries.filter(e => e.cat === c.k).length;
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
              {auditFiltered.map((a, i) => {
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
                        <p className="text-[11px]" style={{ color: C.outline }}>{fmtDateTime(a.date)}</p>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                          style={{ backgroundColor: meta.color + "1a", color: meta.color }}
                        >
                          {isBn ? (auditCats.find(c => c.k === a.cat)?.l || a.cat) : a.cat}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {auditFiltered.length === 0 && (
                <Empty
                  icon={FileSearch}
                  title={isBn ? "কোনো অডিট রেকর্ড নেই" : "No audit entries"}
                  subtitle={isBn ? "এই শ্রেণিতে কোনো গুরুত্বপূর্ণ কার্যক্রম নেই।" : "No significant governance actions in this category."}
                />
              )}
            </Card>
          </div>
        ) : (
          <Empty
            icon={ShieldCheck}
            title={isBn ? "অনুমতি সংরক্ষিত" : "Restricted"}
            subtitle={isBn ? "অডিট লগ শুধুমাত্র স্থায়ী পরিষদ ও শীর্ষ নির্বাহীদের জন্য।" : "Audit access is limited to Standing Council and top-tier officers."}
          />
        )
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: ACTIVITY LOG (full, unfiltered)
          ══════════════════════════════════════════════════════ */}
      {tab === "activity" && (
        <Card className="p-2">
          {activityEntries.map((a, i) => (
            <div
              key={a.id}
              className="flex items-start gap-3 px-3 py-3"
              style={{ borderTop: i ? `1px solid ${C.outlineVariant}` : "none" }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: C.surfaceContainer }}
              >
                <Clock size={13} style={{ color: C.onSurfaceVariant }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">
                  <span className="font-bold">{a.actor}</span>{" "}
                  <span style={{ color: C.onSurfaceVariant }}>{a.action}</span>
                </p>
                <p className="text-[11px] mt-1" style={{ color: C.outline }}>
                  {fmtDateTime(a.date)}
                </p>
              </div>
            </div>
          ))}
          {activityEntries.length === 0 && (
            <Empty
              icon={ClipboardList}
              title={isBn ? "এখনো কোনো কার্যকলাপ নেই" : "No activity yet"}
              subtitle={isBn ? "সদস্যদের কার্যক্রম এখানে প্রদর্শিত হবে।" : "System actions will appear here chronologically."}
            />
          )}
        </Card>
      )}
    </div>
  );
}
