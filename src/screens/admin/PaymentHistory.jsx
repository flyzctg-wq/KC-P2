import React, { useState, useMemo } from "react";
import {
  Receipt, Search, Filter, Download, Printer, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, DollarSign, Users, Calendar, X,
  CheckCircle2, Clock, CreditCard, Banknote, Smartphone,
  BarChart3, ArrowLeft, FileSpreadsheet, SlidersHorizontal,
  Building, AlertTriangle, RefreshCw, FileText
} from "lucide-react";
import { Card, Badge, inputCls, inputStyle, Empty, SectionTitle } from "../../components/primitives";
import InvoiceReceiptModal from "../../components/InvoiceReceiptModal";
import { C, BLOCKS } from "../../theme";
import { currency, monthLabel, fmtDate } from "../../utils";

const PAYMENT_METHODS = ["All", "Cash", "bKash", "Nagad", "Bank Transfer", "Cheque"];
const CHARGE_TYPES = ["all", "monthly", "gm_levy", "special"];
const CHARGE_TYPE_LABELS = { all: "All Types", monthly: "Monthly Dues", gm_levy: "GM Levy", special: "Special Charge" };

function KpiCard({ icon: Icon, label, value, sub, color = "emerald" }) {
  const colors = {
    emerald: { bg: "bg-emerald-50", icon: "bg-emerald-600 text-white", text: "text-emerald-700", val: "text-emerald-900" },
    rose:    { bg: "bg-rose-50",    icon: "bg-rose-600 text-white",    text: "text-rose-700",    val: "text-rose-900" },
    amber:   { bg: "bg-amber-50",   icon: "bg-amber-600 text-white",   text: "text-amber-700",   val: "text-amber-900" },
    blue:    { bg: "bg-blue-50",    icon: "bg-blue-600 text-white",    text: "text-blue-700",    val: "text-blue-900" },
  };
  const cl = colors[color];
  return (
    <div className={`rounded-2xl p-4 flex items-center gap-3 border ${cl.bg}`} style={{ borderColor: C.outlineVariant }}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${cl.icon}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className={`text-[11px] font-semibold ${cl.text}`}>{label}</p>
        <p className={`text-lg font-black leading-tight ${cl.val}`}>{value}</p>
        {sub && <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "paid") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
      <CheckCircle2 size={9} /> Paid
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
      <Clock size={9} /> Pending
    </span>
  );
}

function MethodBadge({ method }) {
  if (!method) return <span className="text-gray-400 text-[10px]">—</span>;
  const map = {
    "bKash": "bg-pink-100 text-pink-800",
    "Nagad": "bg-orange-100 text-orange-800",
    "Bank Transfer": "bg-blue-100 text-blue-800",
    "Cheque": "bg-purple-100 text-purple-800",
    "Cash": "bg-slate-100 text-slate-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${map[method] || "bg-slate-100 text-slate-700"}`}>
      {method}
    </span>
  );
}

export default function PaymentHistory({ session = {}, db = {}, go, lang = "en" }) {
  const isBn = lang === "bn";

  const isTopTier = session?.role === "admin" &&
    (session?.post === "President" || session?.post === "General Secretary");
  const isTreasurer = session?.role === "admin" && session?.post === "Treasurer";
  const canView = session?.role === "admin" &&
    (session?.permissions?.canManageFinancials || isTopTier || isTreasurer);

  const [showFilters, setShowFilters] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [blockFilter, setBlockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [chargeTypeFilter, setChargeTypeFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("All");
  const [collectorFilter, setCollectorFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const allDues = useMemo(() => db.dues || [], [db.dues]);
  const allUsers = useMemo(() => db.users || [], [db.users]);

  const treasurerUser = useMemo(() => allUsers.find(u => u.post === "Treasurer") || { name: "Golam Sarwar Jony", nameBn: "গোলাম সরোয়ার জনি", post: "Treasurer" }, [allUsers]);
  const gsUser = useMemo(() => allUsers.find(u => u.post === "General Secretary") || { name: "Khalid Hasan", nameBn: "খালিদ হাসান", post: "General Secretary" }, [allUsers]);
  const presidentUser = useMemo(() => allUsers.find(u => u.post === "President") || { name: "Zakaria Hasan", nameBn: "জাকারিয়া হাছান", post: "President" }, [allUsers]);

  const availableMonths = useMemo(() => {
    return [...new Set(allDues.map(d => d.month).filter(Boolean))].sort().reverse();
  }, [allDues]);

  const availableCollectors = useMemo(() => {
    return [...new Set(allDues.map(d => d.collectedBy).filter(Boolean))];
  }, [allDues]);

  const enrichedRecords = useMemo(() => {
    return allDues.map(d => {
      const user = allUsers.find(u => u.id === d.residentId) || {};
      return { ...d, _user: user };
    });
  }, [allDues, allUsers]);

  const filtered = useMemo(() => {
    return enrichedRecords.filter(d => {
      const u = d._user;
      const q = searchQ.trim().toLowerCase();
      if (q && !((u.name||"").toLowerCase().includes(q)||(u.nameBn||"").toLowerCase().includes(q)||(u.unit||"").toLowerCase().includes(q)||(u.phone||"").includes(q)||(d.ref||"").toLowerCase().includes(q)||(d.chargeTitle||"").toLowerCase().includes(q))) return false;
      if (monthFilter !== "all" && d.month !== monthFilter) return false;
      if (blockFilter !== "all" && u.block !== blockFilter) return false;
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (chargeTypeFilter !== "all" && (d.chargeType||"monthly") !== chargeTypeFilter) return false;
      if (methodFilter !== "All" && d.method !== methodFilter) return false;
      if (collectorFilter !== "all" && d.collectedBy !== collectorFilter) return false;
      if (dateFrom && d.paidDate && new Date(d.paidDate) < new Date(dateFrom)) return false;
      if (dateTo && d.paidDate && new Date(d.paidDate) > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [enrichedRecords, searchQ, monthFilter, blockFilter, statusFilter, chargeTypeFilter, methodFilter, collectorFilter, dateFrom, dateTo]);

  const totalCollected = filtered.filter(d => d.status === "paid").reduce((s, d) => s + (Number(d.receivedAmount)||Number(d.amount)||0), 0);
  const totalPending = filtered.filter(d => d.status !== "paid").reduce((s, d) => s + (Number(d.amount)||0), 0);
  const totalDiscount = filtered.reduce((s, d) => s + (Number(d.discount)||0), 0);
  const uniqueMembers = new Set(filtered.map(d => d.residentId)).size;
  const displayRows = filtered.slice(0, rowsPerPage);

  const handleExportCSV = () => {
    const headers = ["Serial","Paid Date","Unit","Member Name","Mobile","Block","Period","Charge Type","Bill Amount","Received","Discount","Balance Due","Status","Receipt No","Method","Collected By","Remarks"];
    const rows = filtered.map((d, i) => {
      const u = d._user;
      const isPaid = d.status === "paid";
      return [i+1, d.paidDate ? fmtDate(d.paidDate) : "", u.unit||"", u.name||"", u.phone||"", u.block||"", monthLabel(d.month), CHARGE_TYPE_LABELS[d.chargeType]||d.chargeType||"Monthly", d.amount||0, d.receivedAmount||(isPaid?d.amount:0)||0, d.discount||0, d.balanceDue||(isPaid?0:d.amount)||0, isPaid?"Paid":"Pending", d.ref||"", d.method||"", d.collectedBy||"", d.note||""]
      .map(v => `"${String(v).replace(/"/g,'""')}"`).join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF"+csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `KC_PaymentHistory_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const resetFilters = () => { setSearchQ(""); setMonthFilter("all"); setBlockFilter("all"); setStatusFilter("all"); setChargeTypeFilter("all"); setMethodFilter("All"); setCollectorFilter("all"); setDateFrom(""); setDateTo(""); };

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center">
          <AlertTriangle size={28} className="text-rose-600" />
        </div>
        <div className="text-center">
          <p className="font-black text-gray-900 text-lg">Access Restricted</p>
          <p className="text-sm text-gray-500 mt-1">Only Treasurer, President or General Secretary can view payment history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-full overflow-x-hidden">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: C.outlineVariant }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #1d4ed8, #1e40af)" }}>
            <Receipt size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">
              {isBn ? "চাঁদা গ্রহণ ইতিহাস" : "Bill Receive History"}
            </h1>
            <p className="text-xs text-gray-500">
              {isBn ? "সকল পেমেন্ট লেনদেনের সম্পূর্ণ রেকর্ড" : "Complete ledger of all payment transactions · Authorized Personnel Only"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowFilters(p => !p)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-gray-700 transition-colors">
            <SlidersHorizontal size={14} /> {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors shadow-sm">
            <FileSpreadsheet size={14} /> {isBn ? "CSV ডাউনলোড" : "Export CSV"}
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-colors shadow-sm">
            <Printer size={14} /> {isBn ? "প্রিন্ট" : "Print"}
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={DollarSign} label={isBn ? "মোট গৃহীত" : "Total Collected"} value={`৳${currency(totalCollected)}`} sub={`${filtered.filter(d=>d.status==="paid").length} paid records`} color="emerald" />
        <KpiCard icon={TrendingDown} label={isBn ? "মোট বকেয়া" : "Total Pending"} value={`৳${currency(totalPending)}`} sub={`${filtered.filter(d=>d.status!=="paid").length} unpaid`} color="rose" />
        <KpiCard icon={Receipt} label={isBn ? "মোট রেকর্ড" : "Total Records"} value={filtered.length.toLocaleString()} sub={`From ${allDues.length} total`} color="blue" />
        <KpiCard icon={Users} label={isBn ? "অনন্য সদস্য" : "Unique Members"} value={uniqueMembers} sub={totalDiscount > 0 ? `৳${currency(totalDiscount)} discount` : "No discounts"} color="amber" />
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Filter size={13} className="text-blue-600" /> {isBn ? "ফিল্টার ও অনুসন্ধান" : "Filter & Search"}
            </span>
            <button onClick={resetFilters} className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1">
              <RefreshCw size={11} /> {isBn ? "রিসেট" : "Reset All"}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            <div className="col-span-2 sm:col-span-3 lg:col-span-2 relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder={isBn ? "নাম, ইউনিট, ফোন, রসিদ নং..." : "Name, unit, phone, receipt no..."} style={inputStyle()} className={inputCls + " pl-8 text-xs"} />
            </div>
            <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} style={inputStyle()} className={inputCls + " text-xs"}>
              <option value="all">{isBn ? "সকল মাস" : "All Months"}</option>
              {availableMonths.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={inputStyle()} className={inputCls + " text-xs"}>
              <option value="all">{isBn ? "সকল স্ট্যাটাস" : "All Status"}</option>
              <option value="paid">{isBn ? "পরিশোধিত" : "Paid"}</option>
              <option value="pending">{isBn ? "বকেয়া" : "Pending"}</option>
            </select>
            <select value={blockFilter} onChange={e => setBlockFilter(e.target.value)} style={inputStyle()} className={inputCls + " text-xs"}>
              <option value="all">{isBn ? "সকল ব্লক" : "All Blocks"}</option>
              {(BLOCKS||[]).map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={chargeTypeFilter} onChange={e => setChargeTypeFilter(e.target.value)} style={inputStyle()} className={inputCls + " text-xs"}>
              {Object.entries(CHARGE_TYPE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} style={inputStyle()} className={inputCls + " text-xs"}>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={collectorFilter} onChange={e => setCollectorFilter(e.target.value)} style={inputStyle()} className={inputCls + " text-xs"}>
              <option value="all">{isBn ? "সকল কালেক্টর" : "All Collectors"}</option>
              {availableCollectors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div>
              <p className="text-[10px] text-gray-500 mb-0.5">{isBn ? "পরিশোধ (হতে)" : "Paid From"}</p>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle()} className={inputCls + " text-xs"} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 mb-0.5">{isBn ? "পরিশোধ (পর্যন্ত)" : "Paid To"}</p>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle()} className={inputCls + " text-xs"} />
            </div>
          </div>
        </Card>
      )}

      {/* RESULTS BAR */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-gray-500 font-semibold">
          {isBn ? `${filtered.length}টি রেকর্ড` : `Showing ${displayRows.length} of ${filtered.length} records`}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500">{isBn ? "প্রতি পাতা:" : "Per page:"}</span>
          <select value={rowsPerPage} onChange={e => setRowsPerPage(Number(e.target.value))} style={inputStyle()} className={inputCls + " text-xs py-1 px-2 w-20"}>
            {[25,50,100,200,500].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* DATA TABLE */}
      {filtered.length === 0 ? (
        <Empty icon={Receipt} title={isBn ? "কোনো রেকর্ড পাওয়া যায়নি" : "No records found"} sub={isBn ? "ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।" : "Try adjusting your filters."} />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ minWidth: "1200px" }}>
              <thead>
                <tr className="border-b" style={{ backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }}>
                  {["#","Paid Date","Unit","Member Name","Mobile","Block","Period","Type","Bill ৳","Received ৳","Discount ৳","Balance ৳","Status","Receipt No","Method","Collected By","Remarks","Receipt"].map((col,i) => (
                    <th key={i} className="px-3 py-2.5 text-left font-bold whitespace-nowrap text-[10px] uppercase tracking-wide" style={{ color: C.onSurfaceVariant }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.map((d, idx) => {
                  const u = d._user;
                  const isPaid = d.status === "paid";
                  const received = Number(d.receivedAmount)||(isPaid ? Number(d.amount) : 0);
                  const balance = Number(d.balanceDue)||(isPaid ? 0 : Number(d.amount));
                  return (
                    <tr key={d.id} className="border-b hover:bg-slate-50/70 transition-colors" style={{ borderColor: C.outlineVariant, backgroundColor: idx%2===1 ? "rgba(0,0,0,0.012)" : undefined }}>
                      <td className="px-3 py-2 font-bold text-gray-400">{idx+1}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-600 text-[10px]">{d.paidDate ? fmtDate(d.paidDate) : <span className="text-gray-300 italic">—</span>}</td>
                      <td className="px-3 py-2"><span className="inline-flex items-center px-2 py-0.5 rounded-lg font-bold bg-blue-50 text-blue-800 text-[10px]">{u.unit||"—"}</span></td>
                      <td className="px-3 py-2 font-semibold text-gray-900 whitespace-nowrap">{u.name||<span className="text-gray-300 italic">—</span>}{u.nameBn&&<div className="text-[9px] text-gray-400 font-normal">{u.nameBn}</div>}</td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap font-mono text-[10px]">{u.phone||"—"}</td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap text-[10px]">{u.block||"—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-semibold text-gray-700">{monthLabel(d.month)}</td>
                      <td className="px-3 py-2 whitespace-nowrap"><span className="text-[10px] font-semibold text-gray-600">{CHARGE_TYPE_LABELS[d.chargeType]||d.chargeTitle||"Monthly"}</span></td>
                      <td className="px-3 py-2 font-black whitespace-nowrap">
                        {isPaid ? <span className="text-emerald-700 dark:text-emerald-400 font-black">৳{currency(received)}</span> : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{Number(d.discount)>0 ? <span className="font-semibold text-amber-700">৳{currency(d.discount)}</span> : <span className="text-gray-300">—</span>}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{balance>0 ? <span className="font-bold text-rose-600">৳{currency(balance)}</span> : <span className="text-emerald-600 font-bold text-[10px]">✓ Clear</span>}</td>
                      <td className="px-3 py-2"><StatusBadge status={d.status} /></td>
                      <td className="px-3 py-2 font-mono text-[9px] text-gray-600 whitespace-nowrap">{d.ref||<span className="text-gray-300">—</span>}</td>
                      <td className="px-3 py-2"><MethodBadge method={d.method} /></td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-700 font-semibold text-[10px]">{d.collectedBy||<span className="text-gray-300">—</span>}</td>
                      <td className="px-3 py-2 text-gray-500 max-w-[140px] truncate text-[10px]">{d.note||<span className="text-gray-200">—</span>}</td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(d)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1 transition-colors shadow-xs"
                          title={isBn ? "অফিসিয়াল প্যাড রসিদ দেখুন" : "View Official Receipt"}
                        >
                          <FileText size={12} /> {isBn ? "রসিদ" : "Receipt"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-black" style={{ borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow }}>
                  <td colSpan={8} className="px-3 py-2.5 text-right text-xs font-black text-gray-700">{isBn ? "মোট (ফিল্টার করা)" : "TOTALS (filtered)"}</td>
                  <td className="px-3 py-2.5 text-xs font-black text-gray-900">৳{currency(filtered.reduce((s,d)=>s+(Number(d.amount)||0),0))}</td>
                  <td className="px-3 py-2.5 text-xs font-black text-emerald-700">৳{currency(totalCollected)}</td>
                  <td className="px-3 py-2.5 text-xs font-black text-amber-700">৳{currency(totalDiscount)}</td>
                  <td className="px-3 py-2.5 text-xs font-black text-rose-700">৳{currency(totalPending)}</td>
                  <td colSpan={6} />
                </tr>
              </tfoot>
            </table>
          </div>
          {filtered.length > rowsPerPage && (
            <div className="p-3 border-t text-center" style={{ borderColor: C.outlineVariant }}>
              <button onClick={() => setRowsPerPage(p => p+50)} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-gray-700 transition-colors">
                {isBn ? `আরও ${Math.min(50,filtered.length-rowsPerPage)}টি দেখান` : `Load ${Math.min(50,filtered.length-rowsPerPage)} more`}
              </button>
            </div>
          )}
        </Card>
      )}

      <p className="text-[10px] text-gray-400 text-center pb-2">
        {isBn ? `মোট ${allDues.length}টি লেনদেন • কুঞ্জছায়া ক্লাব ফিনান্সিয়াল লেজার` : `${allDues.length} total transactions • Kunjachaya Club Financial Ledger`}
      </p>

      {/* Official Letter Pad Money Receipt Modal */}
      <InvoiceReceiptModal
        open={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        invoice={selectedReceipt}
        treasurer={treasurerUser}
        gs={gsUser}
        president={presidentUser}
        lang={lang}
      />
    </div>
  );
}
