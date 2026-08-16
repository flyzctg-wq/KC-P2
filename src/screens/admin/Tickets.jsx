import React, { useState } from "react";
import { Shield, Send } from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Avatar, Modal, SectionTitle } from "../../components/primitives";
import { C } from "../../theme";
import { fmtDate } from "../../utils";

export default function AdminTickets({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const canManage = session.permissions.canManageComplaints;
  const [respondTo, setRespondTo] = useState(null);
  const sorted = [...db.tickets].sort((a, b) => new Date(b.date) - new Date(a.date));

  const respond = (tk, response, status) => {
    persist(d => logActivity({ ...d, tickets: d.tickets.map(x => x.id === tk.id ? { ...x, response, status } : x) }, session.name, `Responded to ticket: ${tk.subject}`));
    toast(isBn ? "প্রতিক্রিয়া সফলভাবে পাঠানো হয়েছে।" : "Response sent.");
    setRespondTo(null);
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
      <SectionTitle>{isBn ? "সদস্য অভিযোগ ও সহায়তা টিকিট" : "Support tickets"}</SectionTitle>
      {!canManage && (
        <div className="mb-4 p-3 rounded-xl text-xs flex items-center gap-2" style={{ backgroundColor: C.errorContainer, color: C.onErrorContainer }}>
          <Shield size={14} /> {isBn ? "শুধুমাত্র প্রদর্শন — আপনার canManageComplaints অনুমতি নেই।" : "View-only — you lack canManageComplaints permission."}
        </div>
      )}
      <div className="flex flex-col gap-2.5">
        {sorted.map(tk => (
          <Card key={tk.id} className="p-4">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Avatar name={tk.residentName} size={26} />
                <p className="font-bold text-sm">{tk.subject}</p>
              </div>
              <Badge tone={tk.status === "resolved" ? "success" : tk.status === "in_progress" ? "warning" : "neutral"}>
                {statusMap[tk.status] || tk.status}
              </Badge>
            </div>
            <p className="text-xs mb-1" style={{ color: C.onSurfaceVariant }}>{tk.description}</p>
            <p className="text-[11px] mb-2" style={{ color: C.outline }}>
              {tk.residentName} · {categoryMap[tk.category] || tk.category} · {fmtDate(tk.date)}
            </p>
            {tk.response && (
              <div className="p-2.5 rounded-lg text-xs mb-2" style={{ backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer }}>
                <span className="font-bold">{isBn ? "কমিটির প্রদত্ত উত্তর: " : "Committee response: "}</span>
                {tk.response}
              </div>
            )}
            {canManage && tk.status !== "resolved" && (
              <Btn size="sm" variant="outline" onClick={() => setRespondTo(tk)}>
                {isBn ? "উত্তর দিন" : "Respond"}
              </Btn>
            )}
          </Card>
        ))}
      </div>
      <Modal open={!!respondTo} onClose={() => setRespondTo(null)} title={isBn ? "টিকিটের উত্তর প্রদান" : "Respond to ticket"}>
        {respondTo && <RespondForm ticket={respondTo} onSubmit={respond} lang={lang} isBn={isBn} />}
      </Modal>
    </div>
  );
}

export function RespondForm({ ticket, onSubmit, lang = "en", isBn = false }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("in_progress");

  return (
    <div>
      <Field label={isBn ? "স্ট্যাটাস পরিবর্তন" : "Status"}>
        <select style={inputStyle()} className={inputCls} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="in_progress">{isBn ? "প্রক্রিয়াধীন (In progress)" : "In progress"}</option>
          <option value="resolved">{isBn ? "সমাধানকৃত (Resolved)" : "Resolved"}</option>
        </select>
      </Field>
      <Field label={isBn ? "কমিটির আনুষ্ঠানিক প্রতিক্রিয়া" : "Response"}>
        <textarea
          style={inputStyle()}
          className={inputCls}
          rows={4}
          placeholder={isBn ? "সদস্যকে সমাধানের তথ্য বা ব্যবস্থা সম্পর্কে জানান..." : "Provide resolution details to resident..."}
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </Field>
      <Btn full onClick={() => onSubmit(ticket, text, status)} disabled={!text.trim()}>
        {isBn ? "উত্তর প্রেরণ করুন" : "Send response"}
      </Btn>
    </div>
  );
}
