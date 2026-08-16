import React, { useState } from "react";
import { LifeBuoy, Plus } from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Empty, Modal, SectionTitle } from "../components/primitives";
import { C } from "../theme";
import { uid, nowISO, fmtDate } from "../utils";

export default function Tickets({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [form, setForm] = useState(null);
  const mine = db.tickets.filter(t => t.residentId === session.id).sort((a, b) => new Date(b.date) - new Date(a.date));

  const submit = (subject, category, description) => {
    if (!subject.trim() || !description.trim()) return;
    persist(d => logActivity({ ...d, tickets: [...d.tickets, { id: uid("tk"), residentId: session.id, residentName: session.name, subject, category, description, status: "open", response: "", date: nowISO() }] }, session.name, `Submitted support ticket: ${subject}`));
    toast(isBn ? "টিকিট সফলভাবে জমা হয়েছে।" : "Ticket submitted.");
    setForm(null);
  };

  const statusMap = {
    open: isBn ? "উন্মুক্ত" : "Open",
    in_progress: isBn ? "প্রক্রিয়াধীন" : "In Progress",
    resolved: isBn ? "সমাধানকৃত" : "Resolved",
  };

  const categoryMap = {
    Maintenance: isBn ? "রক্ষণাবেক্ষণ" : "Maintenance",
    Security: isBn ? "নিরাপত্তা" : "Security",
    Billing: isBn ? "বিলিং / চাঁদা" : "Billing",
    Noise: isBn ? "শব্দ দূষণ" : "Noise",
    Other: isBn ? "অন্যান্য" : "Other",
  };

  return (
    <div>
      <SectionTitle action={<Btn size="sm" icon={Plus} onClick={() => setForm(true)}>{isBn ? "নতুন টিকিট" : "New ticket"}</Btn>}>
        {isBn ? "সহায়তা ও অভিযোগ টিকিট" : "Support tickets"}
      </SectionTitle>
      <div className="flex flex-col gap-2.5">
        {mine.map(tk => (
          <Card key={tk.id} className="p-4">
            <div className="flex items-center justify-between mb-1.5">
              <p className="font-bold text-sm">{tk.subject}</p>
              <Badge tone={tk.status === "resolved" ? "success" : tk.status === "in_progress" ? "warning" : "neutral"}>
                {statusMap[tk.status] || tk.status}
              </Badge>
            </div>
            <p className="text-xs mb-1" style={{ color: C.onSurfaceVariant }}>{tk.description}</p>
            <p className="text-[11px]" style={{ color: C.outline }}>
              {categoryMap[tk.category] || tk.category} · {fmtDate(tk.date)}
            </p>
            {tk.response && (
              <div className="mt-2 p-2.5 rounded-lg text-xs" style={{ backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer }}>
                <span className="font-bold">{isBn ? "কমিটির প্রতিক্রিয়া: " : "Committee response: "}</span>
                {tk.response}
              </div>
            )}
          </Card>
        ))}
        {mine.length === 0 && (
          <Empty
            icon={LifeBuoy}
            title={isBn ? "এখনো কোনো টিকিট নেই" : "No tickets yet"}
            subtitle={isBn ? "যেকোনো সমস্যা বা অভিযোগ জানান, কার্যনির্বাহী পরিষদ দ্রুত উত্তর দেবে।" : "Raise an issue and the committee will respond here."}
          />
        )}
      </div>
      <Modal open={!!form} onClose={() => setForm(null)} title={isBn ? "নতুন সহায়তা টিকিট জমা দিন" : "Submit a support ticket"}>
        <TicketForm onSubmit={submit} lang={lang} isBn={isBn} />
      </Modal>
    </div>
  );
}

export function TicketForm({ onSubmit, lang = "en", isBn = false }) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Maintenance");
  const [description, setDescription] = useState("");

  const categories = [
    { key: "Maintenance", label: isBn ? "রক্ষণাবেক্ষণ" : "Maintenance" },
    { key: "Security", label: isBn ? "নিরাপত্তা" : "Security" },
    { key: "Billing", label: isBn ? "বিলিং / চাঁদা" : "Billing" },
    { key: "Noise", label: isBn ? "শব্দ দূষণ" : "Noise" },
    { key: "Other", label: isBn ? "অন্যান্য" : "Other" },
  ];

  return (
    <div>
      <Field label={isBn ? "বিষয়" : "Subject"}>
        <input
          style={inputStyle()}
          className={inputCls}
          placeholder={isBn ? "যেমন: পানির লাইনের সমস্যা" : "e.g. Water line issue"}
          value={subject}
          onChange={e => setSubject(e.target.value)}
        />
      </Field>
      <Field label={isBn ? "ক্যাটাগরি" : "Category"}>
        <select style={inputStyle()} className={inputCls} value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(c => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
      </Field>
      <Field label={isBn ? "বিস্তারিত বিবরণ" : "Description"}>
        <textarea
          style={inputStyle()}
          className={inputCls}
          rows={4}
          placeholder={isBn ? "সমস্যার বিস্তারিত বিবরণ দিন..." : "Describe the issue in detail..."}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </Field>
      <Btn full onClick={() => onSubmit(subject, category, description)}>
        {isBn ? "টিকিট জমা দিন" : "Submit ticket"}
      </Btn>
    </div>
  );
}
