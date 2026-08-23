import React, { useRef } from "react";
import {
  Printer, Download, MessageCircle, X, CheckCircle2, AlertCircle, FileText,
  Building, User, Phone, Calendar, CreditCard, Shield, Check
} from "lucide-react";
import { Modal, Btn, Badge } from "./primitives";
import { C, LOGO_MARK } from "../theme";
import { currency, monthLabel, fmtDate, cleanPhone } from "../utils";

export default function InvoiceReceiptModal({
  open,
  onClose,
  invoice,
  treasurer = { name: "Golam Sarwar Jony", nameBn: "গোলাম সরোয়ার জনি", post: "Treasurer" },
  gs = { name: "Khalid Hasan", nameBn: "খালিদ হাসান", post: "General Secretary" },
  president = { name: "Zakaria Hasan", nameBn: "জাকারিয়া হাছান", post: "President" },
  lang = "en",
  toast = () => {}
}) {
  if (!open || !invoice) return null;

  const isBn = lang === "bn";
  const user = invoice.resident || invoice._user || {};
  const isPaid = invoice.status === "paid";
  const rawPhone = cleanPhone(user.phone || "");

  const billedAmount = Number(invoice.amount) || 0;
  const discountAmount = Number(invoice.discount) || 0;
  const netPayable = Math.max(0, billedAmount - discountAmount);
  const receivedAmount = Number(invoice.receivedAmount) || (isPaid ? netPayable : 0);
  const balanceDue = Number(invoice.balanceDue) !== undefined ? Number(invoice.balanceDue) : (isPaid ? 0 : netPayable);

  const receiptNo = invoice.ref || `KC/REC/2026/${(invoice.id || "0000").slice(-4).toUpperCase()}`;
  const invoiceNo = `KC/INV/2026/${(invoice.id || "0000").slice(-4).toUpperCase()}`;
  const issueDate = invoice.createdDate ? fmtDate(invoice.createdDate) : `${invoice.month || "2026-02"}-01`;
  const paymentDate = invoice.paidDate ? fmtDate(invoice.paidDate) : "—";
  const dueDate = invoice.dueDate || `${invoice.month || "2026-02"}-15`;

  // HTML generator for A4/Voucher Letter Pad Print
  const generatePrintableHTML = () => {
    const originUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8" />
  <title>Official_Receipt_${(receiptNo).replace(/[^a-zA-Z0-9_-]/g, "_")}</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'SolaimanLipi', 'Kalpurush', 'Segoe UI', Tahoma, sans-serif;
      background: #ffffff;
      color: #0f172a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 0;
      margin: 0;
    }
    .a4-page {
      position: relative;
      width: 210mm;
      min-height: 297mm;
      height: 297mm;
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
    .date-meta {
      position: absolute;
      top: 7.6%;
      right: 18%;
      color: #ffffff;
      font-weight: bold;
      font-size: 13px;
      z-index: 10;
      letter-spacing: 0.5px;
    }
    .receipt-meta {
      position: absolute;
      top: 13.0%;
      right: 18%;
      color: #0f172a;
      font-weight: bold;
      font-size: 12.5px;
      z-index: 10;
    }
    .content-area {
      position: absolute;
      top: 17.5%;
      left: 9%;
      right: 9%;
      bottom: 11%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      z-index: 10;
      font-size: 13px;
      line-height: 1.6;
    }
    .voucher-title {
      text-align: center;
      margin-bottom: 16px;
    }
    .voucher-title h2 {
      font-size: 18px;
      font-weight: 800;
      color: #14532d;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: inline-block;
      border-bottom: 2px solid #15803d;
      padding-bottom: 3px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 16px;
    }
    .info-box p { margin: 2px 0; font-size: 12.5px; }
    .label-muted { color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .val-bold { font-weight: bold; color: #0f172a; }
    
    table.fin-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 12.5px;
    }
    table.fin-table th, table.fin-table td {
      border: 1px solid #cbd5e1;
      padding: 9px 12px;
    }
    table.fin-table th {
      background: #14532d;
      color: #ffffff;
      font-weight: bold;
      text-align: left;
    }
    table.fin-table td.num { text-align: right; font-family: monospace; font-size: 13px; }
    table.fin-table tr.total-row {
      background: #f1f5f9;
      font-weight: bold;
    }
    table.fin-table tr.highlight-row {
      background: #ecfdf5;
      font-weight: 800;
      color: #166534;
      font-size: 13.5px;
    }
    
    .status-stamp {
      display: inline-block;
      border: 3px solid ${isPaid ? "#16a34a" : "#dc2626"};
      color: ${isPaid ? "#16a34a" : "#dc2626"};
      font-weight: 900;
      font-size: 18px;
      padding: 4px 18px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 2px;
      transform: rotate(-5deg);
      opacity: 0.95;
    }
    .signatory-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 25px;
      border-top: 1px dashed #cbd5e1;
    }
    .sign-box { text-align: center; width: 170px; }
    .sign-line { border-bottom: 1.5px solid #64748b; margin-bottom: 4px; }
    .sign-title { font-weight: bold; font-size: 12px; color: #0f172a; }
    .sign-name { font-size: 11.5px; color: #334155; }
  </style>
</head>
<body>
  <div class="a4-page">
    <img src="${originUrl}/letterhead.png" class="letterhead-bg" alt="Kunjachaya Letterhead" />

    <div class="date-meta">
      তারিখঃ ${paymentDate !== "—" ? paymentDate : issueDate}
    </div>

    <div class="receipt-meta">
      রসিদ নংঃ <span style="font-family: monospace;">${receiptNo}</span>
    </div>

    <div class="content-area">
      <div>
        <div class="voucher-title">
          <h2>${isPaid ? "মানি রিসিট ও আদায় ভাউচার" : "অফিসিয়াল ইনভয়েস ও বিল ভাউচার"}</h2>
          <p style="font-size: 11px; color: #475569; margin-top: 3px;">
            ${isPaid ? "Official Collection Money Receipt" : "Official Subscription & Maintenance Invoice"}
          </p>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <span class="label-muted">সদস্যের বিবরণ (Billed To):</span>
            <p class="val-bold" style="font-size: 14px; color: #14532d;">
              ${user.name || "Member Name"} ${user.nameBn ? `(${user.nameBn})` : ""}
            </p>
            <p><strong>মেম্বার কোড:</strong> #${user.memberCode || "000"} · <strong>শ্রেণি:</strong> ${user.memberClass || "General"}</p>
            <p><strong>ঠিকানা:</strong> ব্লক ${user.block || "A"}, ইউনিট ${user.unit || "—"}, কুঞ্জছায়া আ/এ</p>
            <p><strong>মোবাইল:</strong> ${user.phone || "—"}</p>
          </div>
          <div class="info-box" style="text-align: right;">
            <span class="label-muted">বিল ও পেমেন্ট বিবরণ (Billing Info):</span>
            <p><strong>বিলিং মাস:</strong> ${monthLabel(invoice.month)}</p>
            <p><strong>পরিশোধের শেষ তারিখ:</strong> ${dueDate}</p>
            <p><strong>পেমেন্ট মাধ্যম:</strong> ${invoice.method || "Cash / Online"}</p>
            <p><strong>ট্রানজেকশন আইডি:</strong> <span style="font-family: monospace;">${invoice.ref || "N/A"}</span></p>
          </div>
        </div>

        <table class="fin-table">
          <thead>
            <tr>
              <th style="width: 50%;">বিবরণ (Particulars / Description)</th>
              <th style="width: 25%;">বিলিং চক্র (Period)</th>
              <th style="width: 25%; text-align: right;">পরিমাণ (Amount ৳)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>${invoice.chargeTitle || "মাসিক সাবস্ক্রিপশন ও রক্ষণাবেক্ষণ চাঁদা"}</strong>
                <div style="font-size: 10.5px; color: #64748b;">(Monthly Club Subscription & Maintenance Levy)</div>
              </td>
              <td>${monthLabel(invoice.month)}</td>
              <td class="num">৳${currency(billedAmount)}</td>
            </tr>
            ${discountAmount > 0 ? `
            <tr style="color: #047857;">
              <td><em>ছাড় / বিশেষ সমন্বয় (Discount / Waiver)</em></td>
              <td>—</td>
              <td class="num">-৳${currency(discountAmount)}</td>
            </tr>` : ""}
            <tr class="total-row">
              <td colspan="2">সর্বমোট প্রদেয় বিল (Net Payable Amount)</td>
              <td class="num">৳${currency(netPayable)}</td>
            </tr>
            <tr class="highlight-row">
              <td colspan="2">আদায়কৃত / পরিশোধিত টাকা (Amount Paid / Received)</td>
              <td class="num">৳${currency(receivedAmount)}</td>
            </tr>
            <tr style="font-weight: bold; color: ${balanceDue > 0 ? "#b91c1c" : "#15803d"};">
              <td colspan="2">অবশিষ্ট বকেয়া (Remaining Balance Due)</td>
              <td class="num">৳${currency(balanceDue)}</td>
            </tr>
          </tbody>
        </table>

        ${invoice.note ? `
        <div style="font-size: 11px; color: #475569; background: #f8fafc; padding: 6px 10px; border-radius: 6px; margin-bottom: 12px; border-left: 3px solid #14532d;">
          <strong>মন্তব্য / নোট:</strong> ${invoice.note}
        </div>` : ""}

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
          <div class="status-stamp">
            ${isPaid ? "PAID / পরিশোধিত" : "DUE / বকেয়া"}
          </div>
          <div style="font-size: 11px; color: #64748b; text-align: right;">
            <div><strong>আদায়কারী:</strong> ${invoice.collectedBy || treasurer.name}</div>
            <div><strong>ইস্যু তারিখ:</strong> ${paymentDate !== "—" ? paymentDate : issueDate}</div>
          </div>
        </div>
      </div>

      <div>
        <div class="signatory-section">
          <div class="sign-box">
            <div class="sign-line"></div>
            <div class="sign-title">কোষাধ্যক্ষ</div>
            <div class="sign-name">${treasurer.nameBn || treasurer.name}</div>
            <div style="font-size: 9.5px; color: #64748b;">(Treasurer)</div>
          </div>

          <div class="sign-box">
            <div class="sign-line"></div>
            <div class="sign-title">সাধারণ সম্পাদক</div>
            <div class="sign-name">${gs.nameBn || gs.name}</div>
            <div style="font-size: 9.5px; color: #64748b;">(General Secretary)</div>
          </div>

          <div class="sign-box">
            <div class="sign-line"></div>
            <div class="sign-title">সভাপতি</div>
            <div class="sign-name">${president.nameBn || president.name}</div>
            <div style="font-size: 9.5px; color: #64748b;">(President)</div>
          </div>
        </div>

        <p style="text-align: center; font-size: 9.5px; color: #94a3b8; margin-top: 12px;">
          কুঞ্জছায়া ক্লাব ডিজিটাল সিস্টেম কর্তৃক স্বয়ংক্রিয়ভাবে প্রস্তুতকৃত অফিসিয়াল রসিদ।
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  // High-Resolution Iframe Print Engine
  const handlePrint = () => {
    try {
      const htmlContent = generatePrintableHTML();
      let iframe = document.getElementById("invoice-print-iframe");
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = "invoice-print-iframe";
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
        }, 400);
        return;
      }
    } catch (err) {
      console.warn("Iframe print fallback:", err);
    }
    window.print();
  };

  // Download Printable Document
  const handleDownload = () => {
    try {
      const htmlContent = generatePrintableHTML();
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice_${(user.name || "Member").replace(/\s+/g, "_")}_${invoice.month}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast(isBn ? "রসিদ ফাইল ডাউনলোড সম্পন্ন হয়েছে!" : "Receipt file downloaded!");
    } catch (e) {
      toast(isBn ? "ডাউনলোডে ত্রুটি দেখা দিয়েছে।" : "Failed to download receipt.", "error");
    }
  };

  // WhatsApp Shareable Message
  const handleWhatsAppSend = () => {
    const text = isBn
      ? `🏛️ *কুঞ্জছায়া ক্লাব — অফিসিয়াল পেমেন্ট রসিদ*
━━━━━━━━━━━━━━━━━━
👤 *সদস্য:* ${user.name || "Member"} (${user.nameBn || ""})
🆔 *কোড:* #${user.memberCode || "000"} | *ব্লক:* ${user.block || "A"} (${user.unit || ""})
📅 *মাস:* ${monthLabel(invoice.month)}
📄 *রসিদ নং:* ${receiptNo}
💰 *পরিশোধিত টাকা:* ৳${currency(receivedAmount)}
📌 *স্ট্যাটাস:* ${isPaid ? "✅ পরিশোধিত (PAID)" : "⏳ বকেয়া (DUE)"}
💳 *মাধ্যম:* ${invoice.method || "Cash"}
━━━━━━━━━━━━━━━━━━
_কুঞ্জছায়া ক্লাব কার্যালয়, চট্টগ্রাম।_`
      : `🏛️ *KUNJACHAYA CLUB — OFFICIAL RECEIPT*
━━━━━━━━━━━━━━━━━━
👤 *Member:* ${user.name || "Member"}
🆔 *Code:* #${user.memberCode || "000"} | *Block:* ${user.block || "A"} (${user.unit || ""})
📅 *Period:* ${monthLabel(invoice.month)}
📄 *Receipt No:* ${receiptNo}
💰 *Amount Paid:* ৳${currency(receivedAmount)}
📌 *Status:* ${isPaid ? "✅ PAID" : "⏳ DUE"}
💳 *Method:* ${invoice.method || "Cash"}
━━━━━━━━━━━━━━━━━━
_Kunjachaya Club Office, Chattogram._`;

    const url = rawPhone ? `https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isBn ? "অফিসিয়াল প্যাড ইনভয়েস ও মানি রিসিট" : "Official Letter Pad Invoice & Money Receipt"}
      width="max-w-2xl"
    >
      <div className="space-y-4 py-1 text-xs">
        {/* On-Screen Official Letter Pad Preview Container */}
        <div className="relative p-6 rounded-3xl border shadow-xl overflow-hidden bg-white dark:bg-slate-900" style={{ borderColor: C.outlineVariant }}>
          
          {/* Header Bar */}
          <div className="flex items-start justify-between border-b pb-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center p-2 shadow-md shrink-0" style={{ backgroundColor: C.primary }}>
                <img src={LOGO_MARK} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-extrabold text-base heading text-emerald-950 dark:text-emerald-300 leading-tight">
                  কুঞ্জছায়া ক্লাব
                </h3>
                <p className="font-bold text-xs text-gray-800 dark:text-gray-200">
                  KUNJACHAYA CLUB
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  কুঞ্জছায়া আবাসিক এলাকা, বায়েজিদ বোস্তামী, চট্টগ্রাম।
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className={`inline-block px-3.5 py-1 rounded-full font-black text-xs text-white shadow-sm ${isPaid ? "bg-emerald-600" : "bg-rose-600"}`}>
                {isPaid ? (isBn ? "পরিশোধিত" : "PAID") : (isBn ? "বকেয়া" : "DUE")}
              </span>
              <p className="font-mono text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 font-bold">
                {receiptNo}
              </p>
            </div>
          </div>

          {/* Member & Billing Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                {isBn ? "প্রাপক / সদস্যের তথ্য" : "BILLED TO / MEMBER"}
              </span>
              <p className="font-black text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                {user.name || "Member Name"}
                {user.memberCode && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                    #{user.memberCode}
                  </span>
                )}
              </p>
              {user.nameBn && (
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">{user.nameBn}</p>
              )}
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                {isBn ? "ব্লক" : "Block"} <span className="font-bold">{user.block || "A"}</span> (Unit {user.unit || "—"})
              </p>
              <p className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">{user.phone || "—"}</p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                {isBn ? "বিলিং ও পেমেন্ট তথ্য" : "BILLING & TRANSACTION"}
              </span>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {isBn ? "বিলিং মাস:" : "Billing Month:"} <span className="text-emerald-800 dark:text-emerald-300 font-extrabold">{monthLabel(invoice.month)}</span>
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isBn ? "পরিশোধ তারিখ:" : "Paid Date:"} <span className="font-semibold text-gray-900 dark:text-gray-100">{paymentDate}</span>
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isBn ? "পেমেন্ট মাধ্যম:" : "Method:"} <span className="font-bold">{invoice.method || "Cash / Digital"}</span>
              </p>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3 text-left">{isBn ? "বিবরণ (Particulars)" : "Description"}</th>
                  <th className="p-3 text-right">{isBn ? "টাকার পরিমাণ (Amount)" : "Amount"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-3 font-semibold text-gray-900 dark:text-gray-100">
                    {invoice.chargeTitle || (isBn ? `মাসিক চাঁদা — ${monthLabel(invoice.month)}` : `Monthly Subscription - ${monthLabel(invoice.month)}`)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-gray-900 dark:text-gray-100">
                    ৳{currency(billedAmount)}
                  </td>
                </tr>
                {discountAmount > 0 && (
                  <tr className="text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50/50 dark:bg-emerald-950/20">
                    <td className="p-3 italic">
                      {isBn ? "ছাড় / বিশেষ ছাড় (Discount / Waiver)" : "Discount / Special Waiver"}
                    </td>
                    <td className="p-3 text-right font-mono font-bold">
                      -৳{currency(discountAmount)}
                    </td>
                  </tr>
                )}
                <tr className="bg-slate-50 dark:bg-slate-800/40 font-bold">
                  <td className="p-3 text-gray-700 dark:text-gray-300">
                    {isBn ? "প্রদেয় নিট চাঁদা (Net Payable)" : "Net Payable Amount"}
                  </td>
                  <td className="p-3 text-right font-mono font-black text-gray-900 dark:text-gray-100">
                    ৳{currency(netPayable)}
                  </td>
                </tr>
                <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-extrabold text-emerald-900 dark:text-emerald-200">
                  <td className="p-3 text-emerald-800 dark:text-emerald-300">
                    {isBn ? "গৃহীত / আদায়কৃত টাকা (Amount Paid)" : "Amount Paid / Received"}
                  </td>
                  <td className="p-3 text-right font-mono text-sm">
                    ৳{currency(receivedAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Official Signatures Row */}
          <div className="grid grid-cols-2 pt-6 pb-2 text-center text-[10px] border-t border-dashed border-slate-300 dark:border-slate-700">
            <div>
              <div className="w-28 border-b border-gray-400 dark:border-gray-600 mb-1 mx-auto" />
              <p className="font-bold text-gray-900 dark:text-gray-100">{treasurer.nameBn || treasurer.name}</p>
              <p className="text-gray-500 dark:text-gray-400">{isBn ? "কোষাধ্যক্ষ" : "Treasurer"}</p>
            </div>
            <div>
              <div className="w-28 border-b border-gray-400 dark:border-gray-600 mb-1 mx-auto" />
              <p className="font-bold text-gray-900 dark:text-gray-100">{gs.nameBn || gs.name}</p>
              <p className="text-gray-500 dark:text-gray-400">{isBn ? "সাধারণ সম্পাদক" : "General Secretary"}</p>
            </div>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleWhatsAppSend}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
            >
              <MessageCircle size={15} /> WhatsApp
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl font-bold text-xs text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 border border-sky-200 dark:border-sky-800 shadow-sm transition-colors"
            >
              <Download size={14} /> {isBn ? "ডাউনলোড" : "Download"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Btn
              variant="outline"
              onClick={onClose}
            >
              {isBn ? "বন্ধ করুন" : "Close"}
            </Btn>
            <Btn
              icon={Printer}
              onClick={handlePrint}
            >
              {isBn ? "প্যাড প্রিন্ট করুন" : "Print Official Receipt"}
            </Btn>
          </div>
        </div>
      </div>
    </Modal>
  );
}
