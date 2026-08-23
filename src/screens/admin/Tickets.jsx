import React, { useState } from "react";
import { Shield, Send, Paperclip, Eye, Play, Film, Download, ExternalLink } from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Avatar, Modal, SectionTitle, Empty } from "../../components/primitives";
import { C } from "../../theme";
import { fmtDate } from "../../utils";

export default function AdminTickets({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const canManage = session.permissions?.canManageComplaints || session.role === "admin";
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
          <Card key={tk.id} className="p-4 space-y-2.5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar name={tk.residentName} size={28} />
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: C.onSurface }}>{tk.subject}</p>
                  <p className="text-[11px]" style={{ color: C.outline }}>
                    {tk.residentName} · {categoryMap[tk.category] || tk.category} · {fmtDate(tk.date)}
                  </p>
                </div>
              </div>
              <Badge tone={tk.status === "resolved" ? "success" : tk.status === "in_progress" ? "warning" : "neutral"}>
                {statusMap[tk.status] || tk.status}
              </Badge>
            </div>

            <p className="text-xs leading-relaxed p-2.5 rounded-xl border" style={{ backgroundColor: C.surfaceContainer, borderColor: C.outlineVariant, color: C.onSurfaceVariant }}>
              {tk.description}
            </p>

            {/* Attached Photos & Short Videos Display */}
            {tk.attachments && tk.attachments.length > 0 && (
              <div className="pt-2 border-t space-y-2" style={{ borderColor: C.outlineVariant }}>
                <p className="text-[11px] font-bold flex items-center gap-1.5" style={{ color: C.onSurface }}>
                  <Paperclip size={13} className="text-emerald-500" />
                  <span>{isBn ? `সদস্যের সংযুক্ত প্রমাণাদি (${tk.attachments.length} টি ফাইল)` : `Attached Evidence (${tk.attachments.length})`}</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {tk.attachments.map((att, idx) => (
                    <div
                      key={att.id || idx}
                      onClick={() => setMediaPreviewModal(att)}
                      className="relative group rounded-xl overflow-hidden border aspect-video flex items-center justify-center cursor-pointer hover:opacity-95 transition-all shadow-sm"
                      style={{ borderColor: C.outlineVariant, backgroundColor: C.surfaceContainer }}
                    >
                      {att.type === "video" ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-slate-950 text-white">
                          <video src={att.url} className="w-full h-full object-cover opacity-85" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-emerald-600/90 flex items-center justify-center text-white shadow-md">
                              <Play size={14} className="ml-0.5" />
                            </div>
                          </div>
                          <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[8px] font-bold text-white flex items-center gap-0.5">
                            <Film size={9} /> Video
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-full relative bg-slate-900/10 flex items-center justify-center">
                          <img
                            src={att.url}
                            alt={att.name || "Attachment"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Eye size={16} className="text-white drop-shadow opacity-0 group-hover:opacity-100 transition-opacity" />
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
          <Empty
            icon={Shield}
            title={isBn ? "কোনো সহায়তা টিকিট নেই।" : "No support tickets found."}
          />
        )}
      </div>

      <Modal open={!!respondTo} onClose={() => setRespondTo(null)} title={isBn ? "টিকিটের উত্তর প্রদান" : "Respond to ticket"}>
        {respondTo && <RespondForm ticket={respondTo} onSubmit={respond} lang={lang} isBn={isBn} />}
      </Modal>

      {/* Fullscreen Media Preview Modal */}
      <Modal open={!!mediaPreviewModal} onClose={() => setMediaPreviewModal(null)} title={mediaPreviewModal?.name || (isBn ? "সংযুক্ত মিডিয়া" : "Attachment Preview")}>
        <div className="flex flex-col items-center justify-center p-1 space-y-3">
          {mediaPreviewModal?.type === "video" ? (
            <video
              src={mediaPreviewModal.url}
              controls
              autoPlay
              playsInline
              className="max-h-[70vh] w-full rounded-2xl shadow-xl bg-black"
            />
          ) : (
            <img
              src={mediaPreviewModal?.url}
              alt="Preview"
              className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain shadow-xl"
            />
          )}
          <div className="w-full flex items-center justify-between pt-2 border-t" style={{ borderColor: C.outlineVariant }}>
            <span className="text-xs" style={{ color: C.onSurfaceVariant }}>{mediaPreviewModal?.size || ""}</span>
            <div className="flex items-center gap-2">
              {mediaPreviewModal?.url && (
                <a
                  href={mediaPreviewModal.url}
                  download={mediaPreviewModal.name || "attachment"}
                  className="flex items-center gap-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors"
                  style={{ backgroundColor: C.primaryContainer, color: C.onPrimaryContainer }}
                >
                  <Download size={13} /> {isBn ? "ডাউনলোড" : "Download"}
                </a>
              )}
              <Btn variant="outline" size="sm" onClick={() => setMediaPreviewModal(null)}>
                {isBn ? "বন্ধ করুন" : "Close"}
              </Btn>
            </div>
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

      <Field label={isBn ? "কমিটির লিখিত প্রতিক্রিয়া" : "Committee Response"}>
        <textarea
          style={inputStyle()}
          className={inputCls}
          rows={3}
          placeholder={isBn ? "অভিযোগ বা সমস্যার সমাধান বা পদক্ষেপ লিখুন..." : "Write actions taken or official reply..."}
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </Field>

      <Btn full onClick={() => onSubmit(ticket, text, status)} disabled={!text.trim()}>
        {isBn ? "উত্তর প্রদান সম্পন্ন করুন" : "Submit Response"}
      </Btn>
    </div>
  );
}
