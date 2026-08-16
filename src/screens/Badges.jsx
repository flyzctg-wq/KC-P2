import React, { useState } from "react";
import { Award } from "lucide-react";
import { Btn, Card, Badge, inputCls, inputStyle, Avatar, Modal, SectionTitle } from "../components/primitives";
import { C, BADGE_CATALOG, BADGE_ICONS } from "../theme";

export default function Badges({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [openBadge, setOpenBadge] = useState(null);
  const canAward = session.role === "admin" && session.permissions?.canManageMembers;
  const myBadges = BADGE_CATALOG.filter(b => (session.earnedBadges || []).includes(b.id));

  const badgeTranslations = {
    b_founder: { name: isBn ? "প্রতিষ্ঠাতা সদস্য ব্যাজ" : "Founding Member", desc: isBn ? "প্রতিষ্ঠাতা বছরে ক্লাব প্রতিষ্ঠায় অবদানকারী সদস্যদের প্রদান করা হয়।" : "Awarded to residents who established the club in its founding year." },
    b_treasurer: { name: isBn ? "আর্থিক তত্ত্বাবধায়ক" : "Financial Steward", desc: isBn ? "ক্লাবের তহবিল ব্যবস্থাপনায় অসাধারণ অবদানের স্বীকৃতি।" : "Recognizes exceptional service managing club finances." },
    b_volunteer: { name: isBn ? "কমিউনিটি চ্যাম্পিয়ন" : "Community Champion", desc: isBn ? "ক্লাব ইভেন্ট ও সমাজসেবায় অসাধারণ অবদানের স্বীকৃতি।" : "Given for outstanding volunteer contribution to events and drives." },
    b_donor: { name: isBn ? "উদার দাতা ব্যাজ" : "Generous Donor", desc: isBn ? "ক্লাব ফান্ডে উল্লেখযোগ্য অনুদানকারী সদস্যদের সম্মানিত করতে প্রদান করা হয়।" : "Awarded to members who've made significant donations to the club fund." },
    b_perfect: { name: isBn ? "শতভাগ উপস্থিতি" : "Perfect Attendance", desc: isBn ? "বার্ষিক সকল সাধারণ সভা ও এজিএম-এ উপস্থিত থাকার জন্য।" : "For attending every AGM and general meeting in a term." },
  };

  return (
    <div>
      <SectionTitle>{isBn ? "ব্যাজ ও সম্মাননা স্বীকৃতি" : "Badges & recognition"}</SectionTitle>
      {myBadges.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-2.5" style={{ color: C.onSurfaceVariant }}>
            {isBn ? "আপনার অর্জিত ব্যাজসমূহ" : "Your badges"}
          </h3>
          <div className="flex gap-2.5 flex-wrap">
            {myBadges.map(b => {
              const Icon = BADGE_ICONS[b.icon] || Award;
              const tr = badgeTranslations[b.id] || { name: b.name };
              return (
                <div key={b.id} className="flex items-center gap-2 px-3 py-2 rounded-full" style={{ backgroundColor: C.goldContainer }}>
                  <Icon size={14} style={{ color: C.gold }} />
                  <span className="text-xs font-bold" style={{ color: C.gold }}>{tr.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <h3 className="font-bold text-sm mb-2.5" style={{ color: C.onSurfaceVariant }}>
        {isBn ? "সকল সম্মাননা ব্যাজ তালিকা" : "All badges"}
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {BADGE_CATALOG.map(b => {
          const Icon = BADGE_ICONS[b.icon] || Award;
          const holders = db.users.filter(u => (u.earnedBadges || []).includes(b.id));
          const tr = badgeTranslations[b.id] || { name: b.name, desc: b.description };
          return (
            <Card key={b.id} className="p-4 cursor-pointer hover:border-primary transition-all" onClick={() => setOpenBadge(b)}>
              <div style={{ backgroundColor: C.goldContainer }} className="w-11 h-11 rounded-full flex items-center justify-center mb-3">
                <Icon size={20} style={{ color: C.gold }} />
              </div>
              <p className="font-bold text-sm">{tr.name}</p>
              <p className="text-xs mt-1 line-clamp-2" style={{ color: C.onSurfaceVariant }}>{tr.desc}</p>
              <p className="text-[11px] mt-2 font-semibold" style={{ color: C.outline }}>
                {holders.length} {isBn ? "জন সদস্য পেয়েছেন" : `member${holders.length !== 1 ? "s" : ""}`}
              </p>
            </Card>
          );
        })}
      </div>
      <Modal open={!!openBadge} onClose={() => setOpenBadge(null)} title={(badgeTranslations[openBadge?.id]?.name || openBadge?.name) || ""}>
        {openBadge && <BadgeDetail badge={openBadge} db={db} session={session} persist={persist} toast={toast} logActivity={logActivity} canAward={canAward} isBn={isBn} tr={badgeTranslations[openBadge?.id]} />}
      </Modal>
    </div>
  );
}

export function BadgeDetail({ badge, db, session, persist, toast, logActivity, canAward, isBn = false, tr = {} }) {
  const Icon = BADGE_ICONS[badge.icon] || Award;
  const holders = db.users.filter(u => (u.earnedBadges || []).includes(badge.id));
  const eligible = db.users.filter(u => u.status === "active" && !(u.earnedBadges || []).includes(badge.id));
  const [pick, setPick] = useState("");

  const award = () => {
    if (!pick) return;
    const target = db.users.find(u => u.id === pick);
    persist(d => logActivity({ ...d, users: d.users.map(u => u.id === pick ? { ...u, earnedBadges: [...(u.earnedBadges || []), badge.id] } : u) }, session.name, `Awarded "${badge.name}" to ${target.name}`));
    toast(isBn ? `${target.name}-কে ব্যাজ প্রদান করা হয়েছে।` : `Badge awarded to ${target.name}.`);
    setPick("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ backgroundColor: C.surfaceContainerLow }}>
        <div style={{ backgroundColor: C.goldContainer }} className="w-12 h-12 rounded-full flex items-center justify-center shrink-0">
          <Icon size={22} style={{ color: C.gold }} />
        </div>
        <div>
          <h4 className="font-bold text-sm">{tr.name || badge.name}</h4>
          <p className="text-xs" style={{ color: C.onSurfaceVariant }}>{tr.desc || badge.description}</p>
        </div>
      </div>

      <div>
        <h5 className="font-bold text-xs mb-2" style={{ color: C.onSurfaceVariant }}>
          {isBn ? `ব্যাজ অর্জনকারী সদস্য (${holders.length} জন)` : `Holders (${holders.length})`}
        </h5>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {holders.map(u => (
            <div key={u.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border" style={{ borderColor: C.outlineVariant }}>
              <Avatar name={u.name} size={18} />
              <span className="font-medium">{u.name}</span>
            </div>
          ))}
          {holders.length === 0 && <p className="text-xs italic" style={{ color: C.outline }}>{isBn ? "এখনো কাউকে এই ব্যাজ প্রদান করা হয়নি।" : "No holders yet."}</p>}
        </div>
      </div>

      {canAward && (
        <div className="pt-3 border-t space-y-3" style={{ borderColor: C.outlineVariant }}>
          <h5 className="font-bold text-xs" style={{ color: C.onSurfaceVariant }}>
            {isBn ? "সদস্যকে ব্যাজ প্রদান করুন" : "Award badge to member"}
          </h5>
          <div className="flex gap-2">
            <select style={inputStyle()} className={inputCls + " flex-1"} value={pick} onChange={e => setPick(e.target.value)}>
              <option value="">{isBn ? "সদস্য নির্বাচন করুন…" : "Select eligible member…"}</option>
              {eligible.map(u => <option key={u.id} value={u.id}>{u.name} (Unit {u.unit})</option>)}
            </select>
            <Btn disabled={!pick} onClick={award}>{isBn ? "প্রদান করুন" : "Award"}</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
