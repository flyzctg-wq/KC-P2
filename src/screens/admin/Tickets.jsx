import React, { useState } from "react";
import { Shield, Send } from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Avatar, Modal, SectionTitle } from "../../components/primitives";
import { C } from "../../theme";
import { fmtDate } from "../../utils";

export default function AdminTickets({ session, db, persist, toast, logActivity }) {
  const canManage = session.permissions.canManageComplaints;
  const [respondTo, setRespondTo] = useState(null);
  const sorted = [...db.tickets].sort((a, b) => new Date(b.date) - new Date(a.date));

  const respond = (t, response, status) => {
    persist(d => logActivity({ ...d, tickets: d.tickets.map(x => x.id === t.id ? { ...x, response, status } : x) }, session.name, `Responded to ticket: ${t.subject}`));
    toast("Response sent.");
    setRespondTo(null);
  };

  return (
    <div>
      <SectionTitle>Support tickets</SectionTitle>
      {!canManage && <div className="mb-4 p-3 rounded-xl text-xs flex items-center gap-2" style={{ backgroundColor: C.errorContainer, color: C.onErrorContainer }}><Shield size={14} /> View-only — you lack canManageComplaints permission.</div>}
      <div className="flex flex-col gap-2.5">
        {sorted.map(t => (
          <Card key={t.id} className="p-4">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2"><Avatar name={t.residentName} size={26} /><p className="font-bold text-sm">{t.subject}</p></div>
              <Badge tone={t.status === "resolved" ? "success" : t.status === "in_progress" ? "warning" : "neutral"}>{t.status.replace("_", " ")}</Badge>
            </div>
            <p className="text-xs mb-1" style={{ color: C.onSurfaceVariant }}>{t.description}</p>
            <p className="text-[11px] mb-2" style={{ color: C.outline }}>{t.residentName} · {t.category} · {fmtDate(t.date)}</p>
            {t.response && <div className="p-2.5 rounded-lg text-xs mb-2" style={{ backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer }}>{t.response}</div>}
            {canManage && t.status !== "resolved" && <Btn size="sm" variant="outline" onClick={() => setRespondTo(t)}>Respond</Btn>}
          </Card>
        ))}
      </div>
      <Modal open={!!respondTo} onClose={() => setRespondTo(null)} title="Respond to ticket">
        {respondTo && <RespondForm ticket={respondTo} onSubmit={respond} />}
      </Modal>
    </div>
  );
}

export function RespondForm({ ticket, onSubmit }) {
  const [text, setText] = useState(""); const [status, setStatus] = useState("in_progress");
  return (
    <div>
      <Field label="Status"><select style={inputStyle()} className={inputCls} value={status} onChange={e => setStatus(e.target.value)}><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select></Field>
      <Field label="Response"><textarea style={inputStyle()} className={inputCls} rows={4} value={text} onChange={e => setText(e.target.value)} /></Field>
      <Btn full onClick={() => onSubmit(ticket, text, status)} disabled={!text.trim()}>Send response</Btn>
    </div>
  );
}
