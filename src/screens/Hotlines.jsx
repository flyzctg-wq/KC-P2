import React, { useState } from "react";
import { Plus, Phone, Trash2, PhoneCall, Siren, MapPin, Copy, Check } from "lucide-react";
import { Btn, Card, Field, inputCls, inputStyle, Modal, SectionTitle } from "../components/primitives";
import CommunityMap from "../components/CommunityMap";
import { C } from "../theme";
import { cleanPhone, sanitizeUrl, uid } from "../utils";

export default function Hotlines({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [form, setForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const canManage = session.role === "admin" && (session.permissions?.canManageComplaints || session.post === "President");

  const copyNumber = (c) => {
    const raw = c.phone;
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(raw);
    }
    setCopiedId(c.id);
    toast(isBn ? `${c.name}-এর নম্বর কপি করা হয়েছে` : `Copied number for ${c.name}`);
    setTimeout(() => setCopiedId(null), 2000);
  };
  const groups = [
    { key: "Emergency Service", label: isBn ? "জরুরি জাতীয় ও নাগরিক সেবা" : "Emergency Service" },
    { key: "EC Lead", label: isBn ? "কার্যনির্বাহী পরিষদ নেতৃত্ব" : "EC Lead" },
    { key: "Block Lead", label: isBn ? "ব্লক ও ইউনিট সমন্বয়ক" : "Block Lead" },
  ];
  const list = db.emergencyContacts || [];

  const add = (name, role, phone, category) => {
    if (!name.trim() || !phone.trim()) return;
    persist(d => logActivity({ ...d, emergencyContacts: [...(d.emergencyContacts || []), { id: uid("ec"), name, role, phone, category }] }, session.name, `Added emergency contact: ${name}`));
    toast(isBn ? "জরুরি নম্বর যুক্ত করা হয়েছে।" : "Contact added.");
    setForm(false);
  };
  const remove = (c) => {
    persist(d => logActivity({ ...d, emergencyContacts: (d.emergencyContacts || []).filter(x => x.id !== c.id) }, session.name, `Removed emergency contact: ${c.name}`));
    toast(isBn ? "নম্বর মুছে ফেলা হয়েছে।" : "Contact removed.");
  };

  return (
    <div>
      <SectionTitle
        action={
          canManage && (
            <Btn size="sm" icon={Plus} onClick={() => setForm(true)}>
              {isBn ? "+ নম্বর যুক্ত করুন" : "+ Add contact"}
            </Btn>
          )
        }
      >
        {isBn ? "জরুরি হটলাইন ও গুরুত্বপূর্ণ নম্বর" : "Emergency hotlines"}
      </SectionTitle>
      <div className="mb-5 p-3.5 rounded-xl text-xs flex items-center gap-2" style={{ backgroundColor: C.errorContainer, color: C.onErrorContainer }}>
        <Siren size={16} /> {isBn ? "যেকোনো জীবন ও সম্পদের জরুরি বিপদে প্রথমে ৯৯৯-এ কল দিন — এরপর সংশ্লিষ্ট নির্বাহী কর্মকর্তাদের সাথে যোগাযোগ করুন।" : "In a life-threatening emergency, call 999 first — then notify an EC lead below."}
      </div>

      {/* Community Geographic Map & Navigation */}
      <div className="mb-6">
        <CommunityMap lang={lang} toast={toast} session={session} />
      </div>

      {groups.map(g => {
        const items = list.filter(c => c.category === g.key);
        if (!items.length) return null;
        return (
          <div key={g.key} className="mb-6">
            <h3 className="font-bold text-sm mb-2.5" style={{ color: C.onSurfaceVariant }}>{g.label}</h3>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {items.map(c => {
                const isCopied = copiedId === c.id;
                return (
                  <Card key={c.id} className="p-4 flex items-center gap-3">
                    <div style={{ backgroundColor: C.errorContainer }} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                      <PhoneCall size={16} style={{ color: C.error }} aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm truncate">{c.name}</p>
                      {c.role && <p className="text-[11px] truncate mb-0.5" style={{ color: C.onSurfaceVariant }}>{c.role}</p>}
                      <a
                        href={sanitizeUrl(`tel:${cleanPhone(c.phone)}`)}
                        aria-label={isBn ? `${c.name}-কে কল করুন: ${c.phone}` : `Call ${c.name} at ${c.phone}`}
                        className="text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded px-0.5"
                        style={{ color: C.primary }}
                      >
                        {c.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => copyNumber(c)}
                        aria-label={isCopied ? (isBn ? "নম্বর কপি করা হয়েছে" : "Number copied") : (isBn ? `${c.name}-এর নম্বর কপি করুন` : `Copy number for ${c.name}`)}
                        title={isCopied ? (isBn ? "কপি করা হয়েছে!" : "Copied!") : (isBn ? "নম্বর কপি করুন" : "Copy phone number")}
                        className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors"
                        style={{ color: isCopied ? C.primary : C.onSurfaceVariant }}
                      >
                        {isCopied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                      </button>
                      <a
                        href={sanitizeUrl(`tel:${cleanPhone(c.phone)}`)}
                        aria-label={isBn ? `${c.name}-কে ফোন করুন` : `Call ${c.name}`}
                        title={isBn ? `${c.name}-কে ফোন করুন` : `Call ${c.name}`}
                        className="p-1.5 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors"
                        style={{ color: C.primary }}
                      >
                        <Phone size={15} aria-hidden="true" />
                      </a>
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => remove(c)}
                          aria-label={isBn ? `${c.name}-এর নম্বর মুছে ফেলুন` : `Delete contact ${c.name}`}
                          title={isBn ? "নম্বর মুছে ফেলুন" : "Delete contact"}
                          className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-colors"
                          style={{ color: C.error }}
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
      <Modal open={form} onClose={() => setForm(false)} title={isBn ? "নতুন জরুরি নম্বর যুক্ত করুন" : "Add emergency contact"}>
        <HotlineForm onSubmit={add} isBn={isBn} />
      </Modal>
    </div>
  );
}

export function HotlineForm({ onSubmit, isBn = false }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("Block Lead");

  const cats = [
    { key: "Emergency Service", label: isBn ? "জরুরি জাতীয় সেবা" : "Emergency Service" },
    { key: "EC Lead", label: isBn ? "কার্যনির্বাহী পরিষদ নেতৃত্ব" : "EC Lead" },
    { key: "Block Lead", label: isBn ? "ব্লক / ইউনিট সমন্বয়ক" : "Block Lead" },
  ];

  return (
    <div className="space-y-4">
      <Field label={isBn ? "নাম / প্রতিষ্ঠানের নাম" : "Name / label"}>
        <input style={inputStyle()} className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder={isBn ? "উদাঃ বায়েজিদ থানা পুলিশ" : "e.g. Police station"} />
      </Field>
      <Field label={isBn ? "দায়িত্ব / ভূমিকা" : "Role"}>
        <input style={inputStyle()} className={inputCls} value={role} onChange={e => setRole(e.target.value)} placeholder={isBn ? "উদাঃ ডিউটি অফিসার" : "e.g. Officer in charge"} />
      </Field>
      <Field label={isBn ? "ফোন নম্বর" : "Phone"}>
        <input style={inputStyle()} className={inputCls} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+880 1XXX-XXXXXX" />
      </Field>
      <Field label={isBn ? "শ্রেণিবিভাগ" : "Category"}>
        <select style={inputStyle()} className={inputCls} value={category} onChange={e => setCategory(e.target.value)}>
          {cats.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </Field>
      <Btn full disabled={!name.trim() || !phone.trim()} onClick={() => onSubmit(name, role, phone, category)}>
        {isBn ? "নম্বর সংরক্ষণ করুন" : "Save contact"}
      </Btn>
    </div>
  );
}
