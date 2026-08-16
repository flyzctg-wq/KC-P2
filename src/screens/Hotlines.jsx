import React, { useState } from "react";
import { Plus, Phone, Trash2, PhoneCall, Siren } from "lucide-react";
import { Btn, Card, Field, inputCls, inputStyle, Modal, SectionTitle } from "../components/primitives";
import { C } from "../theme";
import { uid } from "../utils";

export default function Hotlines({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [form, setForm] = useState(false);
  const canManage = session.role === "admin" && (session.permissions?.canManageComplaints || session.post === "President");
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
      {groups.map(g => {
        const items = list.filter(c => c.category === g.key);
        if (!items.length) return null;
        return (
          <div key={g.key} className="mb-6">
            <h3 className="font-bold text-sm mb-2.5" style={{ color: C.onSurfaceVariant }}>{g.label}</h3>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {items.map(c => (
                <Card key={c.id} className="p-4 flex items-center gap-3">
                  <div style={{ backgroundColor: C.errorContainer }} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                    <PhoneCall size={16} style={{ color: C.error }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm truncate">{c.name}</p>
                    {c.role && <p className="text-[11px] truncate mb-0.5" style={{ color: C.onSurfaceVariant }}>{c.role}</p>}
                    <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="text-xs font-semibold" style={{ color: C.primary }}>
                      {c.phone}
                    </a>
                  </div>
                  {canManage && (
                    <button onClick={() => remove(c)} className="p-1.5 rounded-full shrink-0 hover:bg-red-50" style={{ color: C.error }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </Card>
              ))}
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
