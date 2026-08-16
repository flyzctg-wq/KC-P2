import React, { useState } from "react";
import { Droplet } from "lucide-react";
import { Btn, Card, Badge, inputCls, inputStyle, Empty, SectionTitle } from "../components/primitives";
import { C } from "../theme";

export default function BloodBank({ session, db, persist, toast, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [filter, setFilter] = useState("All");
  const groups = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
  const donors = db.users.filter(u => u.status === "active" && u.bloodGroup && (filter === "All" || u.bloodGroup === filter));
  const mine = db.users.find(u => u.id === session.id);
  const [myGroup, setMyGroup] = useState(mine?.bloodGroup || "");
  const [myDonor, setMyDonor] = useState(!!mine?.donor);

  const saveMine = () => {
    persist(d => ({ ...d, users: d.users.map(u => u.id === session.id ? { ...u, bloodGroup: myGroup || null, donor: myDonor } : u) }));
    toast(isBn ? "রক্তব্যাংক তথ্য সংরক্ষিত হয়েছে।" : "Blood bank profile updated.");
  };

  return (
    <div>
      <SectionTitle>{isBn ? "রক্তব্যাংক ডিরেক্টরি" : "Blood bank directory"}</SectionTitle>
      <Card className="p-4 mb-5">
        <p className="text-xs font-semibold mb-3" style={{ color: C.onSurfaceVariant }}>{t.yourInfo || (isBn ? "আপনার তথ্য" : "Your info")}</p>
        <div className="flex flex-wrap items-center gap-3">
          <select style={inputStyle()} className={inputCls + " w-32"} value={myGroup} onChange={e => setMyGroup(e.target.value)}>
            <option value="">{t.notSet || (isBn ? "নির্ধারিত নয়" : "Not set")}</option>
            {groups.map(g => <option key={g}>{g}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input type="checkbox" checked={myDonor} onChange={e => setMyDonor(e.target.checked)} className="rounded" />
            {t.availableToDonate || (isBn ? "রক্তদানে আগ্রহী" : "Available to donate")}
          </label>
          <Btn size="sm" onClick={saveMine}>{t.save || (isBn ? "সংরক্ষণ" : "Save")}</Btn>
        </div>
      </Card>
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {["All", ...groups].map(g => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors"
            style={g === filter ? { backgroundColor: C.error, color: "#fff" } : { backgroundColor: C.surfaceContainer, color: C.onSurfaceVariant }}
          >
            {g === "All" ? (t.all || (isBn ? "সকল" : "All")) : g}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {donors.map(u => (
          <Card key={u.id} className="p-4 flex items-center gap-3">
            <div style={{ backgroundColor: C.errorContainer, color: C.error }} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-extrabold text-xs">
              {u.bloodGroup}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm truncate">{u.name}</p>
              <p className="text-xs truncate" style={{ color: C.onSurfaceVariant }}>
                {t.block || (isBn ? "ব্লক" : "Block")} {u.block} · {u.unit}
              </p>
            </div>
            {u.donor ? (
              <a href={`tel:${(u.phone || "").replace(/\s/g, "")}`}>
                <Badge tone="success">{t.donor || (isBn ? "রক্তদাতা" : "Donor")}</Badge>
              </a>
            ) : (
              <Badge tone="neutral">{t.listed || (isBn ? "তালিকাভুক্ত" : "Listed")}</Badge>
            )}
          </Card>
        ))}
        {donors.length === 0 && (
          <div className="col-span-full">
            <Empty
              icon={Droplet}
              title={isBn ? "কোনো সদস্য তালিকাভুক্ত নেই" : "No members listed"}
              subtitle={isBn ? "উপরে আপনার রক্তের গ্রুপ নির্ধারণ করুন।" : "Set your blood group above to appear here."}
            />
          </div>
        )}
      </div>
    </div>
  );
}

