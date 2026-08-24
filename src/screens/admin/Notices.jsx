import React, { useState } from "react";
import {
  Plus, Trash2, Edit3, Zap, Siren, AlertTriangle,
  Clock, Radio, CheckCircle2, XCircle
} from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Modal, SectionTitle } from "../../components/primitives";
import { C } from "../../theme";
import { uid, nowISO, fmtDateTime, fmtDate } from "../../utils";

export default function AdminNotices({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [formOpen, setFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  const canManage = session.permissions?.canManageNotices || session.role === "admin";
  const sorted = [...(db?.notices || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Compute expiry ISO from duration hours or custom expiry
  const computeExpiry = (durationOption, customDate) => {
    if (durationOption === "always") return null;
    if (durationOption === "custom" && customDate) {
      return new Date(customDate).toISOString();
    }
    const hours = parseInt(durationOption, 10);
    if (!isNaN(hours) && hours > 0) {
      return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    }
    return null;
  };

  const publishOrUpdate = (data) => {
    const { title, body, category, isBulletin, bulletinType, durationOption, customExpiryDate } = data;
    const cleanBody = (body || "").trim();
    if (!cleanBody) {
      toast(isBn ? "দয়া করে নোটিশের বিস্তারিত বিবরণ লিখুন।" : "Please enter the notice message.", "error");
      return;
    }

    const cleanTitle = (title || "").trim() || (
      isBulletin
        ? (bulletinType === "breaking" ? (isBn ? "জরুরি ব্রেকিং নোটিশ" : "Urgent Breaking Notice") : (isBn ? "কুইক নোটিশ" : "Quick Notice"))
        : (cleanBody.length > 50 ? cleanBody.slice(0, 50) + "..." : cleanBody)
    );

    const expiresAt = isBulletin ? computeExpiry(durationOption, customExpiryDate) : null;
    const durationHours = durationOption === "always" ? null : (durationOption === "custom" ? null : parseInt(durationOption, 10));

    if (editingNotice) {
      // Update existing notice
      persist(d => logActivity({
        ...d,
        notices: d.notices.map(n => n.id === editingNotice.id ? {
          ...n,
          title: cleanTitle,
          body: cleanBody,
          category: category || "General",
          isBulletin: !!isBulletin,
          bulletinType: isBulletin ? (bulletinType || "quick") : "quick",
          bulletinExpiresAt: expiresAt,
          bulletinDurationHours: durationHours,
        } : n)
      }, session?.name || "Admin", `Updated notice: ${cleanTitle}`));
      toast(isBn ? "নোটিশ সফলভাবে আপডেট করা হয়েছে।" : "Notice updated successfully.");
      setEditingNotice(null);
    } else {
      // Create new notice
      const newNotice = {
        id: uid(),
        title: cleanTitle,
        body: cleanBody,
        category: category || "General",
        authorId: session?.id || null,
        authorName: session?.name || "Kunjachaya Admin",
        date: nowISO(),
        reactions: { like: [] },
        comments: [],
        isBulletin: !!isBulletin,
        bulletinType: isBulletin ? (bulletinType || "quick") : "quick",
        bulletinExpiresAt: expiresAt,
        bulletinDurationHours: durationHours,
      };

      persist(d => logActivity({
        ...d,
        notices: [newNotice, ...(d.notices || [])]
      }, session?.name || "Admin", `Published notice: ${cleanTitle}`));
      toast(isBn ? "নতুন নোটিশ প্রকাশিত হয়েছে।" : "Notice published successfully.");
      setFormOpen(false);
    }
  };

  // Quick toggle TV bulletin status from card
  const toggleBulletin = (notice) => {
    const nextState = !notice.isBulletin;
    const nextExpiry = nextState ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null; // default 24h if turned on

    persist(d => logActivity({
      ...d,
      notices: d.notices.map(n => n.id === notice.id ? {
        ...n,
        isBulletin: nextState,
        bulletinType: n.bulletinType || "quick",
        bulletinExpiresAt: nextExpiry,
      } : n)
    }, session.name, `${nextState ? "Enabled" : "Disabled"} TV bulletin for: ${notice.title}`));

    toast(
      nextState
        ? (isBn ? "টিভি বুলেটিন সক্রিয় করা হয়েছে (২৪ ঘণ্টার জন্য)।" : "TV Bulletin enabled (24 hours).")
        : (isBn ? "টিভি বুলেটিন বন্ধ করা হয়েছে।" : "TV Bulletin disabled.")
    );
  };

  const remove = (id, title) => {
    if (!window.confirm(isBn ? `আপনি কি নিশ্চিত যে "${title}" নোটিশটি মুছে ফেলতে চান?` : `Are you sure you want to delete "${title}"?`)) return;
    persist(d => logActivity({ ...d, notices: d.notices.filter(n => n.id !== id) }, session.name, `Deleted notice: ${title}`));
    toast(isBn ? "নোটিশ মুছে ফেলা হয়েছে।" : "Notice deleted.");
  };

  const categoryMap = {
    Urgent: isBn ? "জরুরি" : "Urgent",
    Financial: isBn ? "আর্থিক" : "Financial",
    General: isBn ? "সাধারণ" : "General",
    Meeting: isBn ? "সভা/মিটিং" : "Meeting",
    Event: isBn ? "অনুষ্ঠান" : "Event",
  };

  // Helper for bulletin active state
  const isBulletinActive = (n) => {
    if (!n.isBulletin) return false;
    if (!n.bulletinExpiresAt) return true;
    return new Date(n.bulletinExpiresAt).getTime() > Date.now();
  };

  return (
    <div className="space-y-4">
      <SectionTitle action={canManage && (
        <Btn size="sm" icon={Plus} onClick={() => { setEditingNotice(null); setFormOpen(true); }}>
          {isBn ? "নতুন নোটিশ প্রকাশ" : "Publish notice"}
        </Btn>
      )}>
        {isBn ? "নোটিশ ও টিভি বুলেটিন ব্যবস্থাপনা" : "Notices & TV Bulletin"}
      </SectionTitle>

      {/* TV Bulletin Quick Info Banner */}
      <div className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
            <Radio size={18} className="animate-pulse-live" />
          </div>
          <div>
            <p className="text-xs font-bold">{isBn ? "লাইভ টিভি বুলেটিন নিয়ন্ত্রণ" : "Live TV Bulletin Broadcast Control"}</p>
            <p className="text-[11px]" style={{ color: C.onSurfaceVariant }}>
              {isBn
                ? "যেকোনো জরুরি বা কুইক নোটিশ অ্যাপ ও ওয়েবের শীর্ষে নির্দিষ্ট সময়ের জন্য প্রদর্শন করুন।"
                : "Broadcast important or quick notices at the top of Web & Android app with custom duration."}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-extrabold px-2 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 shrink-0 self-start sm:self-center">
          {sorted.filter(isBulletinActive).length} {isBn ? "টি সক্রিয় বুলেটিন" : "Active Bulletins"}
        </span>
      </div>

      {/* Notices List */}
      <div className="flex flex-col gap-3">
        {sorted.length === 0 ? (
          <div className="text-center py-10 opacity-60 text-xs">
            {isBn ? "কোনো নোটিশ পাওয়া যায়নি।" : "No notices found."}
          </div>
        ) : (
          sorted.map(n => {
            const activeB = isBulletinActive(n);
            return (
              <Card key={n.id} className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {/* Top Badges & Meta */}
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <Badge tone={n.category === "Urgent" ? "danger" : n.category === "Financial" ? "warning" : "info"}>
                      {categoryMap[n.category] || n.category}
                    </Badge>

                    {/* Bulletin Indicator Badge */}
                    {n.isBulletin && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        activeB
                          ? (n.bulletinType === "breaking" ? "bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300")
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${activeB ? "bg-current animate-pulse-live" : "bg-gray-400"}`} />
                        {n.bulletinType === "breaking" ? (isBn ? "ব্রেকিং বুলেটিন" : "BREAKING") : (isBn ? "কুইক নোটিশ" : "QUICK BULLETIN")}
                        {activeB ? (isBn ? " (চলমান)" : " (LIVE)") : (isBn ? " (মেয়াদোত্তীর্ণ)" : " (Expired)")}
                      </span>
                    )}

                    <span className="text-[11px] ml-auto sm:ml-0" style={{ color: C.outline }}>
                      {fmtDate(n.date)}
                    </span>
                  </div>

                  <p className="font-bold text-sm leading-snug">{n.title}</p>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: C.onSurfaceVariant }}>{n.body}</p>

                  {/* Bulletin Duration Info */}
                  {n.isBulletin && n.bulletinExpiresAt && (
                    <p className="text-[11px] mt-1.5 flex items-center gap-1 font-semibold" style={{ color: activeB ? C.primary : C.error }}>
                      <Clock size={12} />
                      {activeB
                        ? (isBn ? `প্রদর্শনের শেষ সময়: ${fmtDateTime(n.bulletinExpiresAt)}` : `Visible until: ${fmtDateTime(n.bulletinExpiresAt)}`)
                        : (isBn ? `মেয়াদ শেষ হয়েছে: ${fmtDateTime(n.bulletinExpiresAt)}` : `Expired at: ${fmtDateTime(n.bulletinExpiresAt)}`)}
                    </p>
                  )}

                  <p className="text-[11px] mt-1" style={{ color: C.outline }}>
                    {n.reactions?.like?.length || 0} {isBn ? "পছন্দ" : "likes"} · {n.comments?.length || 0} {isBn ? "মন্তব্য" : "comments"} · {isBn ? "লেখক: " : "By: "}{n.authorName}
                  </p>
                </div>

                {/* Right Action Controls */}
                {canManage && (
                  <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 justify-end" style={{ borderColor: C.outlineVariant }}>
                    {/* Fast TV Bulletin Toggle Switch */}
                    <button
                      onClick={() => toggleBulletin(n)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${
                        activeB
                          ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/40"
                          : "bg-black/5 dark:bg-white/5 text-gray-500 hover:bg-black/10"
                      }`}
                      title={activeB ? (isBn ? "টিভি বুলেটিন বন্ধ করুন" : "Turn off bulletin") : (isBn ? "টিভি বুলেটিনে যুক্ত করুন" : "Display on TV Bulletin")}
                    >
                      <Zap size={13} fill={activeB ? "currentColor" : "none"} />
                      {activeB ? (isBn ? "বুলেটিন অন" : "TV ON") : (isBn ? "বুলেটিন অফ" : "TV OFF")}
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => { setEditingNotice(n); setFormOpen(true); }}
                      className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-slate-600 dark:text-slate-300"
                      title={isBn ? "নোটিশ ও সময়সীমা সম্পাদনা" : "Edit Notice & Duration"}
                    >
                      <Edit3 size={15} />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => remove(n.id, n.title)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                      style={{ color: C.error }}
                      title={isBn ? "নোটিশ মুছুন" : "Delete notice"}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Publish & Edit Notice Modal */}
      <Modal
        open={formOpen || !!editingNotice}
        onClose={() => { setFormOpen(false); setEditingNotice(null); }}
        title={editingNotice ? (isBn ? "নোটিশ ও বুলেটিন সময়সীমা সম্পাদনা" : "Edit Notice & Bulletin Duration") : (isBn ? "নতুন নোটিশ প্রকাশ করুন" : "Publish a Notice")}
      >
        <NoticeForm
          initialData={editingNotice}
          onSubmit={publishOrUpdate}
          lang={lang}
          isBn={isBn}
        />
      </Modal>
    </div>
  );
}

export function NoticeForm({ initialData = null, onSubmit, lang = "en", isBn = false }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || "General");
  const [body, setBody] = useState(initialData?.body || "");

  // Bulletin Controls
  const [isBulletin, setIsBulletin] = useState(initialData?.isBulletin ?? (initialData?.category === "Urgent"));
  const [bulletinType, setBulletinType] = useState(initialData?.bulletinType || (initialData?.category === "Urgent" ? "breaking" : "quick"));

  // Appearance Duration Setting
  const [durationOption, setDurationOption] = useState(() => {
    if (initialData?.bulletinDurationHours) return String(initialData.bulletinDurationHours);
    if (initialData?.isBulletin && !initialData.bulletinExpiresAt) return "always";
    if (initialData?.bulletinExpiresAt) return "custom";
    return "24"; // default 24 hours
  });

  const [customExpiryDate, setCustomExpiryDate] = useState(() => {
    if (initialData?.bulletinExpiresAt) {
      try {
        const d = new Date(initialData.bulletinExpiresAt);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      } catch (_) {}
    }
    const defaultD = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return new Date(defaultD.getTime() - defaultD.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });

  const categories = [
    { key: "General", label: isBn ? "সাধারণ (General)" : "General" },
    { key: "Urgent", label: isBn ? "জরুরি (Urgent)" : "Urgent" },
    { key: "Event", label: isBn ? "অনুষ্ঠান (Event)" : "Event" },
    { key: "Financial", label: isBn ? "আর্থিক (Financial)" : "Financial" },
    { key: "Meeting", label: isBn ? "সভা/মিটিং (Meeting)" : "Meeting" },
  ];

  const durationPresets = [
    { key: "1", label: isBn ? "১ ঘণ্টা" : "1 Hour" },
    { key: "6", label: isBn ? "৬ ঘণ্টা" : "6 Hours" },
    { key: "12", label: isBn ? "১২ ঘণ্টা" : "12 Hours" },
    { key: "24", label: isBn ? "২৪ ঘণ্টা (১ দিন)" : "24 Hours (1 Day)" },
    { key: "72", label: isBn ? "৩ দিন" : "3 Days" },
    { key: "168", label: isBn ? "৭ দিন (১ সপ্তাহ)" : "7 Days" },
    { key: "always", label: isBn ? "স্থায়ী (যতক্ষণ না বন্ধ করা হয়)" : "Always (Until stopped)" },
    { key: "custom", label: isBn ? "কাস্টম তারিখ ও সময়" : "Custom Date & Time" },
  ];

  return (
    <div className="space-y-4 py-1">
      <Field label={isBn ? "নোটিশের শিরোনাম" : "Notice Title"}>
        <input
          style={inputStyle()}
          className={inputCls}
          placeholder={isBn ? "যেমন: আগামী জরুরি সাধারণ সভার তারিখ ঘোষণা" : "e.g. Emergency Society Meeting Notice"}
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </Field>

      <Field label={isBn ? "ক্যাটাগরি" : "Category"}>
        <select
          style={inputStyle()}
          className={inputCls}
          value={category}
          onChange={e => {
            const cat = e.target.value;
            setCategory(cat);
            if (cat === "Urgent") {
              setIsBulletin(true);
              setBulletinType("breaking");
            }
          }}
        >
          {categories.map(c => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
      </Field>

      {/* TV Bulletin / Quick Notice Toggle Section */}
      <div className="p-3.5 rounded-xl border space-y-3" style={{ backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio size={16} className={isBulletin ? "text-amber-500 animate-pulse-live" : "opacity-40"} />
            <div>
              <p className="text-xs font-bold">{isBn ? "টিভি বুলেটিনে প্রদর্শন করুন (Quick/Important Notice)" : "Broadcast on TV Bulletin"}</p>
              <p className="text-[10px]" style={{ color: C.onSurfaceVariant }}>
                {isBn ? "অ্যাপ ও ওয়েবের শীর্ষে স্ক্রোলিং বারে প্রদর্শিত হবে।" : "Will scroll live on the top banner of Web & Android app."}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={isBulletin}
            onChange={e => setIsBulletin(e.target.checked)}
            className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
          />
        </div>

        {isBulletin && (
          <div className="pt-2 border-t space-y-3 animate-in fade-in duration-200" style={{ borderColor: C.outlineVariant }}>
            {/* Importance / Type */}
            <div>
              <label className="block text-[11px] font-bold mb-1.5" style={{ color: C.onSurfaceVariant }}>
                {isBn ? "বুলেটিনের ধরন ও গুরুত্ব:" : "Bulletin Importance Level:"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBulletinType("breaking")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border text-center transition-all ${
                    bulletinType === "breaking"
                      ? "bg-red-600 text-white border-red-600 shadow-sm"
                      : "bg-white dark:bg-slate-800 text-red-600 border-red-300/60 opacity-70"
                  }`}
                >
                  {isBn ? "ব্রেকিং (লাল)" : "Breaking"}
                </button>
                <button
                  type="button"
                  onClick={() => setBulletinType("quick")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border text-center transition-all ${
                    bulletinType === "quick"
                      ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                      : "bg-white dark:bg-slate-800 text-amber-600 border-amber-300/60 opacity-70"
                  }`}
                >
                  {isBn ? "কুইক (হলুদ)" : "Quick"}
                </button>
                <button
                  type="button"
                  onClick={() => setBulletinType("important")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border text-center transition-all ${
                    bulletinType === "important"
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                      : "bg-white dark:bg-slate-800 text-emerald-600 border-emerald-300/60 opacity-70"
                  }`}
                >
                  {isBn ? "জরুরি (সবুজ)" : "Important"}
                </button>
              </div>
            </div>

            {/* Appearance Duration Setting */}
            <div>
              <label className="block text-[11px] font-bold mb-1.5" style={{ color: C.onSurfaceVariant }}>
                {isBn ? "বার্তাটি কত সময় প্রদর্শিত হবে (Appearance Duration / Expiry):" : "How long will the notice appear (Duration / Expiry):"}
              </label>
              <select
                style={inputStyle()}
                className={inputCls}
                value={durationOption}
                onChange={e => setDurationOption(e.target.value)}
              >
                {durationPresets.map(dp => (
                  <option key={dp.key} value={dp.key}>{dp.label}</option>
                ))}
              </select>
            </div>

            {/* Custom Expiry Picker if custom selected */}
            {durationOption === "custom" && (
              <div className="pt-1">
                <label className="block text-[11px] font-semibold mb-1" style={{ color: C.outline }}>
                  {isBn ? "মেয়াদোত্তীর্ণের সুনির্দিষ্ট তারিখ ও সময় নির্ধারণ করুন:" : "Set exact expiration date & time:"}
                </label>
                <input
                  type="datetime-local"
                  style={inputStyle()}
                  className={inputCls}
                  value={customExpiryDate}
                  onChange={e => setCustomExpiryDate(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <Field label={isBn ? "নোটিশের বিস্তারিত বক্তব্য" : "Notice Message"}>
        <textarea
          style={inputStyle()}
          className={inputCls}
          rows={4}
          placeholder={isBn ? "নোটিশের পূর্ণাঙ্গ বিবরণ লিখুন..." : "Write detailed notice message..."}
          value={body}
          onChange={e => setBody(e.target.value)}
        />
      </Field>

      <Btn
        full
        onClick={() => onSubmit({
          title,
          body,
          category,
          isBulletin,
          bulletinType,
          durationOption,
          customExpiryDate,
        })}
      >
        {initialData
          ? (isBn ? "আপডেট সংরক্ষণ করুন" : "Save Changes")
          : (isBn ? "নোটিশ প্রকাশ করুন" : "Publish Notice")}
      </Btn>
    </div>
  );
}
