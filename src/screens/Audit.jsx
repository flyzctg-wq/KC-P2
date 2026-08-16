import React, { useState } from "react";
import { FileSearch, ShieldCheck, FileDown } from "lucide-react";
import { Btn, Card, Empty, SectionTitle } from "../components/primitives";
import { C } from "../theme";
import { fmtDateTime, currentMonthYM } from "../utils";

export default function Audit({ session, db, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [cat, setCat] = useState("all");
  const isCouncil = !!session.standingCouncil;
  const isTopTier = session.role === "admin" && (session.post === "President" || session.post === "General Secretary");
  const canViewFinancial = session.role === "admin" && session.permissions?.canManageFinancials;
  const allowed = isCouncil || isTopTier || canViewFinancial;

  const categorize = (action) => {
    const a = action.toLowerCase();
    if (a.includes("paid") || a.includes("dues") || a.includes("budget") || a.includes("টাকা") || a.includes("চাঁদা")) return "financial";
    if (a.includes("vote") || a.includes("election") || a.includes("certified") || a.includes("ভোট") || a.includes("নির্বাচন")) return "election";
    if (a.includes("member") || a.includes("approved") || a.includes("rejected") || a.includes("role") || a.includes("সদস্য")) return "membership";
    return "other";
  };
  const entries = (db.activity || []).map(a => ({ ...a, cat: categorize(a.action) })).sort((a, b) => new Date(b.date) - new Date(a.date));
  const filtered = cat === "all" ? entries : entries.filter(e => e.cat === cat);
  const cats = [
    { k: "all", l: isBn ? "সকল" : "All" },
    { k: "financial", l: isBn ? "আর্থিক" : "Financial" },
    { k: "election", l: isBn ? "নির্বাচন" : "Election" },
    { k: "membership", l: isBn ? "সদস্যপদ" : "Membership" },
    { k: "other", l: isBn ? "অন্যান্য" : "Other" },
  ];

  const exportCSV = () => {
    const rows = [["Date", "Actor", "Category", "Action"], ...filtered.map(e => [fmtDateTime(e.date), e.actor, e.cat, e.action.replace(/,/g, ";")])];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `kunjachaya_audit_${cat}_${currentMonthYM()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (!allowed) {
    return (
      <div>
        <SectionTitle>{isBn ? "অডিট ও নিরাপত্তা লগ" : "Audit log"}</SectionTitle>
        <Empty
          icon={ShieldCheck}
          title={isBn ? "অনুমতি সংরক্ষিত" : "Restricted"}
          subtitle={isBn ? "অডিট লগ শুধুমাত্র স্থায়ী পরিষদ সদস্য এবং শীর্ষ নির্বাহীদের জন্য উন্মুক্ত।" : "Audit access is limited to Standing Council members and top-tier committee officers."}
        />
      </div>
    );
  }

  return (
    <div>
      <SectionTitle action={<Btn size="sm" icon={FileDown} onClick={exportCSV}>{isBn ? "সিএসভি ডাউনলোড" : "Export CSV"}</Btn>}>
        {isBn ? "অডিট ও নিরাপত্তা লগ (ধারা-২৬)" : "Audit log"}
      </SectionTitle>
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {cats.map(c => (
          <button
            key={c.k}
            onClick={() => setCat(c.k)}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors"
            style={c.k === cat ? { backgroundColor: C.primary, color: "#fff" } : { backgroundColor: C.surfaceContainer, color: C.onSurfaceVariant }}
          >
            {c.l}
          </button>
        ))}
      </div>
      <Card className="p-2">
        {filtered.map((a, i) => (
          <div key={a.id} className="flex items-start gap-3 px-3 py-3" style={{ borderTop: i ? `1px solid ${C.outlineVariant}` : "none" }}>
            <div style={{ backgroundColor: C.surfaceContainer }} className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <FileSearch size={13} style={{ color: C.onSurfaceVariant }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-bold">{a.actor}</span> <span style={{ color: C.onSurfaceVariant }}>{a.action}</span>
              </p>
              <p className="text-[11px]" style={{ color: C.outline }}>
                {fmtDateTime(a.date)} · {isBn ? (cats.find(c => c.k === a.cat)?.l || a.cat) : a.cat}
              </p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <Empty
            icon={FileSearch}
            title={isBn ? "কোনো অডিট রেকর্ড পাওয়া যায়নি" : "No matching audit entries"}
          />
        )}
      </Card>
    </div>
  );
}

