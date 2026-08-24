import React, { useState } from "react";
import { Send, MessageSquare, ThumbsUp } from "lucide-react";
import { Btn, Card, Badge, inputCls, inputStyle, Avatar, SectionTitle } from "../components/primitives";
import { C } from "../theme";
import { uid, nowISO, fmtDateTime } from "../utils";

export default function Notices({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
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

  const categoryMap = {
    Urgent: isBn ? "জরুরি" : "Urgent",
    Financial: isBn ? "আর্থিক" : "Financial",
    General: isBn ? "সাধারণ" : "General",
    Meeting: isBn ? "সভা/মিটিং" : "Meeting",
    Event: isBn ? "অনুষ্ঠান" : "Event",
  };

  return (
    <div>
      <SectionTitle>{isBn ? "ক্লাব নোটিশ বোর্ড" : "Notices"}</SectionTitle>
      <div className="flex flex-col gap-3">
        {sorted.map(n => {
          const liked = n.reactions.like.includes(session.id);
          return (
            <Card key={n.id} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge tone={n.category === "Urgent" ? "danger" : n.category === "Financial" ? "warning" : "info"}>
                  {categoryMap[n.category] || n.category}
                </Badge>
                {n.isBulletin && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    n.bulletinType === "breaking"
                      ? "bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-live" />
                    {n.bulletinType === "breaking" ? (isBn ? "ব্রেকিং বুলেটিন" : "BREAKING") : (isBn ? "কুইক নোটিশ" : "QUICK BULLETIN")}
                  </span>
                )}
                <span className="text-[11px] ml-auto" style={{ color: C.outline }}>{fmtDateTime(n.date)}</span>
              </div>
              <h3 className="font-bold text-sm mb-1">{n.title}</h3>
              <p className="text-sm mb-3" style={{ color: C.onSurfaceVariant }}>{n.body}</p>
              <div className="flex items-center gap-4 text-xs font-semibold" style={{ color: C.onSurfaceVariant }}>
                <button onClick={() => react(n.id)} className="flex items-center gap-1.5 cursor-pointer" style={liked ? { color: C.primary } : {}}>
                  <ThumbsUp size={14} fill={liked ? C.primary : "none"} /> {n.reactions.like.length} {isBn ? "পছন্দ" : "Likes"}
                </button>
                <button onClick={() => setOpen(open === n.id ? null : n.id)} className="flex items-center gap-1.5 cursor-pointer">
                  <MessageSquare size={14} /> {n.comments.length} {isBn ? "মন্তব্য" : "Comments"}
                </button>
                <span className="ml-auto text-[11px]" style={{ color: C.outline }}>— {n.authorName}</span>
              </div>
              {open === n.id && <CommentBox notice={n} onSend={(txt) => comment(n.id, txt)} lang={lang} isBn={isBn} />}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function CommentBox({ notice, onSend, lang = "en", isBn = false }) {
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
        <input
          style={inputStyle()}
          className={inputCls}
          placeholder={isBn ? "একটি মন্তব্য লিখুন..." : "Write a comment..."}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { onSend(text); setText(""); } }}
        />
        <Btn size="sm" icon={Send} onClick={() => { onSend(text); setText(""); }}>
          {isBn ? "পাঠান" : "Send"}
        </Btn>
      </div>
    </div>
  );
}
