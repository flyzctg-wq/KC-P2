import React, { useState, useMemo, useRef } from "react";
import {
  FileText, Send, Printer, Download, MessageCircle, Plus, Search, Filter,
  Shield, Check, Trash2, Eye, Edit3, Copy, Sparkles, RefreshCw, Calendar,
  Building, User, Phone, CheckCircle2, ChevronRight, ArrowLeft, Share2, Sliders
} from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Empty, Modal, SectionTitle } from "../../components/primitives";
import { C } from "../../theme";
import { uid, fmtDate, cleanPhone } from "../../utils";

const LETTER_TEMPLATES = [
  {
    id: "advisor_nomination",
    title: "উপদেষ্টা পরিষদের সদস্য পদে মনোনয়ন (Advisory Nomination)",
    memoPrefix: "WC/C/2026/01",
    recipient: "জনাব সাহেদ ইকবাল বাবু\nকাউন্সিলর, ২নং ওয়ার্ড\nচট্টগ্রাম সিটি কর্পোরেশন,\nচট্টগ্রাম।",
    subject: "২০২৬-২০২৭ ইং মেয়াদের জন্য কুঞ্জছায়া ক্লাবের উপদেষ্টা পরিষদের উপদেষ্টা পদে মনোনয়ন করা প্রসঙ্গে।",
    salutation: "প্রিয় মহোদয়,",
    body: "আসসালামু আলাইকুম। গত ২৬মার্চ ২০২১ তারিখ কুঞ্জছায়া ক্লাব, কুঞ্জছায়া আবাসিক এলাকা, বায়েজিদ বোস্তামী প্রতিষ্ঠিত হয়। অত্যন্ত আনন্দের সাথে জানানো যাচ্ছে যে, কুঞ্জছায়া ক্লাব এর কার্যনির্বাহী কমিটির সিদ্ধান্ত অনুযায়ী আপনাকে ক্লাবের উপদেষ্টা পদে মনোনীত করা হয়েছে।\n\nউক্ত পদে দায়িত্ব পালনে আপনার সদয় সম্মতি আমাদের ক্লাবের কার্যক্রমকে আরও গতিশীল করবে।",
    signatoryLeftTitle: "আহ্বায়কঃ",
    signatoryLeftName: "জাকারিয়া হাসান",
    signatoryRightTitle: "সদস্য সচিবঃ",
    signatoryRightName: "খালিদ হাসান",
  },
  {
    id: "general_meeting_notice",
    title: "সাধারণ সভার জরুরি বিজ্ঞপ্তি (GM Notice)",
    memoPrefix: "KC/GM/2026",
    recipient: "কুঞ্জছায়া ক্লাবের সকল সম্মানিত সদস্যবৃন্দ,\nকুঞ্জছায়া আবাসিক এলাকা, বায়েজিদ বোস্তামী, চট্টগ্রাম।",
    subject: "কুঞ্জছায়া ক্লাবের বার্ষিক সাধারণ সভা (AGM) ও জরুরি মতবিনিময় প্রসঙ্গে।",
    salutation: "সম্মানিত সদস্যবৃন্দ,",
    body: "আসসালামু আলাইকুম। কুঞ্জছায়া ক্লাবের সকল সদস্যের সদয় অবগতির জন্য জানানো যাচ্ছে যে, আগামী [তারিখ লিখুন] রোজ [বার] বিকেল ৫:০০ ঘটিকায় ক্লাবের প্রধান কার্যালয়ে এক জরুরি সাধারণ সভা অনুষ্ঠিত হবে।\n\nউক্ত সভায় ক্লাবের বার্ষিক উন্নয়ন পরিকল্পনা, আয়-ব্যয় হিসাব অনুমোদন ও নিরাপত্তা বিষয়ক গুরুত্বপূর্ণ সিদ্ধান্ত গৃহীত হবে।\n\nসভায় আপনার উপস্থিতি সংগঠনের অগ্রযাত্রাকে বেগবান করবে।",
    signatoryLeftTitle: "সভাপতিঃ",
    signatoryLeftName: "জাকারিয়া হাসান",
    signatoryRightTitle: "সাধারণ সম্পাদকঃ",
    signatoryRightName: "খালিদ হাসান",
  },
  {
    id: "city_corporation_request",
    title: "সিটি কর্পোরেশন / কাউন্সিলর বরাবর আবেদন (CCC Petition)",
    memoPrefix: "KC/DEV/2026",
    recipient: "বরাবর\nকাউন্সিলর মহোদয়, ২নং জালালাবাদ ওয়ার্ড\nচট্টগ্রাম সিটি কর্পোরেশন, চট্টগ্রাম।",
    subject: "কুঞ্জছায়া আবাসিক এলাকার সড়ক বাতি ও ড্রেনেজ ব্যবস্থা সংস্কারের আবেদন।",
    salutation: "মহোদয়,",
    body: "যথাযথ সম্মান প্রদর্শনপূর্বক বিনীত নিবেদন এই যে, বায়েজিদ থানাধীন কুঞ্জছায়া আবাসিক এলাকায় সম্প্রতি সড়ক বাতি বিকল এবং ড্রেনেজ সমস্যা দেখা দিয়েছে। জনস্বার্থে ও এলাকার নিরাপত্তা জোরদারে অতি দ্রুত বৈদ্যুতিক বাতি স্থাপন ও ড্রেন সংস্কারের প্রয়োজনীয় ব্যবস্থা গ্রহণে আপনার সদয় সহযোগিতা কামনা করছি।",
    signatoryLeftTitle: "সভাপতিঃ",
    signatoryLeftName: "জাকারিয়া হাসান",
    signatoryRightTitle: "সাধারণ সম্পাদকঃ",
    signatoryRightName: "খালিদ হাসান",
  },
  {
    id: "membership_welcome",
    title: "নতুন সদস্যপদ অনুমোদন পত্র (Membership Approval)",
    memoPrefix: "KC/MEM/2026",
    recipient: "বরাবর,\nসম্মানিত সদস্য মহোদয়,\nকুঞ্জছায়া আবাসিক এলাকা, চট্টগ্রাম।",
    subject: "কুঞ্জছায়া ক্লাবের সাধারণ সদস্যপদ অনুমোদন ও অভিনন্দন জ্ঞাপন প্রসঙ্গে।",
    salutation: "প্রিয় সদস্য,",
    body: "আন্তরিক শুভেচ্ছা ও অভিনন্দন। আপনার আবেদনের প্রেক্ষিতে কুঞ্জছায়া ক্লাবের সংবিধানের ধারা-১০ মোতাবেক আপনার সদস্যপদ আনন্দের সাথে অনুমোদন করা হলো।\n\nকুঞ্জছায়া পরিবারের অংশ হিসেবে আপনি এলাকার উন্নয়ন, সমাজসেবা ও পারস্পরিক সৌহার্দ্য রক্ষায় সক্রিয় ভূমিকা রাখবেন বলে আমরা আশাবাদী।",
    signatoryLeftTitle: "সভাপতিঃ",
    signatoryLeftName: "জাকারিয়া হাসান",
    signatoryRightTitle: "সাধারণ সম্পাদকঃ",
    signatoryRightName: "খালিদ হাসান",
  },
  {
    id: "custom_blank",
    title: "কাস্টম অফিশিয়াল পত্র / মেমো (Custom Blank Letter)",
    memoPrefix: "KC/ADM/2026",
    recipient: "বরাবর,\n[প্রাপকের নাম / পদবী]\n[প্রতিষ্ঠান / ঠিকানা]",
    subject: "বিষয়: [পত্রের বিষয় লিখুন]",
    salutation: "জনাব / প্রিয় মহোদয়,",
    body: "[এখানে আপনার পত্রের মূল বিবরণ বিস্তারিত লিখুন...]",
    signatoryLeftTitle: "সভাপতি / আহ্বায়কঃ",
    signatoryLeftName: "জাকারিয়া হাসান",
    signatoryRightTitle: "সাধারণ সম্পাদকঃ",
    signatoryRightName: "খালিদ হাসান",
  }
];

export default function AdminLetters({ session = {}, db = {}, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const isTopTier = session?.role === "admin" && (session?.post === "President" || session?.post === "General Secretary");
  const canManage = session?.role === "admin" && (session?.permissions?.canManageNotices || isTopTier);

  // View States
  const [viewMode, setViewMode] = useState("editor"); // "editor" | "archive"
  const [searchQuery, setSearchQuery] = useState("");

  // Letter Form State
  const [memoNo, setMemoNo] = useState(`WC/C/2026/01-${Math.floor(100 + Math.random() * 900)}`);
  const [letterDate, setLetterDate] = useState("৩১/০৭/২০২৬");
  const [recipient, setRecipient] = useState(LETTER_TEMPLATES[0].recipient);
  const [recipientPhone, setRecipientPhone] = useState("");
  const [subject, setSubject] = useState(LETTER_TEMPLATES[0].subject);
  const [salutation, setSalutation] = useState(LETTER_TEMPLATES[0].salutation);
  const [body, setBody] = useState(LETTER_TEMPLATES[0].body);
  const [signatoryLeftTitle, setSignatoryLeftTitle] = useState(LETTER_TEMPLATES[0].signatoryLeftTitle);
  const [signatoryLeftName, setSignatoryLeftName] = useState(LETTER_TEMPLATES[0].signatoryLeftName);
  const [signatoryRightTitle, setSignatoryRightTitle] = useState(LETTER_TEMPLATES[0].signatoryRightTitle);
  const [signatoryRightName, setSignatoryRightName] = useState(LETTER_TEMPLATES[0].signatoryRightName);

  // Fine Alignment Offset Controls
  const [dateTopOffset, setDateTopOffset] = useState(8.0); // % from top
  const [dateRightOffset, setDateRightOffset] = useState(13.5); // % from right
  const [memoTopOffset, setMemoTopOffset] = useState(12.8); // % from top
  const [contentTopOffset, setContentTopOffset] = useState(16.5); // % from top
  const [fontSizeScale, setFontSizeScale] = useState(1.0); // font size multiplier
  const [showAdjustments, setShowAdjustments] = useState(false);

  const letterRef = useRef(null);

  const lettersList = useMemo(() => db.letters || [], [db.letters]);

  const filteredLetters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return lettersList;
    return lettersList.filter(l =>
      (l.memoNo || "").toLowerCase().includes(q) ||
      (l.subject || "").toLowerCase().includes(q) ||
      (l.recipient || "").toLowerCase().includes(q)
    );
  }, [lettersList, searchQuery]);

  const handleApplyTemplate = (tmplId) => {
    const tmpl = LETTER_TEMPLATES.find(t => t.id === tmplId);
    if (!tmpl) return;
    setMemoNo(`${tmpl.memoPrefix}-${Math.floor(100 + Math.random() * 900)}`);
    setRecipient(tmpl.recipient);
    setSubject(tmpl.subject);
    setSalutation(tmpl.salutation);
    setBody(tmpl.body);
    setSignatoryLeftTitle(tmpl.signatoryLeftTitle);
    setSignatoryLeftName(tmpl.signatoryLeftName);
    setSignatoryRightTitle(tmpl.signatoryRightTitle);
    setSignatoryRightName(tmpl.signatoryRightName);
    toast(isBn ? `"${tmpl.title}" টেমপ্লেট লোড করা হয়েছে!` : `Loaded template: ${tmpl.title}`);
  };

  const handleSaveLetter = () => {
    if (!subject.trim() || !body.trim()) {
      toast(isBn ? "অনুগ্রহ করে বিষয় ও পত্রের বিবরণ লিখুন।" : "Please enter subject and letter body.", "error");
      return;
    }

    const newLetter = {
      id: uid("let"),
      memoNo: memoNo.trim(),
      date: letterDate,
      recipient: recipient.trim(),
      recipientPhone: recipientPhone.trim(),
      subject: subject.trim(),
      salutation: salutation.trim(),
      body: body.trim(),
      signatoryLeftTitle,
      signatoryLeftName,
      signatoryRightTitle,
      signatoryRightName,
      dateTopOffset,
      dateRightOffset,
      memoTopOffset,
      contentTopOffset,
      fontSizeScale,
      issuedBy: session?.name || "President / General Secretary",
      createdAt: new Date().toISOString(),
    };

    persist(d => logActivity({
      ...d,
      letters: [newLetter, ...(d.letters || [])]
    }, session?.name || "Admin", `Issued official letter [Memo: ${memoNo}] "${subject}"`));

    toast(isBn ? `অফিসিয়াল পত্রটি স্মারক রেজিস্টারে সংরক্ষিত হয়েছে! [স্মারক: ${memoNo}]` : `Letter saved to official register! [Memo: ${memoNo}]`);
  };

  // High-Resolution 1-to-1 Pixel-Perfect Print & PDF Export
  const handlePrint = () => {
    const canvas = document.getElementById("official-letterhead-canvas");
    if (!canvas) {
      window.print();
      return;
    }

    const printWindow = window.open("", "_blank", "width=850,height=1150");
    if (!printWindow) {
      window.print();
      return;
    }

    const canvasHtml = canvas.outerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
        <head>
          <meta charset="utf-8" />
          <title>${subject || "Official Letter - Kunjachaya Club"}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Kalpurush&family=SolaimanLipi&display=swap');
            
            @page {
              size: A4 portrait;
              margin: 0;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body {
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              font-family: 'SolaimanLipi', 'Kalpurush', 'Inter', sans-serif;
            }
            #official-letterhead-canvas {
              width: 210mm !important;
              height: 297mm !important;
              max-width: 210mm !important;
              min-height: 297mm !important;
              position: relative !important;
              margin: 0 !important;
              border: none !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              background-image: url('/letterhead.png') !important;
              background-size: 100% 100% !important;
              background-repeat: no-repeat !important;
              background-position: center center !important;
              overflow: hidden !important;
            }
          </style>
        </head>
        <body>
          ${canvasHtml}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 400);
            };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleWhatsAppSend = (customPhone, customLetter) => {
    const targetPhone = cleanPhone(customPhone || recipientPhone);
    const letterToShare = customLetter || {
      memoNo,
      date: letterDate,
      recipient,
      subject,
      body,
      signatoryLeftTitle,
      signatoryLeftName,
      signatoryRightTitle,
      signatoryRightName
    };

    const text = `*কুঞ্জছায়া ক্লাব - অফিসিয়াল পত্র / নোটিশ*
স্মারক নংঃ ${letterToShare.memoNo}
তারিখঃ ${letterToShare.date}

${letterToShare.subject}

${letterToShare.salutation || ""}
${letterToShare.body}

নিবেদক:
${letterToShare.signatoryLeftTitle || "আহ্বায়কঃ"} ${letterToShare.signatoryLeftName || ""}
${letterToShare.signatoryRightTitle || "সদস্য সচিবঃ"} ${letterToShare.signatoryRightName || ""}

কুঞ্জছায়া আবাসিক এলাকা, বায়েজিদ থানা রোড, ২নং জালালাবাদ, চট্টগ্রাম-৪২১০।`;

    if (targetPhone) {
      window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`, "_blank");
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3" style={{ borderColor: C.outlineVariant }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 text-white flex items-center justify-center font-black shadow-md">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black heading text-gray-900 leading-tight">
              {isBn ? "অফিসিয়াল লেটারহেড ও স্মারক ইস্যু" : "Official Letterhead & Notice Suite"}
            </h1>
            <p className="text-xs text-gray-500">
              {isBn ? "কুঞ্জছায়া ক্লাবের প্রাতিষ্ঠানিক প্যাডে পত্র রচনা, স্মারক রেজিস্টার ও হোয়াটসঅ্যাপ প্রেরণ" : "Issue official letters on branded letterhead, export PDF & send to WhatsApp"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("editor")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${viewMode === "editor" ? "bg-emerald-700 text-white shadow-sm" : "bg-slate-100 text-gray-700 hover:bg-slate-200"}`}
          >
            {isBn ? "নতুন পত্র রচনা" : "Letter Composer"}
          </button>
          <button
            onClick={() => setViewMode("archive")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${viewMode === "archive" ? "bg-emerald-700 text-white shadow-sm" : "bg-slate-100 text-gray-700 hover:bg-slate-200"}`}
          >
            {isBn ? "স্মারক রেজিস্টার" : "Letter Archive"} ({lettersList.length})
          </button>
        </div>
      </div>

      {viewMode === "editor" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: FORM CONTROLS & TEMPLATES (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Template Selector Card */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-600" />
                  {isBn ? "রেডিমেড টেমপ্লেট নির্বাচন করুন" : "Choose Letter Template"}
                </span>
                <button
                  onClick={() => setShowAdjustments(prev => !prev)}
                  className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 hover:underline"
                >
                  <Sliders size={12} /> {showAdjustments ? (isBn ? "প্যাডিং লুকান" : "Hide Tuning") : (isBn ? "প্যাডিং সমন্বয়" : "Fine Tune Layout")}
                </button>
              </div>
              <select
                onChange={e => handleApplyTemplate(e.target.value)}
                style={inputStyle()}
                className={inputCls + " text-xs font-semibold"}
              >
                {LETTER_TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>

              {/* Collapsible Fine Tuning Controls */}
              {showAdjustments && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-[11px] animate-in fade-in duration-150">
                  <p className="font-bold text-gray-700 border-b pb-1">প্যাডের টেক্সট পজিশন সমন্বয় (Layout Tuning)</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-500 font-semibold mb-0.5">তারিখ ওপরের দূরত্ব: {dateTopOffset}%</label>
                      <input
                        type="range"
                        min="5.0"
                        max="12.0"
                        step="0.2"
                        value={dateTopOffset}
                        onChange={e => setDateTopOffset(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 font-semibold mb-0.5">তারিখ ডানদিকের দূরত্ব: {dateRightOffset}%</label>
                      <input
                        type="range"
                        min="8.0"
                        max="22.0"
                        step="0.5"
                        value={dateRightOffset}
                        onChange={e => setDateRightOffset(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-500 font-semibold mb-0.5">স্মারক নং দূরত্ব: {memoTopOffset}%</label>
                      <input
                        type="range"
                        min="10.0"
                        max="16.0"
                        step="0.2"
                        value={memoTopOffset}
                        onChange={e => setMemoTopOffset(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 font-semibold mb-0.5">বডি টেক্সট শুরু: {contentTopOffset}%</label>
                      <input
                        type="range"
                        min="14.0"
                        max="22.0"
                        step="0.5"
                        value={contentTopOffset}
                        onChange={e => setContentTopOffset(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-500 font-semibold mb-0.5">ফন্ট সাইজ স্কেল: {fontSizeScale.toFixed(1)}x</label>
                    <input
                      type="range"
                      min="0.8"
                      max="1.3"
                      step="0.05"
                      value={fontSizeScale}
                      onChange={e => setFontSizeScale(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Letter Editor Form */}
            <Card className="p-4 space-y-3 text-xs">
              <h3 className="font-bold text-gray-900 border-b pb-2 flex items-center justify-between">
                <span>{isBn ? "পত্রের বিবরণ ও ফিল্ডসমূহ" : "Letter Details"}</span>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {isBn ? "লাইভ প্রিভিউ সক্রিয়" : "Live Preview"}
                </span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <Field label={isBn ? "স্মারক নং (Memo / Ref No.)" : "Memo / Ref No."}>
                  <input
                    style={inputStyle()}
                    className={inputCls}
                    value={memoNo}
                    onChange={e => setMemoNo(e.target.value)}
                    placeholder="WC/C/2026/01-001"
                  />
                </Field>

                <Field label={isBn ? "তারিখ (Date)" : "Date"}>
                  <input
                    style={inputStyle()}
                    className={inputCls}
                    value={letterDate}
                    onChange={e => setLetterDate(e.target.value)}
                    placeholder="৩১/০৭/২০২৬"
                  />
                </Field>
              </div>

              <Field label={isBn ? "প্রাপক / বরাবর (Recipient Details)" : "Recipient Address"}>
                <textarea
                  rows={3}
                  style={inputStyle()}
                  className={inputCls}
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="জনাব সাহেদ ইকবাল বাবু..."
                />
              </Field>

              <Field label={isBn ? "প্রাপকের মোবাইল নম্বর (হোয়াটসঅ্যাপের জন্য)" : "Recipient Mobile (for WhatsApp)"}>
                <input
                  style={inputStyle()}
                  className={inputCls}
                  value={recipientPhone}
                  onChange={e => setRecipientPhone(e.target.value)}
                  placeholder="01711-XXXXXX"
                />
              </Field>

              <Field label={isBn ? "বিষয় (Subject)" : "Subject"}>
                <input
                  style={inputStyle()}
                  className={inputCls}
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="বিষয়: ..."
                />
              </Field>

              <Field label={isBn ? "সম্ভাষণ (Salutation)" : "Salutation"}>
                <input
                  style={inputStyle()}
                  className={inputCls}
                  value={salutation}
                  onChange={e => setSalutation(e.target.value)}
                  placeholder="প্রিয় মহোদয়,"
                />
              </Field>

              <Field label={isBn ? "মূল বক্তব্য (Letter Content / Body)" : "Letter Body"}>
                <textarea
                  rows={7}
                  style={inputStyle()}
                  className={inputCls + " leading-relaxed"}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="পত্রের মূল বিবরণ লিখুন..."
                />
              </Field>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{isBn ? "বাম স্বাক্ষরকারী" : "Left Signatory"}</label>
                  <input
                    style={inputStyle()}
                    className={inputCls + " text-xs mb-1.5"}
                    value={signatoryLeftTitle}
                    onChange={e => setSignatoryLeftTitle(e.target.value)}
                    placeholder="আহ্বায়কঃ"
                  />
                  <input
                    style={inputStyle()}
                    className={inputCls + " text-xs font-bold"}
                    value={signatoryLeftName}
                    onChange={e => setSignatoryLeftName(e.target.value)}
                    placeholder="জাকারিয়া হাসান"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{isBn ? "ডান স্বাক্ষরকারী" : "Right Signatory"}</label>
                  <input
                    style={inputStyle()}
                    className={inputCls + " text-xs mb-1.5"}
                    value={signatoryRightTitle}
                    onChange={e => setSignatoryRightTitle(e.target.value)}
                    placeholder="সদস্য সচিবঃ"
                  />
                  <input
                    style={inputStyle()}
                    className={inputCls + " text-xs font-bold"}
                    value={signatoryRightName}
                    onChange={e => setSignatoryRightName(e.target.value)}
                    placeholder="খালিদ হাসান"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-3 border-t">
                <Btn full icon={Check} onClick={handleSaveLetter}>
                  {isBn ? "স্মারক রেজিস্টারে সংরক্ষণ করুন" : "Save to Official Register"}
                </Btn>
                <div className="flex items-center gap-2">
                  <Btn full variant="outline" icon={Printer} onClick={handlePrint}>
                    {isBn ? "প্রিন্ট / PDF" : "Print / PDF"}
                  </Btn>
                  <button
                    onClick={() => handleWhatsAppSend()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <MessageCircle size={15} /> WhatsApp
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT: A4 OFFICIAL LETTERHEAD CANVAS LIVE PREVIEW (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2 text-xs text-gray-500 font-semibold px-1">
              <span>{isBn ? "অফিসিয়াল প্যাড প্রিভিউ (A4 Format)" : "Official A4 Letterhead Preview"}</span>
              <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">210mm × 297mm Standard</span>
            </div>

            {/* A4 CANVAS CONTAINER */}
            <div
              id="official-letterhead-canvas"
              ref={letterRef}
              className="w-full max-w-[620px] aspect-[1/1.414] bg-white rounded-xl shadow-2xl relative overflow-hidden border border-gray-200 select-text"
              style={{
                backgroundImage: "url('/letterhead.png')",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center",
                boxSizing: "border-box",
                color: "#0f172a",
                fontFamily: "'Inter', 'Kalpurush', 'SolaimanLipi', sans-serif",
              }}
            >
              {/* 1. Date (তারিখ) - Placed directly inside the top orange bar */}
              <div
                className="absolute text-white font-bold tracking-wide select-all"
                style={{
                  top: `${dateTopOffset}%`,
                  right: `${dateRightOffset}%`,
                  fontSize: `${12.5 * fontSizeScale}px`,
                }}
              >
                তারিখঃ {letterDate}
              </div>

              {/* 2. Memo No. (স্মারক নং) - Below orange bar on the right */}
              <div
                className="absolute text-gray-900 font-bold select-all"
                style={{
                  top: `${memoTopOffset}%`,
                  right: "9%",
                  fontSize: `${12 * fontSizeScale}px`,
                }}
              >
                স্মারক নংঃ <span className="font-mono">{memoNo}</span>
              </div>

              {/* 3. Main Content Area (বরাবর, বিষয়, সম্ভাষণ, মূল বক্তব্য ও সমাপনী) */}
              <div
                className="absolute left-[9%] right-[9%] bottom-[10.5%] flex flex-col justify-between"
                style={{
                  top: `${contentTopOffset}%`,
                }}
              >
                {/* Upper Section */}
                <div
                  className="space-y-2.5 text-gray-900"
                  style={{
                    fontSize: `${12.5 * fontSizeScale}px`,
                    lineHeight: "1.7",
                  }}
                >
                  {/* Recipient / বরাবর */}
                  <div className="space-y-0.5 text-left font-medium">
                    <p className="font-bold text-gray-950">বরাবর</p>
                    {recipient.split("\n").map((line, idx) => (
                      <p key={idx} className="leading-tight text-gray-800">{line}</p>
                    ))}
                  </div>

                  {/* Subject / বিষয় */}
                  {subject && (
                    <div
                      className="font-bold text-gray-950 underline decoration-gray-400 decoration-1 underline-offset-4 pt-1 pb-0.5 leading-snug"
                      style={{
                        fontSize: `${13 * fontSizeScale}px`,
                      }}
                    >
                      {subject.startsWith("বিষয়") ? subject : `বিষয়: ${subject}`}
                    </div>
                  )}

                  {/* Salutation / সম্ভাষণ */}
                  {salutation && (
                    <p className="font-semibold text-gray-900">{salutation}</p>
                  )}

                  {/* Body Paragraphs / মূল বক্তব্য */}
                  <div className="space-y-2.5 text-justify">
                    {body.split("\n\n").map((para, idx) => (
                      <p key={idx} className="leading-relaxed indent-5">{para}</p>
                    ))}
                  </div>
                </div>

                {/* Bottom Section: Closing & Signatures */}
                <div
                  className="space-y-2 pt-1"
                  style={{
                    fontSize: `${12 * fontSizeScale}px`,
                  }}
                >
                  <div className="text-left font-semibold text-gray-800">
                    <p>নিবেদক</p>
                    <p className="font-bold text-gray-950">কুঞ্জছায়া ক্লাবের পক্ষে</p>
                  </div>

                  <div className="flex justify-between items-end pt-3 text-gray-900 font-bold">
                    <div className="text-left">
                      <span>{signatoryLeftTitle} </span>
                      <span>{signatoryLeftName}</span>
                    </div>
                    <div className="text-right">
                      <span>{signatoryRightTitle} </span>
                      <span>{signatoryRightName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ARCHIVE / SMARAK REGISTER VIEW */
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border bg-white" style={{ borderColor: C.outlineVariant }}>
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isBn ? "স্মারক নং, বিষয় বা প্রাপক দিয়ে খুঁজুন..." : "Search by Memo No., Subject or Recipient..."}
                style={inputStyle()}
                className={inputCls + " pl-9 text-xs"}
              />
            </div>
            <Btn size="sm" icon={Plus} onClick={() => setViewMode("editor")}>
              {isBn ? "নতুন পত্র ইস্যু" : "Compose New Letter"}
            </Btn>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredLetters.map(l => (
              <Card key={l.id} className="p-4 space-y-3 hover:shadow-md transition-shadow border" style={{ borderColor: C.outlineVariant }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-black text-xs text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {l.memoNo}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1">{l.date}</p>
                  </div>
                  <Badge tone="success">{isBn ? "ইস্যুকৃত" : "Issued"}</Badge>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-gray-900 line-clamp-2">{l.subject}</h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                    <span className="font-bold">{isBn ? "প্রাপক:" : "To:"}</span> {l.recipient.split("\n")[0]}
                  </p>
                </div>

                <div className="pt-2 border-t flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setMemoNo(l.memoNo);
                        setLetterDate(l.date);
                        setRecipient(l.recipient);
                        setRecipientPhone(l.recipientPhone || "");
                        setSubject(l.subject);
                        setSalutation(l.salutation || "");
                        setBody(l.body);
                        setSignatoryLeftTitle(l.signatoryLeftTitle || "আহ্বায়কঃ");
                        setSignatoryLeftName(l.signatoryLeftName || "");
                        setSignatoryRightTitle(l.signatoryRightTitle || "সদস্য সচিবঃ");
                        setSignatoryRightName(l.signatoryRightName || "");
                        if (l.dateTopOffset) setDateTopOffset(l.dateTopOffset);
                        if (l.dateRightOffset) setDateRightOffset(l.dateRightOffset);
                        if (l.memoTopOffset) setMemoTopOffset(l.memoTopOffset);
                        if (l.contentTopOffset) setContentTopOffset(l.contentTopOffset);
                        if (l.fontSizeScale) setFontSizeScale(l.fontSizeScale);
                        setViewMode("editor");
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold"
                      title={isBn ? "সম্পাদনা ও প্রিভিউ" : "Edit & Preview"}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleWhatsAppSend(l.recipientPhone, l)}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold"
                      title="WhatsApp"
                    >
                      <MessageCircle size={14} />
                    </button>
                  </div>

                  <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                    {l.issuedBy}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {filteredLetters.length === 0 && (
            <div className="py-12">
              <Empty
                icon={FileText}
                title={isBn ? "কোনো অফিসিয়াল পত্র পাওয়া যায়নি" : "No official letters found"}
                subtitle={isBn ? "নতুন পত্র রচনা করুন অথবা অনুসন্ধান ফিল্টার পরিবর্তন করুন।" : "Compose a new letter or modify search filters."}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
