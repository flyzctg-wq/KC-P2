import React, { useState } from "react";
import { Droplet, Phone, MessageCircle, Mail, HeartHandshake, Search } from "lucide-react";
import { Btn, Card, Badge, inputCls, inputStyle, Empty, SectionTitle } from "../components/primitives";
import { C } from "../theme";
import { cleanPhone } from "../utils";

export default function BloodBank({ session, db, persist, toast, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [filter, setFilter] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const groups = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

  const query = searchQ.trim().toLowerCase();
  const donors = (db.users || []).filter(u => {
    const isActive = u.status === "active";
    const hasBloodGroup = !!u.bloodGroup;
    const matchesFilter = filter === "All" || u.bloodGroup === filter;
    const matchesSearch = !query ||
      (u.name || "").toLowerCase().includes(query) ||
      (u.unit || "").toLowerCase().includes(query) ||
      (u.block || "").toLowerCase().includes(query) ||
      (u.phone || "").toLowerCase().includes(query) ||
      (u.bloodGroup || "").toLowerCase().includes(query);

    return isActive && hasBloodGroup && matchesFilter && matchesSearch;
  });

  const mine = (db.users || []).find(u => u.id === session.id);
  const [myGroup, setMyGroup] = useState(mine?.bloodGroup || "");
  const [myDonor, setMyDonor] = useState(!!mine?.donor);

  const saveMine = () => {
    persist(d => ({ ...d, users: (d.users || []).map(u => u.id === session.id ? { ...u, bloodGroup: myGroup || null, donor: myDonor } : u) }));
    toast(isBn ? "ব্লাড ব্যাংক তথ্য সফলভাবে সংরক্ষিত হয়েছে।" : "Blood bank profile updated.");
  };

  return (
    <div className="space-y-5">
      <SectionTitle>{isBn ? "ব্লাড ব্যাংক ও রক্তদাতা ডিরেক্টরি" : "Blood Bank & Donor Directory"}</SectionTitle>

      {/* User's own blood group configuration banner */}
      <Card className="p-4.5 border" style={{ borderColor: C.outlineVariant }}>
        <div className="flex items-center gap-2 mb-3">
          <HeartHandshake size={18} style={{ color: C.error }} />
          <p className="text-xs font-extrabold uppercase tracking-wide" style={{ color: C.onSurface }}>
            {t.yourInfo || (isBn ? "আপনার রক্তের গ্রুপ ও সম্মতি" : "Your Blood Group & Consent")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select style={inputStyle()} className={inputCls + " w-36"} value={myGroup} onChange={e => setMyGroup(e.target.value)}>
            <option value="">{t.notSet || (isBn ? "-- গ্রুপ নির্বাচন --" : "Not set")}</option>
            {groups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
            <input type="checkbox" checked={myDonor} onChange={e => setMyDonor(e.target.checked)} className="rounded" />
            <span style={{ color: C.onSurface }}>
              {t.availableToDonate || (isBn ? "রক্তদানে প্রস্তুত ও আগ্রহী (Active Donor)" : "Available to donate")}
            </span>
          </label>
          <Btn size="sm" onClick={saveMine}>{t.save || (isBn ? "সংরক্ষণ" : "Save")}</Btn>
        </div>
      </Card>

      {/* Search & Filter pills */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.outline }} />
          <input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder={isBn ? "রক্তের গ্রুপ, নাম বা ইউনিট দিয়ে খুঁজুন…" : "Search blood group, name, or unit…"}
            style={inputStyle()}
            className={inputCls + " pl-9"}
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 flex-nowrap sm:flex-wrap">
          {["All", ...groups].map(g => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors"
              style={g === filter ? { backgroundColor: C.error, color: "#fff" } : { backgroundColor: C.surfaceContainer, color: C.onSurfaceVariant }}
            >
              {g === "All" ? (t.all || (isBn ? "সকল গ্রুপ" : "All")) : g}
            </button>
          ))}
        </div>
      </div>

      {/* Donors Grid */}
      <div className="grid sm:grid-cols-2 gap-3">
        {donors.map(u => {
          const phoneFormatted = cleanPhone(u.phone);
          const isAvailableDonor = !!u.donor;
          const waMessage = isBn
            ? `আসসালামু আলাইকুম ${u.name} ভাই/আপু, কুঞ্জছায়া ক্লাব থেকে জরুরি রক্তের প্রয়োজনে আপনার সাথে যোগাযোগ করছি (গ্রুপ: ${u.bloodGroup})।`
            : `Hello ${u.name}, contacting you from Kunjachaya Club regarding blood requirement (Group: ${u.bloodGroup}).`;

          return (
            <Card
              key={u.id}
              className="p-4 flex flex-col justify-between gap-3 border hover:shadow-md transition-shadow"
              style={{ borderColor: C.outlineVariant }}
            >
              <div className="flex items-center gap-3">
                <div
                  style={{ backgroundColor: C.errorContainer, color: C.error }}
                  className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 font-extrabold text-sm shadow-sm"
                >
                  <Droplet size={14} className="mb-0.5" />
                  <span>{u.bloodGroup}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-extrabold text-sm truncate">{u.name}</p>
                    {isAvailableDonor ? (
                      <Badge tone="success">{isBn ? "রক্তদাতা" : "Active Donor"}</Badge>
                    ) : (
                      <Badge tone="neutral">{isBn ? "তালিকাভুক্ত" : "Listed"}</Badge>
                    )}
                  </div>

                  <p className="text-xs mt-0.5" style={{ color: C.onSurfaceVariant }}>
                    {isBn ? "ব্লক" : "Block"} <span className="font-semibold">{u.block}</span> · {isBn ? "ইউনিট" : "Unit"} <span className="font-semibold">{u.unit}</span>
                  </p>

                  <p className="text-xs font-semibold mt-0.5" style={{ color: C.primary }}>
                    {u.phone || (isBn ? "মোবাইল নম্বর নেই" : "No phone")}
                  </p>
                </div>
              </div>

              {/* Direct Call & WhatsApp Action Buttons */}
              <div className="pt-2.5 border-t flex items-center gap-2" style={{ borderColor: C.outlineVariant }}>
                {u.phone ? (
                  <>
                    <a
                      href={`tel:${phoneFormatted}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-colors"
                      style={{ backgroundColor: C.primary, color: "#fff" }}
                      title={isBn ? "সরাসরি ফোন কল করুন" : "Direct Phone Call"}
                    >
                      <Phone size={14} /> {isBn ? "সরাসরি কল" : "Call"}
                    </a>

                    <a
                      href={`https://wa.me/${phoneFormatted}?text=${encodeURIComponent(waMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                      title={isBn ? "হোয়াটসঅ্যাপে চ্যাট করুন" : "WhatsApp Chat"}
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  </>
                ) : (
                  <a
                    href={`mailto:${u.email}?subject=${encodeURIComponent(`Kunjachaya Club - Blood Requirement (${u.bloodGroup})`)}&body=${encodeURIComponent(waMessage)}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors"
                  >
                    <Mail size={14} /> {isBn ? "ইমেইল পাঠান" : "Send Email"}
                  </a>
                )}
              </div>
            </Card>
          );
        })}

        {donors.length === 0 && (
          <div className="col-span-full">
            <Empty
              icon={Droplet}
              title={isBn ? "কোনো রক্তদাতা পাওয়া যায়নি" : "No blood donors found"}
              subtitle={isBn ? "ভিন্ন রক্তের গ্রুপ ফিল্টার নির্বাচন করুন অথবা উপরে আপনার রক্তের গ্রুপ যুক্ত করুন।" : "Try a different blood group filter or register your blood group above."}
            />
          </div>
        )}
      </div>
    </div>
  );
}

