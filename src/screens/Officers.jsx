import React, { useState } from "react";
import { BadgeCheck, FileCheck2, UserPlus, Users, CheckCircle2, Shield } from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Empty, Modal, SectionTitle, Avatar } from "../components/primitives";
import { C, EC_CONSTITUTIONAL_STRUCTURE } from "../theme";
import { uid, nowISO, fmtDate } from "../utils";

export default function Officers({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [inductForm, setInductForm] = useState(null);
  const isTopTier = session.role === "admin" && (session.post === "President" || session.post === "General Secretary");
  const list = [...(db.inductions || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  const closedElections = db.elections.filter(e => e.status === "closed");

  // Get active officers from db.users
  const activeOfficers = db.users.filter(u => u.status === "active" && u.role === "admin" && u.post);

  const induct = (name, position, electionTitle) => {
    persist(d => logActivity({ ...d, inductions: [{ id: uid("ind"), name, position, date: nowISO(), electionTitle }, ...(d.inductions || [])] }, session.name, `Digitally inducted ${name} as ${position}`));
    toast(isBn ? `${name}-কে ${position} হিসেবে শপথ পাঠ করানো হয়েছে।` : `${name} inducted as ${position}.`);
    setInductForm(null);
  };

  const totalSeats = EC_CONSTITUTIONAL_STRUCTURE.reduce((acc, p) => acc + p.seats, 0); // 15
  const occupiedSeats = activeOfficers.length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <SectionTitle
          action={
            isTopTier && (
              <Btn size="sm" icon={UserPlus} onClick={() => setInductForm(true)}>
                {isBn ? "কর্মকর্তা শপথ ও প্রত্যয়ন" : "Induct officer"}
              </Btn>
            )
          }
        >
          {isBn ? "কার্যনির্বাহী পরিষদ কাঠামো (ধারা-১৪)" : "Executive Committee Roster (Article 14)"}
        </SectionTitle>
        <p className="text-xs -mt-3" style={{ color: C.onSurfaceVariant }}>
          {isBn
            ? `সংবিধানের ধারা-১৪ অনুসারে ১৫ সদস্যের পূর্ণাঙ্গ পদবিন্যাস · পূরণকৃত আসন: ${occupiedSeats}/${totalSeats}`
            : `15-Seat Executive Committee breakdown per Article 14 · Filled: ${occupiedSeats}/${totalSeats} seats`}
        </p>
      </div>

      {/* 15-Seat Constitutional Roster */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {EC_CONSTITUTIONAL_STRUCTURE.map((item, idx) => {
          // Find all users who hold this post
          const holders = activeOfficers.filter(u => u.post === item.key || u.post === item.titleBn);
          const isFilled = holders.length > 0;
          return (
            <Card
              key={item.id}
              className="p-4 border transition-all duration-200"
              style={{
                backgroundColor: isFilled ? C.surface : C.surfaceContainerLow,
                borderColor: isFilled ? C.primaryContainer : C.outlineVariant,
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    style={{ backgroundColor: isFilled ? C.primary : C.surfaceContainerHigh, color: isFilled ? "#fff" : C.onSurfaceVariant }}
                    className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                  >
                    {idx + 1}
                  </div>
                  <h4 className="font-bold text-sm leading-tight" style={{ color: C.onSurface }}>
                    {isBn ? item.titleBn : item.titleEn}
                  </h4>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0"
                  style={{
                    backgroundColor: isFilled ? C.secondaryContainer : C.surfaceContainerHigh,
                    color: isFilled ? C.onSecondaryContainer : C.outline,
                  }}
                >
                  {isBn ? `${item.seats} জন` : `${item.seats} ${item.seats === 1 ? "Seat" : "Seats"}`}
                </span>
              </div>

              {/* Holders list */}
              {isFilled ? (
                <div className="space-y-2 mt-2 pt-2 border-t" style={{ borderColor: C.outlineVariant }}>
                  {holders.map(u => (
                    <div key={u.id} className="flex items-center gap-2.5">
                      <Avatar name={u.name} size={30} />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs truncate">{u.name}</p>
                        <p className="text-[10px] truncate" style={{ color: C.onSurfaceVariant }}>
                          {isBn ? `ব্লক ${u.block}, ইউনিট ${u.unit}` : `Block ${u.block}, Unit ${u.unit}`}
                        </p>
                      </div>
                      <BadgeCheck size={16} className="shrink-0" style={{ color: C.primary }} />
                    </div>
                  ))}
                  {holders.length < item.seats && (
                    <p className="text-[11px] font-medium italic" style={{ color: C.outline }}>
                      {isBn ? `+ আরো ${item.seats - holders.length}টি আসন শূন্য` : `+ ${item.seats - holders.length} vacant seat(s)`}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-2 pt-2 border-t flex items-center gap-1.5 text-xs italic" style={{ borderColor: C.outlineVariant, color: C.outline }}>
                  <span>{isBn ? "আসন খালি (অনিযুক্ত)" : "Vacant (Not appointed)"}</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Sworn-in & Certified Inductions History */}
      <div className="mt-8 pt-4">
        <h3 className="font-bold text-base heading mb-3" style={{ color: C.onSurface }}>
          {isBn ? "ডিজিটাল শপথ ও সার্টিফিকেশন রেকর্ড" : "Digital Swearing-in & Certification Records"}
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {list.map(ind => (
            <Card key={ind.id} className="p-4 text-center" style={{ backgroundColor: C.surfaceContainerLow }}>
              <div style={{ backgroundColor: C.goldContainer }} className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <BadgeCheck size={22} style={{ color: C.gold }} />
              </div>
              <p className="font-extrabold heading text-sm">{ind.name}</p>
              <p className="text-xs font-semibold" style={{ color: C.primary }}>{ind.position}</p>
              <p className="text-[11px] mt-1.5" style={{ color: C.outline }}>
                {isBn ? `শপথ তারিখ: ${fmtDate(ind.date)}` : `Digitally sworn in: ${fmtDate(ind.date)}`}
              </p>
              {ind.electionTitle && (
                <p className="text-[11px] font-medium" style={{ color: C.onSurfaceVariant }}>
                  {isBn ? `নির্বাচন: ${ind.electionTitle}` : `via ${ind.electionTitle}`}
                </p>
              )}
              <div className="mt-3 pt-2.5 border-t flex items-center justify-center gap-1.5 text-[11px] font-semibold" style={{ borderColor: C.outlineVariant, color: C.onSurfaceVariant }}>
                <FileCheck2 size={13} /> {isBn ? "প্রত্যয়িত রেকর্ড (ধারা-১৭)" : "Certified Record (Article 17)"}
              </div>
            </Card>
          ))}
          {list.length === 0 && (
            <div className="col-span-full">
              <Empty icon={BadgeCheck} title={isBn ? "কোনো শপথ রেকর্ড নেই" : "No officers inducted yet"} subtitle={isBn ? "নির্বাচিত কর্মকর্তাদের শপথ সনদ এখানে প্রদর্শিত হবে।" : "Certified induction records will appear here."} />
            </div>
          )}
        </div>
      </div>

      <Modal open={!!inductForm} onClose={() => setInductForm(null)} title={isBn ? "ডিজিটাল শপথ ও প্রত্যয়ন" : "Digital Swearing-in"}>
        <InductForm elections={closedElections} onSubmit={induct} isBn={isBn} />
      </Modal>
    </div>
  );
}

export function InductForm({ elections, onSubmit, isBn = false }) {
  const [electionId, setElectionId] = useState("");
  const [name, setName] = useState("");
  const [position, setPosition] = useState(EC_CONSTITUTIONAL_STRUCTURE[0].key);
  const el = elections.find(e => e.id === electionId);

  return (
    <div className="space-y-4">
      <Field label={isBn ? "সম্পন্ন নির্বাচন (ঐচ্ছিক)" : "Certified election (optional)"}>
        <select style={inputStyle()} className={inputCls} value={electionId} onChange={e => setElectionId(e.target.value)}>
          <option value="">{isBn ? "— সরাসরি অন্তর্ভুক্তি —" : "— Manual Entry —"}</option>
          {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
      </Field>

      <Field label={isBn ? "কর্মকর্তার নাম" : "Officer Name"}>
        <input style={inputStyle()} className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder={isBn ? "নাম লিখুন…" : "Full name…"} />
      </Field>

      <Field label={isBn ? "সাংবিধানিক পদবী (ধারা-১৪)" : "Constitutional Post (Article 14)"}>
        <select style={inputStyle()} className={inputCls} value={position} onChange={e => setPosition(e.target.value)}>
          {EC_CONSTITUTIONAL_STRUCTURE.map(item => (
            <option key={item.id} value={item.key}>
              {isBn ? `${item.titleBn} (${item.seats} জন)` : `${item.titleEn} (${item.seats} seats)`}
            </option>
          ))}
        </select>
      </Field>

      <Btn full disabled={!name.trim() || !position.trim()} onClick={() => onSubmit(name, position, el?.title || "")}>
        {isBn ? "শপথ পাঠ ও প্রত্যয়ন সম্পন্ন করুন" : "Induct & certify"}
      </Btn>
    </div>
  );
}

