import React, { useState, useRef } from "react";
import {
  LifeBuoy, Plus, Camera, Image, Video, Paperclip, Trash2, Eye, Play, X,
  Maximize2, Film, AlertCircle, Download, ExternalLink
} from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Empty, Modal, SectionTitle } from "../components/primitives";
import { C } from "../theme";
import { uid, nowISO, fmtDate } from "../utils";

export default function Tickets({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [form, setForm] = useState(null);
  const [mediaPreviewModal, setMediaPreviewModal] = useState(null); // { type: 'image'|'video', url: '', name: '' }
  const mine = (db.tickets || []).filter(t => t.residentId === session.id).sort((a, b) => new Date(b.date) - new Date(a.date));

  const submit = (subject, category, description, attachments = []) => {
    if (!subject.trim() || !description.trim()) return;
    const newTicket = {
      id: uid("tk"),
      residentId: session.id,
      residentName: session.name,
      subject,
      category,
      description,
      attachments,
      status: "open",
      response: "",
      date: nowISO()
    };

    // Backup attachments to localStorage for immediate resilience
    if (attachments && attachments.length > 0) {
      try {
        localStorage.setItem(`kc_ticket_att_${newTicket.id}`, JSON.stringify(attachments));
      } catch (_) {}
    }

    persist(d => logActivity({
      ...d,
      tickets: [newTicket, ...(d.tickets || []).filter(x => x.id !== newTicket.id)]
    }, session.name, `Submitted support ticket: ${subject}${attachments.length ? ` (${attachments.length} attachments)` : ""}`));

    toast(isBn ? "টিকিট ও প্রমাণাদি সফলভাবে জমা হয়েছে।" : "Ticket with attachments submitted.");
    setForm(null);
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
      <SectionTitle action={<Btn size="sm" icon={Plus} onClick={() => setForm(true)}>{isBn ? "নতুন টিকিট" : "New ticket"}</Btn>}>
        {isBn ? "সহায়তা ও অভিযোগ টিকিট" : "Support tickets"}
      </SectionTitle>
      
      <div className="flex flex-col gap-2.5">
        {mine.map(tk => (
          <Card key={tk.id} className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm" style={{ color: C.onSurface }}>{tk.subject}</p>
              <Badge tone={tk.status === "resolved" ? "success" : tk.status === "in_progress" ? "warning" : "neutral"}>
                {statusMap[tk.status] || tk.status}
              </Badge>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: C.onSurfaceVariant }}>{tk.description}</p>

            {/* Attached Photos & Short Videos Display */}
            {tk.attachments && tk.attachments.length > 0 && (
              <div className="pt-2 border-t space-y-2" style={{ borderColor: C.outlineVariant }}>
                <p className="text-[11px] font-bold flex items-center gap-1.5" style={{ color: C.onSurface }}>
                  <Paperclip size={13} className="text-emerald-500" />
                  <span>{isBn ? `সংযুক্ত ছবি ও ভিডিও (${tk.attachments.length} টি)` : `Attached Media (${tk.attachments.length})`}</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                            <div className="w-9 h-9 rounded-full bg-emerald-600/90 flex items-center justify-center text-white shadow-lg">
                              <Play size={16} className="ml-0.5" />
                            </div>
                          </div>
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-bold text-white flex items-center gap-0.5">
                            <Film size={10} /> Video
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
                            <Eye size={18} className="text-white drop-shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[11px]" style={{ color: C.outline }}>
              {categoryMap[tk.category] || tk.category} · {fmtDate(tk.date)}
            </p>

            {tk.response && (
              <div className="mt-2 p-2.5 rounded-xl text-xs" style={{ backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer }}>
                <span className="font-bold">{isBn ? "কমিটির প্রতিক্রিয়া: " : "Committee response: "}</span>
                {tk.response}
              </div>
            )}
          </Card>
        ))}

        {mine.length === 0 && (
          <Empty
            icon={LifeBuoy}
            title={isBn ? "এখনো কোনো টিকিট নেই" : "No tickets yet"}
            subtitle={isBn ? "যেকোনো সমস্যা বা অভিযোগ জানান, কার্যনির্বাহী পরিষদ দ্রুত উত্তর দেবে।" : "Raise an issue and the committee will respond here."}
          />
        )}
      </div>

      {/* Ticket Submission Modal */}
      <Modal open={!!form} onClose={() => setForm(null)} title={isBn ? "নতুন সহায়তা ও অভিযোগ টিকিট" : "Submit a support ticket"}>
        <TicketForm onSubmit={submit} lang={lang} isBn={isBn} toast={toast} />
      </Modal>

      {/* Fullscreen Media Preview Modal */}
      <Modal open={!!mediaPreviewModal} onClose={() => setMediaPreviewModal(null)} title={mediaPreviewModal?.name || (isBn ? "মিডিয়া প্রিভিউ" : "Attachment Preview")}>
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

export function TicketForm({ onSubmit, lang = "en", isBn = false, toast }) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Maintenance");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const categories = [
    { key: "Maintenance", label: isBn ? "রক্ষণাবেক্ষণ" : "Maintenance" },
    { key: "Security", label: isBn ? "নিরাপত্তা" : "Security" },
    { key: "Billing", label: isBn ? "বিলিং / চাঁদা" : "Billing" },
    { key: "Noise", label: isBn ? "শব্দ দূষণ" : "Noise" },
    { key: "Other", label: isBn ? "অন্যান্য" : "Other" },
  ];

  // Helper: compress image to max 1280px dimension to ensure fast dataURL processing
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const maxDim = 1280;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Process selected file(s) for images & short videos
  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);

    const newAttachments = [];
    const MAX_IMAGE_SIZE = 12 * 1024 * 1024; // 12MB raw (will be compressed)
    const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (!isImage && !isVideo) {
        if (toast) toast(isBn ? "শুধুমাত্র ছবি ও ভিডিও ফাইল নির্বাচন করুন।" : "Please choose photo or video files only.", "error");
        continue;
      }

      if (isImage && file.size > MAX_IMAGE_SIZE) {
        if (toast) toast(isBn ? `"${file.name}" ছবির সাইজ অনেক বড়।` : `Image "${file.name}" exceeds 12MB limit.`, "error");
        continue;
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        if (toast) toast(isBn ? `"${file.name}" ভিডিওর সাইজ ২৫MB এর বেশি (ছোট ভিডিও দিন)।` : `Video "${file.name}" exceeds 25MB limit. Please upload a short video.`, "error");
        continue;
      }

      try {
        let dataUrl = "";
        if (isImage) {
          dataUrl = await compressImage(file);
        } else {
          dataUrl = await readFileAsDataURL(file);
        }

        if (dataUrl) {
          newAttachments.push({
            id: uid("att"),
            name: file.name,
            type: isVideo ? "video" : "image",
            size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
            url: dataUrl,
          });
        }
      } catch (err) {
        console.error("Error reading attachment:", err);
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    setIsProcessing(false);
  };

  const removeAttachment = (attId) => {
    setAttachments(prev => prev.filter(a => a.id !== attId));
  };

  return (
    <div className="space-y-3.5">
      <Field label={isBn ? "বিষয়" : "Subject"}>
        <input
          style={inputStyle()}
          className={inputCls}
          placeholder={isBn ? "যেমন: পানির লাইনের সমস্যা" : "e.g. Water line issue"}
          value={subject}
          onChange={e => setSubject(e.target.value)}
        />
      </Field>

      <Field label={isBn ? "ক্যাটাগরি" : "Category"}>
        <select style={inputStyle()} className={inputCls} value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(c => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
      </Field>

      <Field label={isBn ? "বিস্তারিত বিবরণ" : "Description"}>
        <textarea
          style={inputStyle()}
          className={inputCls}
          rows={3}
          placeholder={isBn ? "সমস্যার বিস্তারিত বিবরণ দিন..." : "Describe the issue in detail..."}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </Field>

      {/* Picture and Short Video Attachment Section */}
      <div className="p-3 rounded-xl border space-y-2.5" style={{ borderColor: C.outlineVariant, backgroundColor: C.surfaceContainer }}>
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold flex items-center gap-1.5" style={{ color: C.onSurface }}>
            <Paperclip size={14} className="text-emerald-500" />
            {isBn ? "ছবি ও শর্ট ভিডিও সংযুক্তি" : "Attach Photos & Short Videos"}
          </label>
          <span className="text-[10px] font-semibold" style={{ color: C.outline }}>
            {attachments.length > 0 ? `${attachments.length} ${isBn ? "টি ফাইল যুক্ত" : "attached"}` : (isBn ? "ঐচ্ছিক" : "Optional")}
          </span>
        </div>

        {/* Hidden File and Camera Inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          onChange={e => handleFiles(e.target.files)}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={e => handleFiles(e.target.files)}
          className="hidden"
        />

        {/* Action Buttons: Camera & Storage/Gallery */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border active:scale-95 transition-all shadow-sm"
            style={{ backgroundColor: C.surface, borderColor: C.outlineVariant, color: C.onSurface }}
          >
            <Camera size={16} className="text-emerald-500" />
            <span>{isBn ? "ক্যামেরা (ছবি/ভিডিও)" : "Take Photo / Video"}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border active:scale-95 transition-all shadow-sm"
            style={{ backgroundColor: C.surface, borderColor: C.outlineVariant, color: C.onSurface }}
          >
            <Image size={16} className="text-sky-500" />
            <span>{isBn ? "গ্যালারি / স্টোরেজ" : "Upload from Gallery"}</span>
          </button>
        </div>

        {/* Attached Files List & Previews */}
        {attachments.length > 0 && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            {attachments.map(att => (
              <div key={att.id} className="relative rounded-lg overflow-hidden border aspect-video bg-black/10 group" style={{ borderColor: C.outlineVariant }}>
                {att.type === "video" ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white relative">
                    <video src={att.url} className="w-full h-full object-cover opacity-70" />
                    <Play size={14} className="absolute text-white drop-shadow" />
                    <span className="absolute bottom-1 right-1 text-[8px] font-bold px-1 rounded bg-black/60 text-white">Video</span>
                  </div>
                ) : (
                  <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                )}
                
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors"
                  title="Remove"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {isProcessing && (
          <p className="text-[10px] font-bold animate-pulse text-emerald-500">
            {isBn ? "ফাইল প্রসেসিং হচ্ছে..." : "Processing media file..."}
          </p>
        )}
      </div>

      <Btn full onClick={() => onSubmit(subject, category, description, attachments)} disabled={!subject.trim() || !description.trim() || isProcessing}>
        {isBn ? "টিকিট জমা দিন" : "Submit ticket"}
      </Btn>
    </div>
  );
}
