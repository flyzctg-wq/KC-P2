import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Modal, SectionTitle } from "../../components/primitives";
import { C } from "../../theme";
import { uid, nowISO, fmtDate } from "../../utils";

export default function AdminNotices({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [form, setForm] = useState(false);
  const canManage = session.permissions.canManageNotices;
  const sorted = [...db.notices].sort((a, b) => new Date(b.date) - new Date(a.date));

  const publish = (title, body, category) => {
    if (!title.trim() || !body.trim()) return;
    persist(d => logActivity({ ...d, notices: [{ id: uid("nt"), title, body, category, authorId: session.id, authorName: session.name, date: nowISO(), reactions: { like: [] }, comments: [] }, ...d.notices] }, session.name, `Published notice: ${title}`));
    toast(isBn ? "নোটিশ সফলভাবে প্রকাশিত হয়েছে।" : "Notice published.");
    setForm(false);
  };
  const remove = (id, title) => persist(d => logActivity({ ...d, notices: d.notices.filter(n => n.id !== id) }, session.name, `Deleted notice: ${title}`));

  const categoryMap = {
    Urgent: isBn ? "জরুরি" : "Urgent",
    Financial: isBn ? "আর্থিক" : "Financial",
    General: isBn ? "সাধারণ" : "General",
    Event: isBn ? "অনুষ্ঠান" : "Event",
  };

  return (
    <div>
      <SectionTitle action={canManage && <Btn size="sm" icon={Plus} onClick={() => setForm(true)}>{isBn ? "নতুন নোটিশ প্রকাশ" : "Publish notice"}</Btn>}>
        {isBn ? "নোটিশ ব্যবস্থাপনা" : "Manage notices"}
      </SectionTitle>
      <div className="flex flex-col gap-2.5">
        {sorted.map(n => (
          <Card key={n.id} className="p-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge tone={n.category === "Urgent" ? "danger" : n.category === "Financial" ? "warning" : "info"}>
                  {categoryMap[n.category] || n.category}
                </Badge>
                <span className="text-[11px]" style={{ color: C.outline }}>{fmtDate(n.date)}</span>
              </div>
              <p className="font-bold text-sm">{n.title}</p>
              <p className="text-xs mt-1" style={{ color: C.onSurfaceVariant }}>{n.body}</p>
              <p className="text-[11px] mt-1" style={{ color: C.outline }}>
                {n.reactions.like.length} {isBn ? "পছন্দ" : "likes"} · {n.comments.length} {isBn ? "মন্তব্য" : "comments"}
              </p>
            </div>
            {canManage && (
              <button onClick={() => remove(n.id, n.title)} className="p-1.5 rounded-full shrink-0 cursor-pointer" style={{ color: C.error }} title={isBn ? "নোটিশ মুছুন" : "Delete notice"}>
                <Trash2 size={15} />
              </button>
            )}
          </Card>
        ))}
      </div>
      <Modal open={form} onClose={() => setForm(false)} title={isBn ? "নতুন নোটিশ প্রকাশ করুন" : "Publish a notice"}>
        <NoticeForm onSubmit={publish} lang={lang} isBn={isBn} />
      </Modal>
    </div>
  );
}

export function NoticeForm({ onSubmit, lang = "en", isBn = false }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [body, setBody] = useState("");

  const categories = [
    { key: "General", label: isBn ? "সাধারণ (General)" : "General" },
    { key: "Urgent", label: isBn ? "জরুরি (Urgent)" : "Urgent" },
    { key: "Event", label: isBn ? "অনুষ্ঠান (Event)" : "Event" },
    { key: "Financial", label: isBn ? "আর্থিক (Financial)" : "Financial" },
  ];

  return (
    <div>
      <Field label={isBn ? "নোটিশের শিরোনাম" : "Title"}>
        <input
          style={inputStyle()}
          className={inputCls}
          placeholder={isBn ? "যেমন: আগামী সাধারণ সভার তারিখ ঘোষণা" : "e.g. Annual General Meeting Notice"}
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </Field>
      <Field label={isBn ? "ক্যাটাগরি" : "Category"}>
        <select style={inputStyle()} className={inputCls} value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(c => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
      </Field>
      <Field label={isBn ? "নোটিশের বিস্তারিত বক্তব্য" : "Message"}>
        <textarea
          style={inputStyle()}
          className={inputCls}
          rows={4}
          placeholder={isBn ? "নোটিশের পূর্ণাঙ্গ বিবরণ লিখুন..." : "Write notice message..."}
          value={body}
          onChange={e => setBody(e.target.value)}
        />
      </Field>
      <Btn full onClick={() => onSubmit(title, body, category)}>
        {isBn ? "নোটিশ প্রকাশ করুন" : "Publish"}
      </Btn>
    </div>
  );
}
