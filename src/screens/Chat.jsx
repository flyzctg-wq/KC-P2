import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Send, MessageCircle, ShieldCheck, Search, X, CornerDownRight,
  ThumbsUp, Heart, Smile, CheckCheck, Trash2, Phone, User,
  AlertCircle, Sparkles, Filter, Users, Wrench, Megaphone,
  Shield, Check, Copy, MoreVertical, ChevronDown, MessageSquare
} from "lucide-react";
import { Btn, inputCls, inputStyle, Avatar, Empty, SectionTitle, Badge, Modal, Card } from "../components/primitives";
import { C } from "../theme";
import { uid, nowISO, fmtDateTime, fmtDate, playTapSound, cleanPhone } from "../utils";

const COMMUNITY_TOPICS = [
  { id: "all", label: { en: "All", bn: "সকল" }, icon: MessageSquare },
  { id: "general", label: { en: "#General", bn: "#সাধারণ" }, icon: Users },
  { id: "notices", label: { en: "#Notices", bn: "#ঘোষণা" }, icon: Megaphone },
  { id: "helpdesk", label: { en: "#Helpdesk", bn: "#সহায়তা" }, icon: Wrench },
  { id: "ideas", label: { en: "#Suggestions", bn: "#পরামর্শ" }, icon: Sparkles },
];

const QUICK_PHRASES = [
  { en: "👋 Assalamu Alaikum", bn: "👋 আসসালামু আলাইকুম" },
  { en: "🙏 Thank you, neighbor", bn: "🙏 অনেক ধন্যবাদ" },
  { en: "📢 Community Notice", bn: "📢 জরুরি বিজ্ঞপ্তি" },
  { en: "💡 Community Suggestion", bn: "💡 মতামত ও প্রস্তাবনা" },
];

const EMOJIS = ["👍", "❤️", "👏", "🙏", "💡", "🔥", "🏠", "🤝", "😊", "✨"];

export default function Chat({ session, db = {}, persist, toast, logActivity, go, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const isAdmin = session?.role === "admin";
  const isECMember = isAdmin || (session?.post && session.post !== "Resident");

  const [channel, setChannel] = useState("community"); // 'community' | 'council'
  const [topicFilter, setTopicFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [activeEmojiMenuMsgId, setActiveEmojiMenuMsgId] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showGuidelines, setShowGuidelines] = useState(() => {
    try {
      return localStorage.getItem("kc_chat_guidelines_hidden") !== "true";
    } catch (_) {
      return false;
    }
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sending, setSending] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Map of users for fast credential lookup
  const userMap = useMemo(() => {
    const map = new Map();
    (db.users || []).forEach(u => {
      if (u.id) map.set(u.id, u);
      if (u.name) map.set(u.name.toLowerCase().trim(), u);
    });
    return map;
  }, [db.users]);

  // Parse message text for reply quote and topic tag
  const parseMessageText = (rawText = "") => {
    let replyInfo = null;
    let topicTag = null;
    let cleanBody = rawText;

    // Check for quote format: "> Author: Snippet...\n\nBody"
    if (cleanBody.startsWith("> ")) {
      const parts = cleanBody.split("\n\n");
      if (parts.length > 1) {
        const quoteHeader = parts[0].slice(2);
        const colonIdx = quoteHeader.indexOf(":");
        if (colonIdx !== -1) {
          replyInfo = {
            author: quoteHeader.slice(0, colonIdx).trim(),
            snippet: quoteHeader.slice(colonIdx + 1).trim(),
          };
          cleanBody = parts.slice(1).join("\n\n");
        }
      }
    }

    // Check for topic tag prefix: "[#Helpdesk] ..."
    const topicMatch = cleanBody.match(/^\[#([A-Za-z]+)\]\s*/);
    if (topicMatch) {
      topicTag = topicMatch[1].toLowerCase();
      cleanBody = cleanBody.slice(topicMatch[0].length);
    }

    return { replyInfo, topicTag, cleanBody };
  };

  // Filter messages by channel, topic, and search query
  const messages = useMemo(() => {
    const allChannelMessages = (db.chatMessages || []).filter(m => m.channel === channel);

    return allChannelMessages.filter(m => {
      const { topicTag, cleanBody } = parseMessageText(m.text || "");

      // Topic filter
      if (topicFilter !== "all" && topicTag !== topicFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesBody = (cleanBody || "").toLowerCase().includes(q);
        const matchesAuthor = (m.userName || "").toLowerCase().includes(q);
        return matchesBody || matchesAuthor;
      }

      return true;
    });
  }, [db.chatMessages, channel, topicFilter, searchQuery]);

  const prevCountRef = useRef(messages.length);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, channel, topicFilter]);

  // Play audio on new incoming message
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.userId !== session.id) {
        playTapSound("receive");
      }
    }
    prevCountRef.current = messages.length;
  }, [messages, session.id]);

  // Send message handler
  const send = () => {
    if (!text.trim() || sending) return;
    setSending(true);

    try {
      let payloadText = text.trim();

      // Attach reply quote if replying
      if (replyingTo) {
        const snippet = replyingTo.cleanBody.length > 50 ? replyingTo.cleanBody.slice(0, 50) + "…" : replyingTo.cleanBody;
        payloadText = `> ${replyingTo.userName}: ${snippet}\n\n${payloadText}`;
      }

      // Attach topic tag if inside a specific topic filter
      if (topicFilter !== "all" && !payloadText.startsWith("[#")) {
        const tagCapitalized = topicFilter.charAt(0).toUpperCase() + topicFilter.slice(1);
        payloadText = `[#${tagCapitalized}] ${payloadText}`;
      }

      playTapSound("send");

      persist(d => ({
        ...d,
        chatMessages: [
          ...(d.chatMessages || []),
          {
            id: uid("chat"),
            channel,
            userId: session.id,
            userName: session.name,
            text: payloadText,
            date: nowISO(),
            reactions: {},
          }
        ]
      }));

      setText("");
      setReplyingTo(null);
      setShowEmojiPicker(false);
      setTimeout(scrollToBottom, 50);
    } finally {
      setTimeout(() => setSending(false), 200);
    }
  };

  // Toggle emoji reaction
  const toggleReaction = (msgId, emoji) => {
    playTapSound("send");
    persist(d => {
      const list = (d.chatMessages || []).map(m => {
        if (m.id !== msgId) return m;
        const currentReactions = { ...(m.reactions || {}) };
        const userList = currentReactions[emoji] || [];
        const hasReacted = userList.includes(session.id);

        if (hasReacted) {
          currentReactions[emoji] = userList.filter(id => id !== session.id);
          if (currentReactions[emoji].length === 0) delete currentReactions[emoji];
        } else {
          currentReactions[emoji] = [...userList, session.id];
        }

        return { ...m, reactions: currentReactions };
      });
      return { ...d, chatMessages: list };
    });
    setActiveEmojiMenuMsgId(null);
  };

  // Delete message (Owner or Admin)
  const deleteMessage = (msgId) => {
    if (!window.confirm(isBn ? "আপনি কি এই বার্তাটি মুছে ফেলতে চান?" : "Delete this message?")) return;
    persist(d => ({
      ...d,
      chatMessages: (d.chatMessages || []).filter(m => m.id !== msgId)
    }));
    toast(isBn ? "বার্তাটি মুছে ফেলা হয়েছে।" : "Message deleted.");
  };

  // Quick reply
  const startReply = (msg, cleanBody) => {
    setReplyingTo({ id: msg.id, userName: msg.userName, cleanBody });
    inputRef.current?.focus();
  };

  const copyMessageText = (cleanBody) => {
    navigator.clipboard.writeText(cleanBody);
    toast(isBn ? "বার্তা কপি করা হয়েছে।" : "Message copied to clipboard.");
  };

  const dismissGuidelines = () => {
    setShowGuidelines(false);
    try {
      localStorage.setItem("kc_chat_guidelines_hidden", "true");
    } catch (_) {}
  };

  // Lookup member details from userMap
  const getMemberDetails = (userId, userName) => {
    return userMap.get(userId) || userMap.get((userName || "").toLowerCase().trim()) || { name: userName };
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDateKey = null;

    messages.forEach(msg => {
      const msgDate = new Date(msg.date || Date.now());
      const dateKey = msgDate.toDateString();

      if (dateKey !== currentDateKey) {
        currentDateKey = dateKey;
        groups.push({ type: "date", date: msgDate, key: `date-${dateKey}` });
      }
      groups.push({ type: "message", msg, key: msg.id });
    });

    return groups;
  }, [messages]);

  const channels = [
    { k: "community", l: isBn ? "সাধারণ ফোরাম" : "Community Forum", icon: Users, desc: isBn ? "সকল আবাসিক সদস্যদের উন্মুক্ত আলোচনা" : "Open discussion for all club residents" },
    ...(isECMember ? [{ k: "council", l: isBn ? "কার্যনির্বাহী পরিষদ" : "EC Council", icon: Shield, desc: isBn ? "শুধুমাত্র কার্যনির্বাহী পরিষদ সদস্য ফোরাম" : "Private forum for authorized Executive Committee" }] : []),
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)] max-w-5xl mx-auto w-full">
      {/* Top Channel Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-2 border-b" style={{ borderColor: C.outlineVariant }}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black heading text-gray-900 dark:text-gray-100 leading-tight">
              {isBn ? "কমিউনিটি বার্তা ও ফোরাম" : "Community Chat & Forum"}
            </h2>
            <Badge tone="success">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
              {db.users?.length || 15} {isBn ? "সদস্য" : "Members"}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {channel === "council"
              ? (isBn ? "কার্যনির্বাহী পরিষদ (EC) অভ্যন্তরীণ আলোচনা ফোরাম" : "Executive Council private channel (Articles 10 & 14)")
              : (isBn ? "কুঞ্জছায়া আবাসিক এলাকার সকল প্রতিবেশীর খোলামেলা বার্তালাপ" : "Friendly and respectful communication among Kunjachaya residents")}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Channel Selector */}
          <div className="flex rounded-xl p-1 border" style={{ backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }}>
            {channels.map(c => (
              <button
                key={c.k}
                onClick={() => { setChannel(c.k); setTopicFilter("all"); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  c.k === channel
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <c.icon size={13} />
                <span>{c.l}</span>
              </button>
            ))}
          </div>

          {/* Search Toggle */}
          <button
            type="button"
            onClick={() => { setIsSearchOpen(prev => !prev); if (isSearchOpen) setSearchQuery(""); }}
            className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
              isSearchOpen || searchQuery ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 border-emerald-300" : "hover:bg-black/5 dark:hover:bg-white/5"
            }`}
            style={{ borderColor: C.outlineVariant }}
            title={isBn ? "বার্তা খুঁজুন" : "Search Messages"}
            aria-label="Search Messages"
          >
            <Search size={15} />
          </button>
        </div>
      </div>

      {/* Expandable Search Input */}
      {isSearchOpen && (
        <div className="mb-2.5 p-2 rounded-xl border flex items-center gap-2 bg-white dark:bg-slate-900 shadow-xs animate-in slide-in-from-top-2 duration-150" style={{ borderColor: C.outlineVariant }}>
          <Search size={15} className="text-gray-400 shrink-0 ml-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isBn ? "বার্তার অংশ বা প্রেরকের নাম দিয়ে খুঁজুন…" : "Search messages by keyword or sender name…"}
            className="w-full text-xs outline-none bg-transparent text-gray-900 dark:text-gray-100"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label={isBn ? "অনুসন্ধান মুছুন" : "Clear search"}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-600 outline-none transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Community Topic Filter Chips (for #Community channel) */}
      {channel === "community" && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 shrink-0 flex items-center gap-1">
            <Filter size={11} /> {isBn ? "বিষয়:" : "Topic:"}
          </span>
          {COMMUNITY_TOPICS.map(tp => {
            const Icon = tp.icon;
            const active = topicFilter === tp.id;
            return (
              <button
                key={tp.id}
                onClick={() => setTopicFilter(tp.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                  active
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-400 dark:border-emerald-700 shadow-xs"
                    : "bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                }`}
                style={{ borderColor: active ? undefined : C.outlineVariant }}
              >
                <Icon size={12} className={active ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"} />
                <span>{isBn ? tp.label.bn : tp.label.en}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Guidelines Announcement Card (Dismissible) */}
      {showGuidelines && channel === "community" && (
        <div className="mb-2 p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>
              {isBn
                ? "🤝 কুঞ্জছায়া ফোরাম শিষ্টাচার: গঠনমূলক আলোচনা করুন, যাচাইহীন তথ্য পরিহার করুন এবং আবাসিক সৌহার্দ্য বজায় রাখুন।"
                : "🤝 Community Decorum: Keep discussions constructive, respect neighbors, and maintain resident harmony."}
            </span>
          </div>
          <button
            onClick={dismissGuidelines}
            aria-label={isBn ? "দিকনির্দেশনা বন্ধ করুন" : "Dismiss guidelines"}
            title={isBn ? "বন্ধ করুন" : "Dismiss"}
            className="p-1 rounded hover:bg-emerald-200/50 text-emerald-800 dark:text-emerald-300 shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-600 outline-none transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* EC Council Privacy Warning */}
      {channel === "council" && (
        <div className="mb-2 p-2.5 rounded-xl text-xs flex items-center gap-2 border bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800/40 shrink-0">
          <Shield size={15} className="text-amber-600 shrink-0" />
          <span>
            {isBn
              ? "গোপনীয় ফোরাম: শুধুমাত্র অনুমোদিত কার্যনির্বাহী পরিষদ সদস্যরা এই ফোরামের বার্তা দেখতে ও মন্তব্য করতে পারেন।"
              : "Private Council Chamber: Restricted to Executive Committee members for official constitutional decisions."}
          </span>
        </div>
      )}

      {/* Main Message Stream */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto min-h-0 pr-1 pb-3 space-y-3"
      >
        {groupedMessages.map((item) => {
          if (item.type === "date") {
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            const itemDateString = item.date.toDateString();
            const displayDate = itemDateString === today
              ? (isBn ? "আজ" : "Today")
              : itemDateString === yesterday
              ? (isBn ? "গতকাল" : "Yesterday")
              : fmtDate(item.date);

            return (
              <div key={item.key} className="flex items-center justify-center my-3">
                <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shadow-2xs">
                  {displayDate}
                </span>
              </div>
            );
          }

          const m = item.msg;
          const mine = m.userId === session?.id;
          const sender = getMemberDetails(m.userId, m.userName);
          const { replyInfo, topicTag, cleanBody } = parseMessageText(m.text || "");
          const isEC = sender.post && sender.post !== "Resident";
          const rawPhone = cleanPhone(sender.phone || "");

          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 group relative ${mine ? "flex-row-reverse" : ""}`}
            >
              {/* Member Avatar (clickable to view quick mini-card) */}
              <div
                onClick={() => setSelectedMember(sender)}
                className="relative cursor-pointer transition-transform hover:scale-105 shrink-0 mt-0.5"
                title={isBn ? `${sender.name}-এর প্রোফাইল দেখুন` : `View ${sender.name}'s info`}
              >
                <Avatar name={sender.name || m.userName} photoUrl={sender.photoUrl} size={34} />
                {sender.bloodGroup && (
                  <span
                    className="absolute -bottom-1 -right-1 text-[8px] font-extrabold px-1 rounded-full text-white bg-rose-600 shadow-2xs leading-tight"
                    title={`Blood Group: ${sender.bloodGroup}`}
                  >
                    {sender.bloodGroup}
                  </span>
                )}
              </div>

              {/* Message Content Container */}
              <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${mine ? "items-end" : "items-start"}`}>
                {/* Header: Member Name, Member Code Badge, EC Post, Location */}
                <div className={`flex items-center gap-1.5 flex-wrap mb-1 px-1 text-xs ${mine ? "justify-end" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setSelectedMember(sender)}
                    className="font-bold text-gray-900 dark:text-gray-100 hover:underline cursor-pointer text-left"
                  >
                    {sender.name || m.userName}
                  </button>

                  {sender.memberCode && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/50">
                      #{sender.memberCode}
                    </span>
                  )}

                  {isEC ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700/50">
                      {sender.post}
                    </span>
                  ) : sender.memberClass ? (
                    <span className="text-[9px] font-semibold text-gray-500 dark:text-gray-400">
                      {sender.memberClass}
                    </span>
                  ) : null}

                  {sender.block && (
                    <span className="text-[10px] text-gray-400">
                      · {isBn ? "ব্লক" : "Block"} {sender.block}{sender.unit ? ` (${sender.unit})` : ""}
                    </span>
                  )}
                </div>

                {/* Message Bubble with Reply and Topic */}
                <div className="relative">
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs border ${
                      mine
                        ? "bg-emerald-700 text-white border-emerald-800 rounded-tr-xs"
                        : "bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-800 rounded-tl-xs"
                    }`}
                  >
                    {/* Reply Quoted Preview */}
                    {replyInfo && (
                      <div
                        className={`mb-2 p-1.5 rounded-lg border-l-3 text-xs leading-snug ${
                          mine
                            ? "bg-emerald-800/80 border-amber-300 text-emerald-100"
                            : "bg-gray-100 dark:bg-slate-800 border-emerald-500 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        <p className="font-bold text-[10px] uppercase opacity-85">
                          {replyInfo.author}
                        </p>
                        <p className="truncate italic text-[11px] opacity-90">
                          {replyInfo.snippet}
                        </p>
                      </div>
                    )}

                    {/* Topic Pill Tag */}
                    {topicTag && (
                      <div className="mb-1">
                        <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          mine
                            ? "bg-emerald-800 text-emerald-200"
                            : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                        }`}>
                          #{topicTag}
                        </span>
                      </div>
                    )}

                    {/* Clean Message Body */}
                    <p className="whitespace-pre-wrap break-words">{cleanBody}</p>

                    {/* Footer inside bubble: Time & Sent Receipt */}
                    <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      mine ? "text-emerald-200" : "text-gray-400"
                    }`}>
                      <span>{fmtDateTime(m.date).split(",")[1] || fmtDateTime(m.date)}</span>
                      {mine && <CheckCheck size={13} className="text-emerald-300" />}
                    </div>
                  </div>

                  {/* Hover Quick Action Bar */}
                  <div
                    className={`absolute -top-3 ${
                      mine ? "left-0 -translate-x-full mr-1" : "right-0 translate-x-full ml-1"
                    } opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 p-0.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-md z-10`}
                  >
                    <button
                      type="button"
                      onClick={() => startReply(m, cleanBody)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 hover:text-emerald-600"
                      title={isBn ? "উত্তর দিন" : "Reply"}
                    >
                      <CornerDownRight size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveEmojiMenuMsgId(activeEmojiMenuMsgId === m.id ? null : m.id)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 hover:text-amber-500"
                      title={isBn ? "প্রতিক্রিয়া জানান" : "React"}
                    >
                      <Smile size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => copyMessageText(cleanBody)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"
                      title={isBn ? "কপি করুন" : "Copy"}
                    >
                      <Copy size={13} />
                    </button>
                    {(mine || isAdmin) && (
                      <button
                        type="button"
                        onClick={() => deleteMessage(m.id)}
                        className="p-1 rounded hover:bg-rose-50 text-gray-400 hover:text-rose-600"
                        title={isBn ? "মুছে ফেলুন" : "Delete"}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {/* Emoji Quick Picker Popup */}
                  {activeEmojiMenuMsgId === m.id && (
                    <div
                      className={`absolute top-full mt-1 ${mine ? "right-0" : "left-0"} p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-xl z-20 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-100`}
                    >
                      {EMOJIS.slice(0, 6).map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => toggleReaction(m.id, emoji)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-base transition-transform active:scale-125"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reactions Pill Display Bar */}
                {m.reactions && Object.keys(m.reactions).length > 0 && (
                  <div className={`flex items-center gap-1 mt-1 flex-wrap ${mine ? "justify-end" : "justify-start"}`}>
                    {Object.entries(m.reactions).map(([emoji, uids]) => {
                      if (!uids || uids.length === 0) return null;
                      const hasReacted = uids.includes(session.id);
                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => toggleReaction(m.id, emoji)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                            hasReacted
                              ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-800 dark:text-emerald-200"
                              : "bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                          }`}
                          title={`${uids.length} member(s) reacted with ${emoji}`}
                        >
                          <span>{emoji}</span>
                          <span className="text-[10px] font-bold">{uids.length}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {messages.length === 0 && (
          <Empty
            icon={MessageCircle}
            title={searchQuery ? (isBn ? "কোনো ফলাফল পাওয়া যায়নি" : "No matching messages") : (isBn ? "এখনো কোনো বার্তা নেই" : "No messages yet")}
            subtitle={searchQuery ? (isBn ? "অন্য কি-ওয়ার্ড দিয়ে অনুসন্ধান করুন।" : "Try another search keyword.") : (isBn ? "এই ফোরামে সবার প্রথম বার্তা পাঠাতে নিচের ঘরে লিখুন।" : "Start the neighborhood conversation below.")}
          />
        )}
      </div>

      {/* Reply-To Preview Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-1 rounded-xl text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 min-w-0">
            <CornerDownRight size={14} className="text-emerald-600 shrink-0" />
            <span className="truncate">
              {isBn ? "উত্তর দিচ্ছেন" : "Replying to"} <b>{replyingTo.userName}</b>: <i>"{replyingTo.cleanBody}"</i>
            </span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            aria-label={isBn ? "উত্তর বাতিল করুন" : "Cancel reply"}
            className="p-1 rounded hover:bg-emerald-200/50 shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-600 outline-none transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Quick Community Phrases Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none shrink-0">
        {QUICK_PHRASES.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setText(prev => (prev ? `${prev} ${isBn ? qp.bn : qp.en}` : (isBn ? qp.bn : qp.en)))}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 whitespace-nowrap transition-colors border border-gray-200/60 dark:border-gray-700/60"
          >
            {isBn ? qp.bn : qp.en}
          </button>
        ))}
      </div>

      {/* Composer Input Bar */}
      <div className="pt-2 border-t shrink-0 relative" style={{ borderColor: C.outlineVariant }}>
        {showEmojiPicker && (
          <div className="absolute bottom-full mb-2 left-0 p-2 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-2xl z-30 grid grid-cols-5 gap-1.5">
            {EMOJIS.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => { setText(prev => prev + emoji); setShowEmojiPicker(false); }}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-lg transition-transform active:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(prev => !prev)}
            className={`p-2.5 rounded-xl border text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${
              showEmojiPicker ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-300" : ""
            }`}
            style={{ borderColor: showEmojiPicker ? undefined : C.outlineVariant }}
            title={isBn ? "ইমোজি ড্রয়ার" : "Emoji drawer"}
            aria-label="Toggle emoji picker"
          >
            <Smile size={18} />
          </button>

          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
            placeholder={
              replyingTo
                ? (isBn ? `${replyingTo.userName}-এর উত্তরে লিখুন…` : `Write reply to ${replyingTo.userName}…`)
                : (isBn ? "কমিউনিটিতে বার্তা লিখুন (Enter চাপুন)…" : "Message Kunjachaya neighbors (Press Enter)…")
            }
            style={inputStyle()}
            className={inputCls + " flex-1"}
          />

          <Btn size="md" icon={Send} onClick={send} disabled={!text.trim() || sending}>
            {isBn ? "পাঠান" : "Send"}
          </Btn>
        </div>
      </div>

      {/* Member Quick Info Modal */}
      <Modal
        open={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        title={isBn ? "প্রতিবেশী প্রোফাইল তথ্য" : "Member Quick Profile"}
      >
        {selectedMember && (
          <div className="space-y-4 py-1">
            <div className="flex items-center gap-3.5">
              <Avatar name={selectedMember.name} photoUrl={selectedMember.photoUrl} size={56} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedMember.memberCode && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      #{selectedMember.memberCode}
                    </span>
                  )}
                  <p className="font-extrabold text-base text-gray-900 dark:text-gray-100 truncate">
                    {selectedMember.name}
                  </p>
                </div>
                {selectedMember.nameBn && (
                  <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300 truncate mt-0.5">
                    {selectedMember.nameBn}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {selectedMember.post ? (
                    <Badge tone="success">{selectedMember.post}</Badge>
                  ) : (
                    <Badge tone="neutral">{selectedMember.memberClass || "Resident"}</Badge>
                  )}
                  {selectedMember.bloodGroup && (
                    <Badge tone="danger">{selectedMember.bloodGroup}</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border text-xs space-y-2 bg-gray-50 dark:bg-slate-800/60" style={{ borderColor: C.outlineVariant }}>
              <div className="flex justify-between">
                <span className="text-gray-500">{isBn ? "ঠিকানা / ইউনিট:" : "Apartment Unit:"}</span>
                <span className="font-semibold">{isBn ? "ব্লক" : "Block"} {selectedMember.block || "—"}, {selectedMember.unit || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{isBn ? "ফোন নম্বর:" : "Phone:"}</span>
                <span className="font-semibold">{selectedMember.phone || (isBn ? "সংরক্ষিত নেই" : "Not listed")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{isBn ? "ইমেইল:" : "Email:"}</span>
                <span className="font-semibold">{selectedMember.email || "—"}</span>
              </div>
            </div>

            {/* Action Buttons: WhatsApp and Direct Call */}
            <div className="flex items-center gap-2 pt-2">
              {cleanPhone(selectedMember.phone) ? (
                <>
                  <a
                    href={`https://wa.me/${cleanPhone(selectedMember.phone)}?text=${encodeURIComponent(
                      isBn
                        ? `আসসালামু আলাইকুম ${selectedMember.name}, কুঞ্জছায়া ক্লাব ফোরাম থেকে যোগাযোগ করছি।`
                        : `Hello ${selectedMember.name}, contacting you from Kunjachaya Club community chat.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
                  >
                    <MessageCircle size={15} /> WhatsApp
                  </a>
                  <a
                    href={`tel:${cleanPhone(selectedMember.phone)}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Phone size={15} /> {isBn ? "কল করুন" : "Call"}
                  </a>
                </>
              ) : (
                <div className="w-full text-center py-2 text-xs text-gray-400">
                  {isBn ? "যোগাযোগের ফোন নম্বর সংরক্ষিত নেই" : "No direct phone contact listed for this member"}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


