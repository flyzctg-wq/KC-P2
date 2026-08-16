import React, { useState } from "react";
import { Send, MessageSquare, ThumbsUp } from "lucide-react";
import { Btn, Card, Badge, inputCls, inputStyle, Avatar, SectionTitle } from "../components/primitives";
import { C } from "../theme";
import { uid, nowISO, fmtDateTime } from "../utils";

export default function Notices({ session, db, persist, toast, logActivity }) {
  const [open, setOpen] = useState(null);
  const sorted = [...db.notices].sort((a, b) => new Date(b.date) - new Date(a.date));

  const react = (id) => persist(d => ({
    ...d, notices: d.notices.map(n => {
      if (n.id !== id) return n;
      const has = n.reactions.like.includes(session.id);
      return { ...n, reactions: { like: has ? n.reactions.like.filter(x => x !== session.id) : [...n.reactions.like, session.id] } };
    }),
  }));

  const comment = (id, text) => {
    if (!text.trim()) return;
    persist(d => ({ ...d, notices: d.notices.map(n => n.id === id ? { ...n, comments: [...n.comments, { id: uid("c"), userId: session.id, userName: session.name, text, date: nowISO() }] } : n) }));
  };

  return (
    <div>
      <SectionTitle>Notices</SectionTitle>
      <div className="flex flex-col gap-3">
        {sorted.map(n => {
          const liked = n.reactions.like.includes(session.id);
          return (
            <Card key={n.id} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge tone={n.category === "Urgent" ? "danger" : n.category === "Financial" ? "warning" : "info"}>{n.category}</Badge>
                <span className="text-[11px]" style={{ color: C.outline }}>{fmtDateTime(n.date)}</span>
              </div>
              <h3 className="font-bold text-sm mb-1">{n.title}</h3>
              <p className="text-sm mb-3" style={{ color: C.onSurfaceVariant }}>{n.body}</p>
              <div className="flex items-center gap-4 text-xs font-semibold" style={{ color: C.onSurfaceVariant }}>
                <button onClick={() => react(n.id)} className="flex items-center gap-1.5" style={liked ? { color: C.primary } : {}}><ThumbsUp size={14} fill={liked ? C.primary : "none"} /> {n.reactions.like.length}</button>
                <button onClick={() => setOpen(open === n.id ? null : n.id)} className="flex items-center gap-1.5"><MessageSquare size={14} /> {n.comments.length}</button>
                <span className="ml-auto text-[11px]" style={{ color: C.outline }}>— {n.authorName}</span>
              </div>
              {open === n.id && <CommentBox notice={n} onSend={(txt) => comment(n.id, txt)} />}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function CommentBox({ notice, onSend }) {
  const [text, setText] = useState("");
  return (
    <div className="mt-3 pt-3 border-t" style={{ borderColor: C.outlineVariant }}>
      {notice.comments.map(c => (
        <div key={c.id} className="flex items-start gap-2 mb-2">
          <Avatar name={c.userName} size={26} />
          <div className="rounded-xl px-3 py-1.5 text-xs flex-1" style={{ backgroundColor: C.surfaceContainerLow }}>
            <span className="font-bold">{c.userName}</span> <span style={{ color: C.onSurfaceVariant }}>{c.text}</span>
          </div>
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Add a comment…" style={inputStyle()} className={inputCls} onKeyDown={e => { if (e.key === "Enter") { onSend(text); setText(""); } }} />
        <Btn size="sm" icon={Send} onClick={() => { onSend(text); setText(""); }}>Send</Btn>
      </div>
    </div>
  );
}
