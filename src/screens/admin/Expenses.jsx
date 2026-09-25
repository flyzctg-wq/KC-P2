import React, { useState, useMemo } from "react";
import {
  TrendingDown, Plus, Search, Filter, Trash2, Edit3, Eye, FileSpreadsheet,
  Printer, ChevronDown, AlertCircle, ReceiptText, Banknote, PieChart,
  CheckCircle2
} from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Modal } from "../../components/primitives";
import { C } from "../../theme";
import { uid, fmtDate } from "../../utils";

/* ── Expense categories ── */
const CATEGORIES = [
  { key: "maintenance",  labelEn: "Maintenance & Repairs",     labelBn: "রক্ষণাবেক্ষণ ও মেরামত",    icon: "🔧" },
  { key: "utilities",    labelEn: "Utilities & Bills",          labelBn: "বিদ্যুৎ ও ইউটিলিটি",       icon: "⚡" },
  { key: "events",       labelEn: "Events & Programs",          labelBn: "অনুষ্ঠান ও কর্মসূচি",       icon: "🎉" },
  { key: "office",       labelEn: "Office & Stationery",        labelBn: "অফিস ও স্টেশনারি",          icon: "📎" },
  { key: "security",     labelEn: "Security & Safety",          labelBn: "নিরাপত্তা ও সুরক্ষা",       icon: "🛡️" },
  { key: "cleaning",     labelEn: "Cleaning & Sanitation",      labelBn: "পরিষ্কার-পরিচ্ছন্নতা",     icon: "🧹" },
  { key: "welfare",      labelEn: "Social Welfare",             labelBn: "সমাজকল্যাণ",               icon: "🤝" },
  { key: "legal",        labelEn: "Legal & Documentation",      labelBn: "আইনি ও ডকুমেন্টেশন",       icon: "⚖️" },
  { key: "other",        labelEn: "Other",                      labelBn: "অন্যান্য",                  icon: "📦" },
];

function getCat(key) { return CATEGORIES.find(c => c.key === key) || CATEGORIES[CATEGORIES.length - 1]; }

function nextVoucher(expenses) {
  const nums = (expenses || [])
    .map(e => { const m = (e.voucherNo || "").match(/(\d+)$/); return m ? parseInt(m[1], 10) : 0; })
    .filter(Boolean);
  const max = nums.length ? Math.max(...nums) : 0;
  return `KC/EXP/2026/${String(max + 1).padStart(4, "0")}`;
}

function exportCSV(expenses) {
  const headers = ["Voucher No", "Title", "Category", "Amount (BDT)", "Payee", "Approved By", "Date"];
  const rows = expenses.map(e => [
    e.voucherNo, e.title, e.category, e.amount, e.payee, e.approvedBy,
    new Date(e.date).toLocaleDateString("en-GB"),
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `kc_expenses_${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function printVoucher(exp) {
  const cat = getCat(exp.category);
  const titleSafe = escapeHtml(exp.title);
  const voucherNoSafe = escapeHtml(exp.voucherNo);
  const payeeSafe = escapeHtml(exp.payee);
  const approvedBySafe = escapeHtml(exp.approvedBy);
  const catLabelSafe = escapeHtml(cat.labelEn);
  const dateSafe = exp.date ? new Date(exp.date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "—";
  const amountSafe = Number(exp.amount).toLocaleString("en-BD");

  const html = `<!DOCTYPE html><html><head><title>Expense Voucher — ${voucherNoSafe}</title>
<style>body{font-family:"Segoe UI",sans-serif;margin:0;background:#fff}.page{max-width:600px;margin:32px auto;padding:32px;border:2px solid #2d5a27;border-radius:12px}.header{text-align:center;border-bottom:2px solid #eee;padding-bottom:16px;margin-bottom:20px}.org{font-size:22px;font-weight:800;color:#154212}.sub{font-size:12px;color:#526345;margin-top:2px}.vb{display:inline-block;background:#d2e6c0;color:#154212;padding:4px 14px;border-radius:999px;font-size:12px;font-weight:700;margin-top:10px}.title{font-size:18px;font-weight:700;color:#1b1c1a;margin:20px 0 4px}table{width:100%;border-collapse:collapse;margin-top:16px}td{padding:10px 12px;font-size:13px;border-bottom:1px solid #f0f0f0}td:first-child{color:#42493e;font-weight:600;width:38%}.ar td{font-size:17px;font-weight:800;color:#154212;background:#eaffe0}.footer{margin-top:32px;display:flex;justify-content:space-between}.sig{text-align:center;width:45%}.sig-line{border-top:1px solid #aaa;padding-top:6px;font-size:12px;color:#526345}</style></head>
<body><div class="page"><div class="header"><div class="org">কুঞ্জছায়া ক্লাব</div><div class="sub">Kunjachaya Residential Area, Bayezid Bostami, Chattogram</div><div class="vb">EXPENSE VOUCHER</div></div>
<div class="title">${titleSafe}</div>
<table>
<tr><td>Voucher No</td><td>${voucherNoSafe}</td></tr>
<tr><td>Category</td><td>${cat.icon} ${catLabelSafe}</td></tr>
<tr><td>Payee</td><td>${payeeSafe}</td></tr>
<tr><td>Date</td><td>${dateSafe}</td></tr>
<tr><td>Approved By</td><td>${approvedBySafe}</td></tr>
<tr class="ar"><td>Amount (BDT)</td><td>৳ ${amountSafe}</td></tr>
</table>
<div class="footer">
<div class="sig"><div style="height:48px"></div><div class="sig-line">Treasurer</div></div>
<div class="sig"><div style="height:48px"></div><div class="sig-line">General Secretary</div></div>
<div class="sig"><div style="height:48px"></div><div class="sig-line">President</div></div>
</div></div></body></html>`;

  try {
    let iframe = document.getElementById("expense-print-iframe");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "expense-print-iframe";
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
      doc.write(html);
      doc.close();
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.print();
        }
      }, 400);
      return;
    }
  } catch (err) {
    console.warn("Iframe print fallback:", err);
  }

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  } else {
    window.print();
  }
}

function Empty({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <ReceiptText size={40} style={{ color: C.outline, opacity: 0.4, marginBottom: 12 }} />
      <p className="text-sm" style={{ color: C.onSurfaceVariant }}>{message}</p>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone = "neutral", small }) {
  const tones = {
    neutral: { bg: C.surfaceContainer, fg: C.onSurface, ic: C.onSurfaceVariant },
    danger:  { bg: C.errorContainer, fg: C.onErrorContainer, ic: C.onErrorContainer },
    info:    { bg: C.infoContainer, fg: C.onInfoContainer, ic: C.onInfoContainer },
    primary: { bg: C.primaryContainer, fg: C.onPrimaryContainer, ic: C.onPrimaryContainer },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-1" style={{ backgroundColor: t.bg, border: `1px solid ${C.outlineVariant}` }}>
      <div className="flex items-center justify-between">
        <span className={`${small ? "text-[11px]" : "text-xs"} font-semibold`} style={{ color: t.fg, opacity: 0.75 }}>{label}</span>
        <Icon size={16} style={{ color: t.ic }} />
      </div>
      <span className={`font-extrabold ${small ? "text-sm" : "text-lg"} leading-tight`} style={{ color: t.fg }}>{value}</span>
    </div>
  );
}

function ActionBtn({ icon: Icon, title, onClick, danger }) {
  return (
    <button onClick={onClick} title={title}
      className="p-1.5 rounded-lg transition-colors hover:opacity-80 active:scale-95"
      style={{ color: danger ? C.error : C.onSurfaceVariant, backgroundColor: danger ? C.errorContainer : C.surfaceContainerHigh }}>
      <Icon size={15} strokeWidth={2} />
    </button>
  );
}

function VoucherDetail({ exp, isBn }) {
  const cat = getCat(exp.category);
  const rows = [
    { label: isBn ? "ভাউচার নম্বর" : "Voucher No", value: exp.voucherNo, mono: true },
    { label: isBn ? "শ্রেণি" : "Category", value: `${cat.icon} ${isBn ? cat.labelBn : cat.labelEn}` },
    { label: isBn ? "প্রাপক" : "Payee", value: exp.payee },
    { label: isBn ? "অনুমোদনকারী" : "Approved By", value: exp.approvedBy },
    { label: isBn ? "তারিখ" : "Date", value: exp.date ? new Date(exp.date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "—" },
  ];
  return (
    <div>
      <div className="rounded-xl p-4 mb-4 flex items-center justify-between" style={{ backgroundColor: C.primaryContainer }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.onPrimaryContainer, opacity: 0.7 }}>
            {isBn ? "মোট পরিমাণ" : "Total Amount"}
          </p>
          <p className="text-3xl font-black mt-0.5" style={{ color: C.onPrimaryContainer }}>
            ৳ {Number(exp.amount).toLocaleString("en-BD")}
          </p>
        </div>
        <ReceiptText size={36} style={{ color: C.onPrimaryContainer, opacity: 0.4 }} />
      </div>
      <h3 className="text-base font-bold mb-3" style={{ color: C.onSurface }}>{exp.title}</h3>
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.outlineVariant}` }}>
        {rows.map((r, i) => (
          <div key={r.label} className="flex items-center px-4 py-2.5" style={{
            borderTop: i > 0 ? `1px solid ${C.outlineVariant}` : "none",
            backgroundColor: i % 2 === 0 ? C.surface : C.surfaceContainerLow,
          }}>
            <span className="text-xs font-semibold w-36 flex-shrink-0" style={{ color: C.onSurfaceVariant }}>{r.label}</span>
            <span className={`text-sm ${r.mono ? "font-mono" : "font-medium"}`} style={{ color: C.onSurface }}>{r.value || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════ MAIN ══ */
export default function AdminExpenses({ session = {}, db = {}, persist, toast, logActivity, lang = "en" }) {
  const isBn = lang === "bn";
  const isAdmin = session?.role === "admin";
  const canManage = isAdmin && (
    session?.post === "President" ||
    session?.post === "General Secretary" ||
    session?.post === "Treasurer" ||
    session?.permissions?.canManageFinancials
  );

  const expenses = db.expenses || [];

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewExp, setViewExp] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const blank = () => ({
    title: "", category: "maintenance", amount: "",
    voucherNo: nextVoucher(expenses),
    payee: "", approvedBy: session?.name || "",
    date: new Date().toISOString().split("T")[0],
  });
  const [form, setForm] = useState(blank());

  // Memoize list filtering, sorting, and filtered total calculation to avoid re-sorting date objects on input/modal renders
  const { filtered, totalFiltered } = useMemo(() => {
    let list = expenses;
    if (catFilter !== "all") list = list.filter(e => e.category === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        (e.title || "").toLowerCase().includes(q) ||
        (e.voucherNo || "").toLowerCase().includes(q) ||
        (e.payee || "").toLowerCase().includes(q)
      );
    }
    const sortedList = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
    const total = sortedList.reduce((s, e) => s + Number(e.amount), 0);
    return { filtered: sortedList, totalFiltered: total };
  }, [expenses, catFilter, search]);

  // Single-pass memoization for overall expenditure KPIs and category breakdown
  const { totalAll, topCat } = useMemo(() => {
    let total = 0;
    const catMap = {};
    for (let i = 0; i < expenses.length; i++) {
      const amt = Number(expenses[i].amount) || 0;
      total += amt;
      catMap[expenses[i].category] = (catMap[expenses[i].category] || 0) + amt;
    }
    const top = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
    return { totalAll: total, topCat: top };
  }, [expenses]);

  function openAdd() { setEditId(null); setForm(blank()); setShowForm(true); }
  function openEdit(exp) {
    setEditId(exp.id);
    setForm({
      title: exp.title, category: exp.category, amount: exp.amount,
      voucherNo: exp.voucherNo, payee: exp.payee, approvedBy: exp.approvedBy,
      date: exp.date ? exp.date.split("T")[0] : new Date().toISOString().split("T")[0],
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { toast?.("error", isBn ? "শিরোনাম আবশ্যক।" : "Title is required."); return; }
    if (!form.amount || Number(form.amount) <= 0) { toast?.("error", isBn ? "সঠিক পরিমাণ লিখুন।" : "Enter a valid amount."); return; }
    if (!form.payee.trim()) { toast?.("error", isBn ? "পরিশোধ প্রাপকের নাম আবশ্যক।" : "Payee is required."); return; }
    setSaving(true);
    try {
      if (editId) {
        persist(prev => ({
          ...prev,
          expenses: prev.expenses.map(e =>
            e.id === editId ? { ...e, ...form, amount: Number(form.amount) } : e
          ),
        }));
        logActivity?.(`Updated expense: ${form.title} (${form.voucherNo})`);
        toast?.("success", isBn ? "খরচ আপডেট হয়েছে।" : "Expense updated.");
      } else {
        const entry = { id: uid(), ...form, amount: Number(form.amount) };
        persist(prev => ({ ...prev, expenses: [entry, ...prev.expenses] }));
        logActivity?.(`Added expense: ${form.title} (${form.voucherNo}) — ৳${form.amount}`);
        toast?.("success", isBn ? "নতুন খরচ যোগ হয়েছে।" : "Expense added.");
      }
      setShowForm(false);
    } catch (err) {
      toast?.("error", err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(exp) {
    try {
      persist(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== exp.id) }));
      logActivity?.(`Deleted expense: ${exp.title} (${exp.voucherNo})`);
      toast?.("success", isBn ? "খরচ মুছে দেওয়া হয়েছে।" : "Expense deleted.");
    } finally { setDeleteConfirm(null); }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: C.onSurface }}>
            <TrendingDown size={26} style={{ color: C.tertiary }} />
            {isBn ? "ব্যয় খতিয়ান" : "Expenses Ledger"}
          </h1>
          <p className="text-sm mt-1" style={{ color: C.onSurfaceVariant }}>
            {isBn ? "ক্লাবের সমস্ত ব্যয় ভাউচার ও ব্যয়ের হিসাব" : "Club expenditure vouchers & financial outflows"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {expenses.length > 0 && (
            <Btn variant="outline" size="sm" icon={FileSpreadsheet} onClick={() => exportCSV(filtered)}>
              {isBn ? "এক্সপোর্ট" : "Export"}
            </Btn>
          )}
          {canManage && (
            <Btn variant="primary" size="sm" icon={Plus} onClick={openAdd}>
              {isBn ? "খরচ যোগ" : "Add Expense"}
            </Btn>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
        <StatCard label={isBn ? "মোট ব্যয়" : "Total Expenses"} value={`৳ ${totalAll.toLocaleString("en-BD")}`} icon={Banknote} tone="danger" />
        <StatCard label={isBn ? "মোট ভাউচার" : "Total Vouchers"} value={expenses.length} icon={ReceiptText} tone="neutral" />
        <StatCard label={isBn ? "ফিল্টার মোট" : "Filtered Total"} value={`৳ ${totalFiltered.toLocaleString("en-BD")}`} icon={Filter} tone="info" />
        <StatCard
          label={isBn ? "সর্বোচ্চ শ্রেণি" : "Top Category"}
          value={topCat ? `${getCat(topCat[0]).icon} ${isBn ? getCat(topCat[0]).labelBn : getCat(topCat[0]).labelEn}` : "—"}
          icon={PieChart} tone="primary" small
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.outline }} />
          <input
            className={inputCls + " pl-9"} style={inputStyle()}
            placeholder={isBn ? "শিরোনাম, ভাউচার বা প্রাপক খুঁজুন…" : "Search title, voucher or payee…"}
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <select className={inputCls + " pr-8 appearance-none cursor-pointer"}
            style={{ ...inputStyle(), minWidth: 160 }}
            value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="all">{isBn ? "সকল শ্রেণি" : "All Categories"}</option>
            {CATEGORIES.map(c => (
              <option key={c.key} value={c.key}>{c.icon} {isBn ? c.labelBn : c.labelEn}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: C.outline }} />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Empty message={isBn ? "কোনো খরচের ভাউচার পাওয়া যায়নি।" : "No expense vouchers found."} />
      ) : (
        <div className="overflow-hidden rounded-2xl" style={{ border: `1px solid ${C.outlineVariant}` }}>
          <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[2fr_1fr_auto_auto] gap-3 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
            style={{ backgroundColor: C.surfaceContainerHigh, color: C.onSurfaceVariant }}>
            <span>{isBn ? "শিরোনাম ও ভাউচার" : "Title & Voucher"}</span>
            <span className="hidden sm:block text-right">{isBn ? "তারিখ" : "Date"}</span>
            <span className="text-right">{isBn ? "পরিমাণ" : "Amount"}</span>
            <span className="text-right">{isBn ? "কার্যক্রম" : "Actions"}</span>
          </div>
          {filtered.map((exp, idx) => {
            const cat = getCat(exp.category);
            return (
              <div key={exp.id}
                className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[2fr_1fr_auto_auto] gap-3 items-center px-4 py-3.5"
                style={{
                  borderTop: idx > 0 ? `1px solid ${C.outlineVariant}` : "none",
                  backgroundColor: idx % 2 === 0 ? C.surface : C.surfaceContainerLow,
                }}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold truncate" style={{ color: C.onSurface }}>{exp.title}</span>
                    <Badge tone="neutral" className="hidden sm:inline-flex">{cat.icon} {isBn ? cat.labelBn : cat.labelEn}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: C.onSurfaceVariant }}>
                    <span className="font-mono">{exp.voucherNo}</span>
                    <span>·</span>
                    <span className="truncate">{exp.payee}</span>
                  </div>
                </div>
                <div className="hidden sm:block text-right text-xs font-medium" style={{ color: C.onSurfaceVariant }}>
                  {exp.date ? new Date(exp.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold" style={{ color: C.tertiary }}>
                    ৳ {Number(exp.amount).toLocaleString("en-BD")}
                  </span>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <ActionBtn icon={Eye} title="View" onClick={() => setViewExp(exp)} />
                  <ActionBtn icon={Printer} title="Print" onClick={() => printVoucher(exp)} />
                  {canManage && <ActionBtn icon={Edit3} title="Edit" onClick={() => openEdit(exp)} />}
                  {canManage && <ActionBtn icon={Trash2} title="Delete" danger onClick={() => setDeleteConfirm(exp)} />}
                </div>
              </div>
            );
          })}
          {filtered.length > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t"
              style={{ borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerHigh }}>
              <span className="text-xs font-semibold" style={{ color: C.onSurfaceVariant }}>
                {isBn ? `${filtered.length}টি এন্ট্রি` : `${filtered.length} entries`}
              </span>
              <span className="text-sm font-extrabold" style={{ color: C.primary }}>
                {isBn ? "মোট: " : "Total: "}৳ {totalFiltered.toLocaleString("en-BD")}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <Modal open={true}
          title={editId ? (isBn ? "খরচ সম্পাদনা করুন" : "Edit Expense") : (isBn ? "নতুন খরচ যোগ করুন" : "Add New Expense")}
          onClose={() => setShowForm(false)}>
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-x-4">
            <Field label={isBn ? "শিরোনাম *" : "Title *"}>
              <input className={inputCls} style={inputStyle()}
                placeholder={isBn ? "যেমন: পরিষ্কারকর্মীর বেতন" : "e.g. Cleaning staff wages"}
                value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </Field>
            <Field label={isBn ? "ভাউচার নম্বর *" : "Voucher No *"}>
              <input className={inputCls + " font-mono"} style={inputStyle()}
                value={form.voucherNo} onChange={e => setForm(p => ({ ...p, voucherNo: e.target.value }))} />
            </Field>
            <Field label={isBn ? "পরিমাণ (BDT) *" : "Amount (BDT) *"}>
              <input className={inputCls} style={inputStyle()} type="number" min="1" placeholder="0"
                value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            </Field>
            <Field label={isBn ? "শ্রেণি *" : "Category *"}>
              <select className={inputCls} style={inputStyle()}
                value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => (
                  <option key={c.key} value={c.key}>{c.icon} {isBn ? c.labelBn : c.labelEn}</option>
                ))}
              </select>
            </Field>
            <Field label={isBn ? "পরিশোধ প্রাপক *" : "Payee *"}>
              <input className={inputCls} style={inputStyle()}
                placeholder={isBn ? "যার কাছে পরিশোধ করা হয়েছে" : "Paid to (person/vendor)"}
                value={form.payee} onChange={e => setForm(p => ({ ...p, payee: e.target.value }))} />
            </Field>
            <Field label={isBn ? "অনুমোদনকারী" : "Approved By"}>
              <input className={inputCls} style={inputStyle()}
                placeholder={isBn ? "অনুমোদনকারীর নাম" : "Approving officer"}
                value={form.approvedBy} onChange={e => setForm(p => ({ ...p, approvedBy: e.target.value }))} />
            </Field>
            <Field label={isBn ? "তারিখ" : "Date"}>
              <input className={inputCls} style={inputStyle()} type="date"
                value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: C.outlineVariant }}>
            <Btn variant="outline" onClick={() => setShowForm(false)}>{isBn ? "বাতিল" : "Cancel"}</Btn>
            <Btn variant="primary" onClick={handleSave} disabled={saving} icon={CheckCircle2}>
              {saving ? (isBn ? "সংরক্ষণ হচ্ছে…" : "Saving…") : editId ? (isBn ? "আপডেট করুন" : "Update") : (isBn ? "সংরক্ষণ করুন" : "Save")}
            </Btn>
          </div>
        </Modal>
      )}

      {/* View Detail Modal */}
      {viewExp && (
        <Modal open={true} title={isBn ? "ভাউচার বিবরণ" : "Voucher Detail"} onClose={() => setViewExp(null)}>
          <VoucherDetail exp={viewExp} isBn={isBn} />
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: C.outlineVariant }}>
            <Btn variant="outline" icon={Printer} onClick={() => printVoucher(viewExp)}>
              {isBn ? "প্রিন্ট করুন" : "Print"}
            </Btn>
            {canManage && (
              <Btn variant="primary" icon={Edit3} onClick={() => { openEdit(viewExp); setViewExp(null); }}>
                {isBn ? "সম্পাদনা করুন" : "Edit"}
              </Btn>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <Modal open={true} title={isBn ? "খরচ মুছুন" : "Delete Expense"} onClose={() => setDeleteConfirm(null)}>
          <div className="flex items-start gap-3 p-4 rounded-xl mb-4" style={{ backgroundColor: C.errorContainer }}>
            <AlertCircle size={20} style={{ color: C.onErrorContainer, flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: C.onErrorContainer }}>
                {isBn ? `"${deleteConfirm.title}" ভাউচারটি স্থায়ীভাবে মুছে যাবে।` : `"${deleteConfirm.title}" will be permanently deleted.`}
              </p>
              <p className="text-xs mt-1" style={{ color: C.onErrorContainer }}>
                {isBn ? "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।" : "This action cannot be undone."}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Btn variant="outline" onClick={() => setDeleteConfirm(null)}>{isBn ? "বাতিল" : "Cancel"}</Btn>
            <Btn variant="danger" icon={Trash2} onClick={() => handleDelete(deleteConfirm)}>
              {isBn ? "মুছুন" : "Delete"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

