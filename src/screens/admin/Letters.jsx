import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  FileText, Send, Printer, Download, MessageCircle, Plus, Search, Filter,
  Shield, Check, Trash2, Eye, Edit3, Copy, Sparkles, RefreshCw, Calendar,
  Building, User, Phone, CheckCircle2, ChevronRight, ArrowLeft, Share2, Sliders,
  ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw
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
    signatoryLeftTitle: "আহ্বায়কঃ",
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
  const [mobileTab, setMobileTab] = useState("editor"); // "editor" | "preview" (for mobile view toggle)
  const [searchQuery, setSearchQuery] = useState("");
  const [fullscreenPreview, setFullscreenPreview] = useState(false);

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

  // Precise Alignment Offset Controls (Defaults calibrated to exact user red mark & reference PDF)
  const [dateTopOffset, setDateTopOffset] = useState(8.2); // % from top (inside orange bar)
  const [dateRightOffset, setDateRightOffset] = useState(22.0); // % from right
  const [memoTopOffset, setMemoTopOffset] = useState(13.2); // % from top (inside white area below orange bar)
  const [memoRightOffset, setMemoRightOffset] = useState(22.0); // % from right (aligned with orange bar end)
  const [contentTopOffset, setContentTopOffset] = useState(17.0); // % from top
  const [signatureGap, setSignatureGap] = useState(42); // px gap between নিবেদক and Signatories
  const [fontSizeScale, setFontSizeScale] = useState(1.0); // font scale multiplier
  const [showAdjustments, setShowAdjustments] = useState(false);

  // Responsive Canvas Scaling State (Standard A4 is 794px × 1123px at 96 DPI)
  const canvasContainerRef = useRef(null);
  const [autoScale, setAutoScale] = useState(0.48);
  const [customZoom, setCustomZoom] = useState(1.0); // manual multiplier

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

  // Recalculate auto-scale factor based on available container width
  useEffect(() => {
    const updateScale = () => {
      if (canvasContainerRef.current) {
        const containerW = canvasContainerRef.current.clientWidth || 360;
        const availableW = Math.max(260, containerW - 16);
        const fitScale = Math.min(1.0, availableW / 794);
        setAutoScale(fitScale);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [viewMode, mobileTab]);

  const effectiveScale = autoScale * customZoom;

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
      memoRightOffset,
      contentTopOffset,
      signatureGap,
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

  // Generate full HTML string for Print / PDF Export
  const generateLetterHTML = () => {
    const recipientFormatted = recipient.split("\n").map(l => `<p style="margin:2px 0;">${l}</p>`).join("");
    const subjectFormatted = subject.startsWith("বিষয়") ? subject : `বিষয়: ${subject}`;
    const bodyFormatted = body.split("\n\n").map(p => `<p style="margin-bottom:14px; text-indent:28px; text-align:justify; line-height:1.75;">${p}</p>`).join("");
    const originUrl = typeof window !== "undefined" ? window.location.origin : "";

    return `<!DOCTYPE html>
<html lang="bn">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
      html, body {
        width: 210mm;
        height: 297mm;
        background-color: #ffffff;
        font-family: 'SolaimanLipi', 'Kalpurush', 'Inter', sans-serif;
        color: #0f172a;
        overflow: hidden;
      }
      .a4-container {
        position: relative;
        width: 210mm;
        height: 297mm;
        margin: 0 auto;
        background: #ffffff;
        overflow: hidden;
      }
      .letterhead-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 210mm;
        height: 297mm;
        z-index: 1;
        pointer-events: none;
      }
      .date-block {
        position: absolute;
        top: ${dateTopOffset}%;
        right: ${dateRightOffset}%;
        color: #ffffff;
        font-weight: bold;
        font-size: ${13 * fontSizeScale}px;
        z-index: 10;
        letter-spacing: 0.5px;
      }
      .memo-block {
        position: absolute;
        top: ${memoTopOffset}%;
        right: ${memoRightOffset}%;
        color: #0f172a;
        font-weight: bold;
        font-size: ${12.5 * fontSizeScale}px;
        z-index: 10;
      }
      .content-block {
        position: absolute;
        top: ${contentTopOffset}%;
        left: 9%;
        right: 9%;
        bottom: 10.5%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        z-index: 10;
        font-size: ${13 * fontSizeScale}px;
        line-height: 1.75;
      }
      .subject-line {
        font-weight: bold;
        font-size: ${13.5 * fontSizeScale}px;
        color: #000000;
        text-decoration: underline;
        text-underline-offset: 4px;
        margin: 10px 0 6px 0;
      }
      .signatory-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        padding-top: ${signatureGap}px;
        font-weight: bold;
        font-size: ${12.5 * fontSizeScale}px;
      }
    </style>
  </head>
  <body>
    <div class="a4-container">
      <img src="${originUrl}/letterhead.png" class="letterhead-bg" alt="Letterhead" />
      
      <div class="date-block">
        তারিখঃ ${letterDate}
      </div>

      <div class="memo-block">
        স্মারক নংঃ <span style="font-family: monospace;">${memoNo}</span>
      </div>

      <div class="content-block">
        <div>
          <div style="margin-bottom: 8px;">
            <p style="font-weight: bold; margin-bottom: 2px;">বরাবর</p>
            ${recipientFormatted}
          </div>

          ${subject ? `<div class="subject-line">${subjectFormatted}</div>` : ""}

          ${salutation ? `<p style="font-weight: 600; margin: 8px 0 6px 0;">${salutation}</p>` : ""}

          <div style="margin-top: 6px;">
            ${bodyFormatted}
          </div>
        </div>

        <div>
          <div style="font-weight: 600; margin-bottom: 2px;">
            <p>নিবেদক</p>
            <p style="font-weight: bold;">কুঞ্জছায়া ক্লাবের পক্ষে</p>
          </div>

          <div class="signatory-row">
            <div>
              <span>${signatoryLeftTitle} </span>
              <span>${signatoryLeftName}</span>
            </div>
            <div>
              <span>${signatoryRightTitle} </span>
              <span>${signatoryRightName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
  };

  // High-Resolution Print Engine (Android & WebView Compatible via Hidden Iframe)
  const handlePrint = () => {
    try {
      const htmlContent = generateLetterHTML();
      
      // Attempt 1: Hidden Iframe Print (works seamlessly without new tab/window popups in WebViews)
      let iframe = document.getElementById("letter-print-iframe");
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = "letter-print-iframe";
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        document.body.appendChild(iframe);
      }

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            window.print();
          }
        }, 500);
        return;
      }
    } catch (err) {
      console.warn("Iframe print fallback to window:", err);
    }

    // Fallback: window print
    window.print();
  };

  // Direct Download of Standalone Printable HTML / Document
  const handleDownloadDocument = () => {
    try {
      const htmlContent = generateLetterHTML();
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Letter_${memoNo.replace(/[^a-zA-Z0-9_-]/g, "_")}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast(isBn ? "প্রিন্টযোগ্য ফাইল ডাউনলোড সম্পন্ন হয়েছে!" : "Printable document downloaded!");
    } catch (err) {
      toast(isBn ? "ডাউনলোডে ত্রুটি দেখা দিয়েছে।" : "Failed to download document.", "error");
    }
  };

  // ── A4 Letterhead Canvas (React JSX live preview mirror of generateLetterHTML) ──
  const renderA4LetterCanvas = () => {
    const originUrl = typeof window !== "undefined" ? window.location.origin : "";
    const subjectFormatted = subject.startsWith("বিষয়") ? subject : `বিষয়: ${subject}`;

    return (
      <div
        style={{
          position: "relative",
          width: "794px",
          height: "1123px",
          background: "#ffffff",
          fontFamily: "'SolaimanLipi', 'Kalpurush', 'Inter', sans-serif",
          color: "#0f172a",
          overflow: "hidden",
        }}
      >
        {/* Letterhead Background Image */}
        <img
          src={`${originUrl}/letterhead.png`}
          alt="Letterhead"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "794px",
            height: "1123px",
            objectFit: "fill",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* Date Block (positioned over orange bar on letterhead) */}
        <div
          style={{
            position: "absolute",
            top: `${dateTopOffset}%`,
            right: `${dateRightOffset}%`,
            color: "#ffffff",
            fontWeight: "bold",
            fontSize: `${13 * fontSizeScale}px`,
            zIndex: 10,
            letterSpacing: "0.5px",
          }}
        >
          তারিখঃ {letterDate}
        </div>

        {/* Memo Number Block */}
        <div
          style={{
            position: "absolute",
            top: `${memoTopOffset}%`,
            right: `${memoRightOffset}%`,
            color: "#0f172a",
            fontWeight: "bold",
            fontSize: `${12.5 * fontSizeScale}px`,
            zIndex: 10,
          }}
        >
          স্মারক নংঃ <span style={{ fontFamily: "monospace" }}>{memoNo}</span>
        </div>

        {/* Main Content Block */}
        <div
          style={{
            position: "absolute",
            top: `${contentTopOffset}%`,
            left: "9%",
            right: "9%",
            bottom: "10.5%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            zIndex: 10,
            fontSize: `${13 * fontSizeScale}px`,
            lineHeight: 1.75,
          }}
        >
          {/* Upper: Recipient + Subject + Body */}
          <div>
            {/* Recipient */}
            <div style={{ marginBottom: "8px" }}>
              <p style={{ fontWeight: "bold", marginBottom: "2px" }}>বরাবর</p>
              {recipient.split("\n").map((line, i) => (
                <p key={i} style={{ margin: "2px 0" }}>{line}</p>
              ))}
            </div>

            {/* Subject */}
            {subject && (
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: `${13.5 * fontSizeScale}px`,
                  color: "#000000",
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                  margin: "10px 0 6px 0",
                }}
              >
                {subjectFormatted}
              </div>
            )}

            {/* Salutation */}
            {salutation && (
              <p style={{ fontWeight: 600, margin: "8px 0 6px 0" }}>{salutation}</p>
            )}

            {/* Body Paragraphs */}
            <div style={{ marginTop: "6px" }}>
              {body.split("\n\n").map((para, i) => (
                <p
                  key={i}
                  style={{
                    marginBottom: "14px",
                    textIndent: "28px",
                    textAlign: "justify",
                    lineHeight: 1.75,
                  }}
                >
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Lower: Signatories */}
          <div>
            <div style={{ fontWeight: 600, marginBottom: "2px" }}>
              <p>নিবেদক</p>
              <p style={{ fontWeight: "bold" }}>কুঞ্জছায়া ক্লাবের পক্ষে</p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                paddingTop: `${signatureGap}px`,
                fontWeight: "bold",
                fontSize: `${12.5 * fontSizeScale}px`,
              }}
            >
              <div>
                <span>{signatoryLeftTitle} </span>
                <span>{signatoryLeftName}</span>
              </div>
              <div>
                <span>{signatoryRightTitle} </span>
                <span>{signatoryRightName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 w-full max-w-full overflow-x-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3" style={{ borderColor: C.outlineVariant }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 text-white flex items-center justify-center font-black shadow-md shrink-0">
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

        <div className="flex items-center gap-2 flex-wrap">
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
        <div className="space-y-4">
          {/* Mobile Tab Toggle (Visible only on small/mobile screens) */}
          <div className="lg:hidden flex rounded-xl p-1 bg-slate-100 border border-slate-200">
            <button
              onClick={() => setMobileTab("editor")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mobileTab === "editor" ? "bg-emerald-700 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              {isBn ? "১. পত্রের তথ্য ও রচনা" : "1. Letter Form"}
            </button>
            <button
              onClick={() => setMobileTab("preview")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${mobileTab === "preview" ? "bg-emerald-700 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              <Eye size={14} />
              {isBn ? "২. A4 প্যাড লাইভ প্রিভিউ" : "2. Live A4 Preview"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT: FORM CONTROLS & TEMPLATES (5 Cols on desktop, toggle on mobile) */}
            <div className={`lg:col-span-5 space-y-4 ${mobileTab === "preview" ? "hidden lg:block" : "block"}`}>
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
                        <label className="text-gray-500 font-semibold">তারিখ টপ পজিশন: {dateTopOffset}%</label>
                        <input
                          type="range"
                          min="4"
                          max="14"
                          step="0.1"
                          value={dateTopOffset}
                          onChange={e => setDateTopOffset(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-amber-600"
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 font-semibold">তারিখ ডান থেকে: {dateRightOffset}%</label>
                        <input
                          type="range"
                          min="10"
                          max="35"
                          step="0.5"
                          value={dateRightOffset}
                          onChange={e => setDateRightOffset(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-amber-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-gray-500 font-semibold">স্মারক নং টপ: {memoTopOffset}%</label>
                        <input
                          type="range"
                          min="10"
                          max="18"
                          step="0.1"
                          value={memoTopOffset}
                          onChange={e => setMemoTopOffset(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 font-semibold">স্মারক নং ডান থেকে: {memoRightOffset}%</label>
                        <input
                          type="range"
                          min="10"
                          max="35"
                          step="0.5"
                          value={memoRightOffset}
                          onChange={e => setMemoRightOffset(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-gray-500 font-semibold">বক্তব্য টপ পজিশন: {contentTopOffset}%</label>
                        <input
                          type="range"
                          min="14"
                          max="24"
                          step="0.5"
                          value={contentTopOffset}
                          onChange={e => setContentTopOffset(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-sky-600"
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 font-semibold">স্বাক্ষরকারীর গ্যাপ: {signatureGap}px</label>
                        <input
                          type="range"
                          min="15"
                          max="90"
                          step="1"
                          value={signatureGap}
                          onChange={e => setSignatureGap(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-purple-600"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setDateTopOffset(8.2);
                        setDateRightOffset(22.0);
                        setMemoTopOffset(13.2);
                        setMemoRightOffset(22.0);
                        setContentTopOffset(17.0);
                        setSignatureGap(42);
                        setFontSizeScale(1.0);
                      }}
                      className="w-full py-1.5 text-[11px] font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      ডিফল্ট পজিশনে রিসেট করুন (Reset to Standard)
                    </button>
                  </div>
                )}
              </Card>

              {/* Main Letter Form Card */}
              <Card className="p-4 space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <Field label={isBn ? "স্মারক নং (Memo No.)" : "Memo Number"}>
                    <input
                      style={inputStyle()}
                      className={inputCls + " font-mono font-bold text-xs"}
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
                  <div className="grid grid-cols-2 gap-2">
                    <Btn full variant="outline" icon={Printer} onClick={handlePrint}>
                      {isBn ? "প্রিন্ট" : "Print"}
                    </Btn>
                    <button
                      type="button"
                      onClick={handleDownloadDocument}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors shadow-sm"
                    >
                      <Download size={14} /> {isBn ? "HTML / PDF" : "Download"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleWhatsAppSend()}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <MessageCircle size={15} /> WhatsApp
                  </button>
                </div>
              </Card>
            </div>

            {/* RIGHT: A4 OFFICIAL LETTERHEAD CANVAS LIVE PREVIEW (7 Cols on desktop, toggle on mobile) */}
            <div className={`lg:col-span-7 flex flex-col items-center w-full max-w-full ${mobileTab === "editor" ? "hidden lg:flex" : "flex"}`}>
              {/* Preview Control Toolbar */}
              <div className="w-full flex items-center justify-between mb-2 px-1 text-xs text-gray-600 flex-wrap gap-2">
                <span className="font-bold flex items-center gap-1.5">
                  <FileText size={15} className="text-amber-600" />
                  {isBn ? "অফিসিয়াল প্যাড প্রিভিউ (A4 Format)" : "Official A4 Letterhead Preview"}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCustomZoom(z => Math.max(0.6, z - 0.1))}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-gray-700"
                    title="Zoom Out"
                  >
                    <ZoomOut size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomZoom(1.0)}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-gray-700"
                    title="Fit to screen"
                  >
                    {Math.round(effectiveScale * 100)}% Fit
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomZoom(z => Math.min(1.8, z + 0.1))}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-gray-700"
                    title="Zoom In"
                  >
                    <ZoomIn size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFullscreenPreview(true)}
                    className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                    title="Full Screen Preview"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>
              </div>

              {/* AUTO-SCALING RESPONSIVE A4 CANVAS CONTAINER */}
              <div
                ref={canvasContainerRef}
                className="w-full flex justify-center items-start py-3 bg-slate-100/70 rounded-2xl border border-slate-200 overflow-hidden"
                style={{
                  minHeight: `${Math.round(1123 * effectiveScale + 24)}px`,
                  height: `${Math.round(1123 * effectiveScale + 24)}px`,
                }}
              >
                {/* Shrink-wrapper: sized to VISUAL scaled dimensions so layout matches visual */}
                <div
                  style={{
                    width: `${Math.round(794 * effectiveScale)}px`,
                    height: `${Math.round(1123 * effectiveScale)}px`,
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  {/* Actual 794×1123 canvas scaled from top-left origin */}
                  <div
                    style={{
                      width: "794px",
                      height: "1123px",
                      transform: `scale(${effectiveScale})`,
                      transformOrigin: "top left",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      boxShadow: "0 20px 40px -15px rgba(0,0,0,0.25)",
                    }}
                    className="rounded-sm overflow-hidden"
                  >
                    {renderA4LetterCanvas()}
                  </div>
                </div>
              </div>

              {/* Mobile Quick Action Buttons below preview */}
              <div className="w-full grid grid-cols-3 gap-2 mt-3 lg:hidden">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl font-bold text-xs text-white bg-slate-800 shadow-sm"
                >
                  <Printer size={14} /> {isBn ? "প্রিন্ট" : "Print"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadDocument}
                  className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl font-bold text-xs text-sky-800 bg-sky-50 border border-sky-200 shadow-sm"
                >
                  <Download size={14} /> {isBn ? "ডাউনলোড" : "Export"}
                </button>
                <button
                  type="button"
                  onClick={() => handleWhatsAppSend()}
                  className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl font-bold text-xs text-white bg-emerald-600 shadow-sm"
                >
                  <MessageCircle size={14} /> WhatsApp
                </button>
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
                        if (l.memoRightOffset) setMemoRightOffset(l.memoRightOffset);
                        if (l.contentTopOffset) setContentTopOffset(l.contentTopOffset);
                        if (l.signatureGap) setSignatureGap(l.signatureGap);
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
