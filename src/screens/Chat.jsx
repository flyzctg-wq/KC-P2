import React, { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, ShieldCheck } from "lucide-react";
import { Btn, inputCls, inputStyle, Avatar, Empty, SectionTitle } from "../components/primitives";
import { C } from "../theme";
import { uid, nowISO, fmtDateTime, playTapSound } from "../utils";

export default function Chat({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const isAdmin = session.role === "admin";
  const [channel, setChannel] = useState("community");
  const [text, setText] = useState("");
  const scrollRef = useRef(null);
  const messages = (db.chatMessages || []).filter(m => m.channel === channel);
  const prevCountRef = useRef(messages.length);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length, channel]);

  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.userId !== session.id) {
        playTapSound("receive");
      }
    }
    prevCountRef.current = messages.length;
  }, [messages, session.id]);

  const send = () => {
    if (!text.trim()) return;
    playTapSound("send");
    persist(d => ({ ...d, chatMessages: [...(d.chatMessages || []), { id: uid("chat"), channel, userId: session.id, userName: session.name, text, date: nowISO() }] }));
    setText("");
  };

  const channels = [
    { k: "community", l: isBn ? "সাধারণ ফোরাম" : "Community" },
    { k: "council", l: isBn ? "কার্যনির্বাহী পরিষদ ফোরাম" : "EC Council" },
  ];

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 180px)" }}>
      <SectionTitle>{isBn ? "কমিউনিটি বার্তা ও ফোরাম" : "Chat"}</SectionTitle>
      {isAdmin && (
        <div className="flex rounded-full p-1 mb-4 w-fit" style={{ backgroundColor: C.surfaceContainer }}>
          {channels.map(c => (
            <button
              key={c.k}
              onClick={() => setChannel(c.k)}
              className="px-4 py-1.5 rounded-full text-xs font-bold transition-colors"
              style={c.k === channel ? { backgroundColor: C.primary, color: "#fff" } : { color: C.onSurfaceVariant }}
            >
              {c.l}
            </button>
          ))}
        </div>
      )}
      {channel === "council" && (
        <div className="mb-3 p-2.5 rounded-xl text-xs flex items-center gap-2" style={{ backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer }}>
          <ShieldCheck size={14} /> {isBn ? "শুধুমাত্র কার্যনির্বাহী পরিষদ সদস্যরা এই ফোরামের বার্তা দেখতে পারেন।" : "Only EC members can see this channel."}
        </div>
      )}
      <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 pb-3">
        {messages.map(m => {
          const mine = m.userId === session.id;
          return (
            <div key={m.id} className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
              <Avatar name={m.userName} size={28} />
              <div className="max-w-[75%]">
                {!mine && <p className="text-[11px] font-bold mb-0.5 px-1" style={{ color: C.onSurfaceVariant }}>{m.userName}</p>}
                <div className="px-3.5 py-2 rounded-2xl text-sm" style={mine ? { backgroundColor: C.primary, color: "#fff", borderBottomRightRadius: 4 } : { backgroundColor: C.surfaceContainerLow, borderBottomLeftRadius: 4 }}>
                  {m.text}
                </div>
                <p className="text-[10px] mt-0.5 px-1" style={{ color: C.outline }}>{fmtDateTime(m.date)}</p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <Empty
            icon={MessageCircle}
            title={isBn ? "কোনো বার্তা নেই" : "No messages yet"}
            subtitle={isBn ? "কথোপকথন শুরু করতে বার্তা পাঠান।" : "Start the conversation."}
          />
        )}
      </div>
      <div className="flex gap-2 pt-3 border-t" style={{ borderColor: C.outlineVariant }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder={isBn ? "বার্তা লিখুন…" : "Type a message…"}
          style={inputStyle()}
          className={inputCls}
        />
        <Btn size="sm" icon={Send} onClick={send}>
          {isBn ? "পাঠান" : "Send"}
        </Btn>
      </div>
    </div>
  );
}

