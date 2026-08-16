import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Modal, SectionTitle } from "../../components/primitives";
import { C } from "../../theme";
import { uid, nowISO, fmtDate } from "../../utils";

export default function AdminNotices({ session, db, persist, toast, logActivity }) {
  const [form, setForm] = useState(false);
  const canManage = session.permissions.canManageNotices;
  const sorted = [...db.notices].sort((a, b) => new Date(b.date) - new Date(a.date));

  const publish = (title, body, category) => {
    if (!title.trim() || !body.trim()) return;
    persist(d => logActivity({ ...d, notices: [{ id: uid("nt"), title, body, category, authorId: session.id, authorName: session.name, date: nowISO(), reactions: { like: [] }, comments: [] }, ...d.notices] }, session.name, `Published notice: ${title}`));
    toast("Notice published.");
    setForm(false);
  };
  const remove = (id, title) => persist(d => logActivity({ ...d, notices: d.notices.filter(n => n.id !== id) }, session.name, `Deleted notice: ${title}`));

  return (
    <div>
      <SectionTitle action={canManage && <Btn size="sm" icon={Plus} onClick={() => setForm(true)}>Publish notice</Btn>}>Manage notices</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {sorted.map(n => (
          <Card key={n.id} className="p-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1"><Badge tone={n.category === "Urgent" ? "danger" : "info"}>{n.category}</Badge><span className="text-[11px]" style={{ color: C.outline }}>{fmtDate(n.date)}</span></div>
              <p className="font-bold text-sm">{n.title}</p>
              <p className="text-xs mt-1" style={{ color: C.onSurfaceVariant }}>{n.body}</p>
              <p className="text-[11px] mt-1" style={{ color: C.outline }}>{n.reactions.like.length} likes · {n.comments.length} comments</p>
            </div>
            {canManage && <button onClick={() => remove(n.id, n.title)} className="p-1.5 rounded-full shrink-0" style={{ color: C.error }}><Trash2 size={15} /></button>}
          </Card>
        ))}
      </div>
      <Modal open={form} onClose={() => setForm(false)} title="Publish a notice">
        <NoticeForm onSubmit={publish} />
      </Modal>
    </div>
  );
}

export function NoticeForm({ onSubmit }) {
  const [title, setTitle] = useState(""); const [category, setCategory] = useState("General"); const [body, setBody] = useState("");
  return (
    <div>
      <Field label="Title"><input style={inputStyle()} className={inputCls} value={title} onChange={e => setTitle(e.target.value)} /></Field>
      <Field label="Category"><select style={inputStyle()} className={inputCls} value={category} onChange={e => setCategory(e.target.value)}>{["General", "Urgent", "Event", "Financial"].map(c => <option key={c}>{c}</option>)}</select></Field>
      <Field label="Message"><textarea style={inputStyle()} className={inputCls} rows={4} value={body} onChange={e => setBody(e.target.value)} /></Field>
      <Btn full onClick={() => onSubmit(title, body, category)}>Publish</Btn>
    </div>
  );
}
