import React from "react";
import { Vote, LifeBuoy, TrendingUp, UserCheck, FileText } from "lucide-react";
import { Card, SectionTitle, StatMini } from "../../components/primitives";
import CommunityMap from "../../components/CommunityMap";
import { C, MEMBER_CLASSES } from "../../theme";
import { currency, monthLabel, currentMonthYM } from "../../utils";

export default function AdminDashboard({ session, db, go, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const pendingMembers = db.users.filter(u => u.status === "pending").length;
  const collected = db.dues.filter(d => d.status === "paid").reduce((s, d) => s + d.amount, 0);
  const outstanding = db.dues.filter(d => d.status !== "paid").reduce((s, d) => s + d.amount, 0);
  const openTickets = db.tickets.filter(t => t.status !== "resolved").length;
  const activeElections = db.elections.filter(e => e.status === "active").length;
  const totalVotes = db.votes.length;
  const collectionRate = Math.round((collected / Math.max(1, collected + outstanding)) * 100);

  const memberClassLabels = {
    New: isBn ? "নতুন" : "New",
    General: isBn ? "সাধারণ" : "General",
    Founding: isBn ? "প্রতিষ্ঠাতা" : "Founding",
    Advisory: isBn ? "উপদেষ্টা" : "Advisory",
    Life: isBn ? "আজীবন" : "Life",
    Donor: isBn ? "দাতা" : "Donor",
  };

  return (
    <div>
      <SectionTitle>{isBn ? "অ্যাডমিন ড্যাশবোর্ড" : "Admin dashboard"}</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatMini icon={UserCheck} label={isBn ? "অপেক্ষমাণ অনুমোদন" : "Pending approvals"} value={pendingMembers} tone={pendingMembers ? "warning" : "success"} onClick={() => go("a-members")} />
        <StatMini icon={LifeBuoy} label={isBn ? "উন্মুক্ত টিকিট" : "Open tickets"} value={openTickets} tone={openTickets ? "warning" : "success"} onClick={() => go("a-tickets")} />
        <StatMini icon={Vote} label={isBn ? "সক্রিয় নির্বাচন" : "Active elections"} value={activeElections} tone="info" onClick={() => go("a-elections")} />
        <StatMini icon={TrendingUp} label={isBn ? "মোট প্রদত্ত ভোট" : "Total votes cast"} value={totalVotes} tone="neutral" onClick={() => go("a-elections")} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <p className="text-xs font-semibold mb-1" style={{ color: C.onSurfaceVariant }}>
            {isBn ? "চাঁদা আদায় দক্ষতা" : "Collection efficiency"} ({monthLabel(currentMonthYM())})
          </p>
          <p className="text-3xl font-extrabold heading mb-3">{collectionRate}%</p>
          <div className="h-2.5 rounded-full overflow-hidden mb-3" style={{ backgroundColor: C.surfaceContainerHigh }}>
            <div className="h-full rounded-full" style={{ width: `${collectionRate}%`, backgroundColor: C.primary }} />
          </div>
          <div className="flex justify-between text-xs font-medium">
            <span style={{ color: C.onSurfaceVariant }}>{isBn ? "আদায়কৃত: " : "Collected "} {currency(collected)}</span>
            <span style={{ color: C.error }}>{isBn ? "বকেয়া: " : "Outstanding "} {currency(outstanding)}</span>
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold mb-3" style={{ color: C.onSurfaceVariant }}>
            {isBn ? "সদস্য শ্রেণি বিন্যাস" : "Member composition"}
          </p>
          <div className="flex flex-col gap-2">
            {MEMBER_CLASSES.map(mc => {
              const count = db.users.filter(u => u.memberClass === mc && u.status === "active").length;
              const max = Math.max(1, db.users.filter(u => u.status === "active").length);
              return (
                <div key={mc} className="flex items-center gap-2 text-xs">
                  <span className="w-20 font-semibold shrink-0">{memberClassLabels[mc] || mc}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.surfaceContainerHigh }}>
                    <div className="h-full rounded-full" style={{ width: `${(count / max) * 100}%`, backgroundColor: C.secondary }} />
                  </div>
                  <span className="w-6 text-right font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Official Letterhead Suite Quick Banner */}
      <div
        onClick={() => go("a-letters")}
        className="mt-4 p-4 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all group"
        style={{ backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 text-white flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform">
            <FileText size={22} />
          </div>
          <div>
            <h3 className="font-black text-sm text-gray-900 heading">
              {isBn ? "অফিসিয়াল লেটারহেড প্যাডে পত্র ও নোটিশ ইস্যু" : "Official Letterhead & Notice Issuance"}
            </h3>
            <p className="text-xs text-gray-500">
              {isBn ? "স্মারক নং নির্ধারণ, স্বয়ংক্রিয় প্যাড প্রিভিউ, পিডিএফ ডাউনলোড ও সরাসরি হোয়াটসঅ্যাপে প্রেরণ" : "Compose official letters on branded letterhead, export PDF & send to WhatsApp"}
            </p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-slate-800 group-hover:bg-slate-900 shrink-0">
          {isBn ? "পত্র লিখুন" : "Open Suite"} →
        </span>
      </div>

      {/* Community Geographic Map */}
      <div className="mt-4">
        <CommunityMap lang={lang} />
      </div>
    </div>
  );
}
