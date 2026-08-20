import React, { useState } from "react";
import { Shield, Send, Paperclip, Eye, Play, Film } from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Avatar, Modal, SectionTitle } from "../../components/primitives";
import { C } from "../../theme";
import { fmtDate } from "../../utils";

export default function AdminTickets({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const canManage = session.permissions.canManageComplaints;
  const [respondTo, setRespondTo] = useState(null);
  const [mediaPreviewModal, setMediaPreviewModal] = useState(null);
  const sorted = [...(db.tickets || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

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
    <div className="w-full max-w-full overflow-x-hidden">
      <SectionTitle>{isBn ? "সদস্য অভিযোগ ও সহায়তা টিকিট" : "Support tickets"}</SectionTitle>
      {!canManage && (
        <div className="mb-4 p-3 rounded-xl text-xs flex items-center gap-2" style={{ backgroundColor: C.errorContainer, color: C.onErrorContainer }}>
          <Shield size={14} /> {isBn ? "শুধুমাত্র প্রদর্শন — আপনার canManageComplaints অনুমতি নেই।" : "View-only — you lack canManageComplaints permission."}
        </div>
      )}
      <div className="flex flex-col gap-2.5">
        {sorted.map(tk => (
          <Card key={tk.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar name={tk.residentName} size={28} />
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900 truncate">{tk.subject}</p>
                  <p className="text-[11px] text-gray-500">
                    {tk.residentName} · {categoryMap[tk.category] || tk.category} · {fmtDate(tk.date)}
                  </p>
                </div>
              </div>
              <Badge tone={tk.status === "resolved" ? "success" : tk.status === "in_progress" ? "warning" : "neutral"}>
                {statusMap[tk.status] || tk.status}
              </Badge>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">{tk.description}</p>

            {/* Attached Photos & Short Videos Display */}
            {tk.attachments && tk.attachments.length > 0 && (
              <div className="pt-2 border-t space-y-1.5" style={{ borderColor: C.outlineVariant }}>
                <p className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
                  <Paperclip size={12} className="text-emerald-700" />
                  {isBn ? `সদস্যের সংযুক্ত প্রমাণাদি (${tk.attachments.length} টি ফাইল)` : `Attached Evidence (${tk.attachments.length})`}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {tk.attachments.map((att, idx) => (
                    <div
                      key={att.id || idx}
                      onClick={() => setMediaPreviewModal(att)}
                      className="relative group rounded-xl overflow-hidden border border-gray-200 bg-black/5 aspect-video flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      {att.type === "video" ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-slate-900 text-white">
                          <video src={att.url} className="w-full h-full object-cover opacity-80" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="w-7 h-7 rounded-full bg-emerald-600/90 flex items-center justify-center text-white shadow-md">
                              <Play size={12} className="ml-0.5" />
                            </div>
                          </div>
                          <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/70 text-[8px] font-bold text-white flex items-center gap-0.5">
                            <Film size={9} /> Video
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-full relative">
                          <img src={att.url} alt={att.name || "Attachment"} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Eye size={15} className="text-white drop-shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tk.response && (
              <div className="p-2.5 rounded-xl text-xs" style={{ backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer }}>
                <span className="font-bold">{isBn ? "কমিটির প্রদত্ত উত্তর: " : "Committee response: "}</span>
                {tk.response}
              </div>
            )}

            {canManage && tk.status !== "resolved" && (
              <div className="pt-2 flex justify-end">
                <Btn size="sm" variant="outline" onClick={() => setRespondTo(tk)}>
                  {isBn ? "উত্তর দিন" : "Respond"}
                </Btn>
              </div>
            )}
          </Card>
        ))}

        {sorted.length === 0 && (
          <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-2xl border border-gray-100">
            {isBn ? "কোনো সহায়তা টিকিট নেই।" : "No support tickets found."}
          </div>
        )}
      </div>

      <Modal open={!!respondTo} onClose={() => setRespondTo(null)} title={isBn ? "টিকিটের উত্তর প্রদান" : "Respond to ticket"}>
        {respondTo && <RespondForm ticket={respondTo} onSubmit={respond} lang={lang} isBn={isBn} />}
      </Modal>

      {/* Fullscreen Media Preview Modal */}
      <Modal open={!!mediaPreviewModal} onClose={() => setMediaPreviewModal(null)} title={mediaPreviewModal?.name || (isBn ? "সংযুক্ত মিডিয়া" : "Attachment Preview")}>
        <div className="flex flex-col items-center justify-center p-2">
          {mediaPreviewModal?.type === "video" ? (
            <video
              src={mediaPreviewModal.url}
              controls
              autoPlay
              playsInline
              className="max-h-[70vh] w-full rounded-xl shadow-lg bg-black"
            />
          ) : (
            <img
              src={mediaPreviewModal?.url}
              alt="Preview"
              className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-lg"
            />
          )}
          <div className="w-full flex justify-end pt-3">
            <Btn variant="outline" size="sm" onClick={() => setMediaPreviewModal(null)}>
              {isBn ? "বন্ধ করুন" : "Close"}
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function RespondForm({ ticket, onSubmit, lang = "en", isBn = false }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("in_progress");

  return (
    <div className="space-y-3">
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
