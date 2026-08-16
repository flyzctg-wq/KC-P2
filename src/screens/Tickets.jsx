import React, { useState } from "react";
import { LifeBuoy, Plus } from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Empty, Modal, SectionTitle } from "../components/primitives";
import { C } from "../theme";
import { uid, nowISO, fmtDate } from "../utils";

export default function Tickets({ session, db, persist, toast, logActivity }) {
  const [form, setForm] = useState(null);
  const mine = db.tickets.filter(t => t.residentId === session.id).sort((a, b) => new Date(b.date) - new Date(a.date));

  const submit = (subject, category, description) => {
    if (!subject.trim() || !description.trim()) return;
    persist(d => logActivity({ ...d, tickets: [...d.tickets, { id: uid("tk"), residentId: session.id, residentName: session.name, subject, category, description, status: "open", response: "", date: nowISO() }] }, session.name, `Submitted support ticket: ${subject}`));
    toast("Ticket submitted.");
    setForm(null);
  };

  return (
    <div>
      <SectionTitle action={<Btn size="sm" icon={Plus} onClick={() => setForm(true)}>New ticket</Btn>}>Support tickets</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {mine.map(t => (
          <Card key={t.id} className="p-4">
            <div className="flex items-center justify-between mb-1.5">
              <p className="font-bold text-sm">{t.subject}</p>
              <Badge tone={t.status === "resolved" ? "success" : t.status === "in_progress" ? "warning" : "neutral"}>{t.status.replace("_", " ")}</Badge>
            </div>
            <p className="text-xs mb-1" style={{ color: C.onSurfaceVariant }}>{t.description}</p>
            <p className="text-[11px]" style={{ color: C.outline }}>{t.category} · {fmtDate(t.date)}</p>
            {t.response && <div className="mt-2 p-2.5 rounded-lg text-xs" style={{ backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer }}><span className="font-bold">Committee response: </span>{t.response}</div>}
          </Card>
        ))}
        {mine.length === 0 && <Empty icon={LifeBuoy} title="No tickets yet" subtitle="Raise an issue and the committee will respond here." />}
      </div>
      <Modal open={!!form} onClose={() => setForm(null)} title="Submit a support ticket">
        <TicketForm onSubmit={submit} />
      </Modal>
    </div>
  );
}

export function TicketForm({ onSubmit }) {
  const [subject, setSubject] = useState(""); const [category, setCategory] = useState("Maintenance"); const [description, setDescription] = useState("");
  return (
    <div>
      <Field label="Subject"><input style={inputStyle()} className={inputCls} value={subject} onChange={e => setSubject(e.target.value)} /></Field>
      <Field label="Category"><select style={inputStyle()} className={inputCls} value={category} onChange={e => setCategory(e.target.value)}>{["Maintenance", "Security", "Billing", "Noise", "Other"].map(c => <option key={c}>{c}</option>)}</select></Field>
      <Field label="Description"><textarea style={inputStyle()} className={inputCls} rows={4} value={description} onChange={e => setDescription(e.target.value)} /></Field>
      <Btn full onClick={() => onSubmit(subject, category, description)}>Submit ticket</Btn>
    </div>
  );
}
