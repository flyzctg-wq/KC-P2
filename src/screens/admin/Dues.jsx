import React, { useState, useMemo } from "react";
import {
  Shield, Send, Plus, CreditCard, DollarSign, ArrowUpRight, ArrowDownRight,
  Wallet, CheckCircle2, Clock, Search, Filter, Printer, MessageCircle, Phone,
  FileText, Check, AlertTriangle, Layers, Building, RefreshCw, Zap, Download,
  FileSpreadsheet, Mail, MoreVertical, Edit, Trash2, User, ChevronDown, ChevronUp,
  Receipt, ArrowRight, Share2, CheckSquare, Square, X
} from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Avatar, Empty, Modal, SectionTitle } from "../../components/primitives";
import InvoiceReceiptModal from "../../components/InvoiceReceiptModal";
import { C, BLOCKS, MEMBER_CLASSES } from "../../theme";
import { uid, currency, monthLabel, currentMonthYM, fmtDate, cleanPhone } from "../../utils";

export default function AdminDues({ session, db = {}, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const ym = currentMonthYM();

  const isTopTier = session?.role === "admin" && (session?.post === "President" || session?.post === "General Secretary");
  const isTreasurer = session?.role === "admin" && session?.post === "Treasurer";
  const canManage = session?.permissions?.canManageFinancials || isTopTier || isTreasurer;

  // Active Tab & View Mode
  const [activeTab, setActiveTab] = useState("billing"); // "billing" | "expenses" | "analytics" | "gateway"
  const [selectedMonth, setSelectedMonth] = useState(ym);
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "paid" | "pending"
  const [blockFilter, setBlockFilter] = useState("all");
  const [chargeTypeFilter, setChargeTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedRows, setSelectedRows] = useState([]);

  // Modals
  const [billReceiveModal, setBillReceiveModal] = useState(null);
  const [monthlyModal, setMonthlyModal] = useState(false);
  const [gmChargeModal, setGmChargeModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState(null);

  // Form States for "Bill Receive" Modal
  const [rcvDate, setRcvDate] = useState(new Date().toISOString().split("T")[0]);
  const [rcvPaymentMethod, setRcvPaymentMethod] = useState("Cash");
  const [rcvDiscount, setRcvDiscount] = useState(0);
  const [rcvAmount, setRcvAmount] = useState(0);
  const [rcvTxRef, setRcvTxRef] = useState("");
  const [rcvRemarks, setRcvRemarks] = useState("");
  const [rcvSendSms, setRcvSendSms] = useState(true);
  const [rcvCollectedBy, setRcvCollectedBy] = useState(session?.name || "Treasurer (Golam Sarwar Jony)");

  // Form States for Monthly Billing Generation
  const [billAmount, setBillAmount] = useState(1500);
  const [billMonth, setBillMonth] = useState(ym);
  const [billTargetBlock, setBillTargetBlock] = useState("all");
  const [billDueDate, setBillDueDate] = useState("");

  // Form States for GM Extra Charges / Special Levies
  const [gmTitle, setGmTitle] = useState("");
  const [gmAmount, setGmAmount] = useState(500);
  const [gmResolutionNo, setGmResolutionNo] = useState("");
  const [gmCategory, setGmCategory] = useState("GM Special Levy");
  const [gmTargetBlock, setGmTargetBlock] = useState("all");

  // Form States for Club Expenses
  const [expTitle, setExpTitle] = useState("");
  const [expCategory, setExpCategory] = useState("Maintenance");
  const [expAmount, setExpAmount] = useState("");
  const [expVoucherNo, setExpVoucherNo] = useState("");
  const [expPayee, setExpPayee] = useState("");

  const activeResidents = useMemo(() => (db.users || []).filter(u => u.status === "active"), [db.users]);
  const allDues = useMemo(() => db.dues || [], [db.dues]);
  const allExpenses = useMemo(() => db.expenses || [], [db.expenses]);

  // Dynamic Officers Info for Reminders & Invoices
  const treasurerUser = useMemo(() => activeResidents.find(u => u.post === "Treasurer") || { phone: "01787-268864", name: "Golam Sarwar Jony", nameBn: "গোলাম সরোয়ার জনি" }, [activeResidents]);
  const gsUser = useMemo(() => activeResidents.find(u => u.post === "General Secretary") || { phone: "01722-227207", name: "Khalid Hasan", nameBn: "খালিদ হাসান" }, [activeResidents]);
  const presidentUser = useMemo(() => activeResidents.find(u => u.post === "President") || { phone: "01400-601051", name: "Zakaria Hasan", nameBn: "জাকারিয়া হাছান" }, [activeResidents]);

  // Comprehensive Financial Metrics
  const currentMonthDues = allDues.filter(d => !selectedMonth || selectedMonth === "all" || d.month === selectedMonth);
  const paidDuesCurrentMonth = currentMonthDues.filter(d => d.status === "paid");
  const unpaidDuesCurrentMonth = currentMonthDues.filter(d => d.status !== "paid");

  const paidCount = paidDuesCurrentMonth.length;
  const unpaidCount = unpaidDuesCurrentMonth.length;
  const receivedBillAmount = paidDuesCurrentMonth.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const totalAllOverDue = allDues.filter(d => d.status !== "paid").reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const generatedBillMonth = currentMonthDues.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const totalMonthlyTargetBill = activeResidents.length * (billAmount || 1500);
  const totalAdvanceAmount = allDues.filter(d => (Number(d.advance) || 0) > 0).reduce((s, d) => s + Number(d.advance), 0);

  const totalClubExpenses = allExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalAllCollected = allDues.filter(d => d.status === "paid").reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const netReserveBalance = totalAllCollected - totalClubExpenses;

  // Filtered List of Invoices / Dues
  const filteredList = useMemo(() => {
    return allDues.filter(d => {
      const user = activeResidents.find(u => u.id === d.residentId) || {};
      const matchesMonth = selectedMonth === "all" || d.month === selectedMonth;
      const matchesStatus = statusFilter === "all" || d.status === statusFilter;
      const matchesBlock = blockFilter === "all" || user.block === blockFilter;
      const matchesType = chargeTypeFilter === "all" || (d.chargeType || "monthly") === chargeTypeFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        (user.name || "").toLowerCase().includes(q) ||
        (user.nameBn || "").toLowerCase().includes(q) ||
        (user.unit || "").toLowerCase().includes(q) ||
        (user.phone || "").toLowerCase().includes(q) ||
        (d.ref || "").toLowerCase().includes(q) ||
        (d.chargeTitle || "").toLowerCase().includes(q);
      return matchesMonth && matchesStatus && matchesBlock && matchesType && matchesSearch;
    });
  }, [allDues, activeResidents, selectedMonth, statusFilter, blockFilter, chargeTypeFilter, searchQuery]);

  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedRows.length === filteredList.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredList.map(d => d.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Open "Bill Receive" Modal
  const openBillReceive = (dueItem) => {
    const user = activeResidents.find(u => u.id === dueItem.residentId) || {};
    setBillReceiveModal({
      ...dueItem,
      resident: user,
    });
    setRcvDate(new Date().toISOString().split("T")[0]);
    setRcvAmount(dueItem.amount);
    setRcvDiscount(0);
    setRcvTxRef(`${rcvPaymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`);
    setRcvRemarks("");
  };

  // Open "Generate Invoice" Modal
  const openGenerateInvoice = (dueItem) => {
    const user = activeResidents.find(u => u.id === dueItem.residentId) || {};
    setInvoiceModal({
      ...dueItem,
      resident: user,
    });
  };

  // Submit "Bill Receive"
  const handleReceiveBillSubmit = () => {
    if (!billReceiveModal) return;

    const netReceived = Number(rcvAmount) || 0;
    const discountVal = Number(rcvDiscount) || 0;
    const payableVal = Number(billReceiveModal.amount) || 0;
    const remainingBalance = Math.max(0, payableVal - (netReceived + discountVal));

    const updatedDue = {
      ...billReceiveModal,
      status: remainingBalance === 0 ? "paid" : "pending",
      paidDate: new Date().toISOString(),
      method: rcvPaymentMethod,
      ref: rcvTxRef.trim() || `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      discount: discountVal,
      receivedAmount: netReceived,
      balanceDue: remainingBalance,
      collectedBy: rcvCollectedBy,
      note: rcvRemarks.trim() || null,
    };

    persist(d => logActivity({
      ...d,
      dues: (d.dues || []).map(item => item.id === billReceiveModal.id ? updatedDue : item)
    }, session?.name || "Treasurer", `Received bill for ${billReceiveModal.resident?.name || "member"} (৳${netReceived}) via ${rcvPaymentMethod} [Ref: ${updatedDue.ref}]`));

    toast(isBn ? `৳${netReceived} টাকা সফলভাবে গ্রহণ ও রসিদ তৈরি করা হয়েছে!` : `Successfully received ৳${netReceived} and updated ledger!`);
    setBillReceiveModal(null);
  };

  // Issue Monthly Invoices
  const handleIssueMonthlyDues = () => {
    if (!billAmount || Number(billAmount) <= 0) {
      toast(isBn ? "অনুগ্রহ করে বৈধ মাসিক চাঁদার পরিমাণ লিখুন।" : "Please enter a valid subscription amount.", "error");
      return;
    }
    const targetUsers = activeResidents.filter(u => billTargetBlock === "all" || u.block === billTargetBlock);
    const existingForMonth = allDues.filter(d => d.month === billMonth && (!d.chargeType || d.chargeType === "monthly"));
    const unbilledUsers = targetUsers.filter(u => !existingForMonth.some(d => d.residentId === u.id));

    if (unbilledUsers.length === 0) {
      toast(isBn ? "নির্বাচিত সদস্যদের জন্য এই মাসের চাঁদা ইতিমধ্যে জারি করা হয়েছে।" : "Monthly dues already issued for selected members.", "error");
      return;
    }

    const newEntries = unbilledUsers.map(u => ({
      id: uid("due"),
      residentId: u.id,
      month: billMonth,
      amount: Number(billAmount),
      chargeType: "monthly",
      chargeTitle: `Monthly Dues - ${monthLabel(billMonth)}`,
      dueDate: billDueDate || `${billMonth}-15`,
      status: "pending",
      paidDate: null,
      ref: null,
      method: null,
    }));

    persist(d => logActivity({
      ...d,
      dues: [...(d.dues || []), ...newEntries]
    }, session?.name || "Treasurer", `Issued ${monthLabel(billMonth)} monthly dues (৳${billAmount}) to ${newEntries.length} residents`));

    toast(isBn ? `${newEntries.length} জন সদস্যের জন্য ${monthLabel(billMonth)}-এর চাঁদা জারি হয়েছে!` : `Issued dues to ${newEntries.length} members for ${monthLabel(billMonth)}!`);
    setMonthlyModal(false);
  };

  // Issue GM Extra Charges / Special Levies
  const handleIssueGmCharge = () => {
    if (!gmTitle.trim()) {
      toast(isBn ? "অনুগ্রহ করে অতিরিক্ত চার্জের বিবরণ বা শিরোনাম লিখুন।" : "Please enter the GM charge title/purpose.", "error");
      return;
    }
    if (!gmAmount || Number(gmAmount) <= 0) {
      toast(isBn ? "অনুগ্রহ করে বৈধ চার্জের পরিমাণ লিখুন।" : "Please enter a valid charge amount.", "error");
      return;
    }

    const targetUsers = activeResidents.filter(u => gmTargetBlock === "all" || u.block === gmTargetBlock);

    const newEntries = targetUsers.map(u => ({
      id: uid("due"),
      residentId: u.id,
      month: ym,
      amount: Number(gmAmount),
      chargeType: "gm_special_charge",
      chargeTitle: gmTitle.trim(),
      resolutionNo: gmResolutionNo.trim() || null,
      category: gmCategory,
      status: "pending",
      paidDate: null,
      ref: null,
      method: null,
    }));

    persist(d => logActivity({
      ...d,
      dues: [...(d.dues || []), ...newEntries]
    }, session?.name || "Treasurer", `Issued GM Extra Charge: "${gmTitle}" (৳${gmAmount}) to ${newEntries.length} residents`));

    toast(isBn ? `সাধারণ সভার সিদ্ধান্ত অনুসারে ${newEntries.length} জন সদস্যের জন্য ৳${gmAmount} চার্জ যুক্ত হয়েছে!` : `GM special charge of ৳${gmAmount} issued to ${newEntries.length} members!`);
    setGmChargeModal(false);
    setGmTitle("");
    setGmResolutionNo("");
  };

  // Record Expense Voucher
  const handleAddExpense = () => {
    if (!expTitle.trim() || !expAmount || Number(expAmount) <= 0) {
      toast(isBn ? "অনুগ্রহ করে খরচের বিবরণ ও পরিমাণ লিখুন।" : "Please enter expense description and amount.", "error");
      return;
    }

    const newExpense = {
      id: uid("exp"),
      title: expTitle.trim(),
      category: expCategory,
      amount: Number(expAmount),
      voucherNo: expVoucherNo.trim() || `VCH-${Math.floor(1000 + Math.random() * 9000)}`,
      payee: expPayee.trim() || "Vendor",
      approvedBy: session?.name || "Treasurer",
      date: new Date().toISOString(),
    };

    persist(d => logActivity({
      ...d,
      expenses: [newExpense, ...(d.expenses || [])]
    }, session?.name || "Treasurer", `Recorded club expense: ${expTitle} (৳${expAmount})`));

    toast(isBn ? "ক্লাব ভাউচার ও খরচের হিসাব সফলভাবে সংরক্ষিত হয়েছে!" : "Club expenditure voucher successfully recorded!");
    setExpenseModal(false);
    setExpTitle("");
    setExpAmount("");
    setExpVoucherNo("");
    setExpPayee("");
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Invoice ID", "Member Name", "Unit", "Block", "Mobile Number", "Title", "Month", "Amount (BDT)", "Status", "Payment Date", "Payment Method", "Receipt Ref"];
    const rows = filteredList.map(d => {
      const u = activeResidents.find(x => x.id === d.residentId) || {};
      return [
        d.id,
        `"${u.name || "Unknown"}"`,
        `"${u.unit || ""}"`,
        `"${u.block || ""}"`,
        `"${u.phone || ""}"`,
        `"${d.chargeTitle || "Monthly Subscription"}"`,
        d.month,
        d.amount,
        d.status,
        d.paidDate || "",
        d.method || "",
        `"${d.ref || ""}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kunjachaya_billing_ledger_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(isBn ? "এক্সেল সিএসভি ফাইল ডাউনলোড সম্পন্ন হয়েছে!" : "Exported Billing Ledger CSV!");
  };

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3" style={{ borderColor: C.outlineVariant }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-black shadow-md">
            ৳
          </div>
          <div>
            <h1 className="text-xl font-black heading text-gray-900 leading-tight">
              {isBn ? "বিলিং তালিকা ও কোষাধ্যক্ষ পোর্টাল" : "Billing List & Treasury Suite"}
            </h1>
            <p className="text-xs text-gray-500">
              {isBn ? "সকল সদস্যের চাঁদা, জিএম লেভি, ক্যাশ কালেকশন ও ভাউচার রেজিস্টার" : "All member subscriptions, GM levies, digital & offline collections"}
            </p>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-2 flex-wrap">
            <Btn size="sm" variant="outline" icon={FileSpreadsheet} onClick={handleExportCSV}>
              {isBn ? "Generate Excel" : "Generate Excel"}
            </Btn>
            <Btn size="sm" variant="outline" icon={Printer} onClick={() => window.print()}>
              {isBn ? "Generate PDF" : "Generate PDF"}
            </Btn>
            <Btn size="sm" variant="outline" icon={Plus} onClick={() => setGmChargeModal(true)}>
              {isBn ? "+ GM Levy" : "+ GM Levy"}
            </Btn>
            <Btn size="sm" icon={Send} onClick={() => setMonthlyModal(true)}>
              {isBn ? "+ Issue Monthly Bill" : "+ Issue Monthly Bill"}
            </Btn>
          </div>
        )}
      </div>

      {/* TOP SUMMARY METRIC CARDS (Matching ISP Billing Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {/* 1. Paid Members */}
        <div className="p-3.5 rounded-2xl bg-[#00897B] text-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-90 text-[11px] font-bold">
            <span>Paid Client</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black heading leading-none">{paidCount}</p>
            <p className="text-[10px] opacity-80 mt-1">Monthly paid client</p>
          </div>
        </div>

        {/* 2. Unpaid Members */}
        <div className="p-3.5 rounded-2xl bg-[#0097A7] text-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-90 text-[11px] font-bold">
            <span>Unpaid Client</span>
            <Clock size={16} />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black heading leading-none">{unpaidCount}</p>
            <p className="text-[10px] opacity-80 mt-1">Monthly unpaid client</p>
          </div>
        </div>

        {/* 3. Received Bill */}
        <div className="p-3.5 rounded-2xl bg-[#5E35B1] text-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-90 text-[11px] font-bold">
            <span>Received Bill</span>
            <DollarSign size={16} />
          </div>
          <div className="mt-2">
            <p className="text-xl font-black heading leading-none">{currency(receivedBillAmount)}</p>
            <p className="text-[10px] opacity-80 mt-1">Monthly received bill</p>
          </div>
        </div>

        {/* 4. Due Amount */}
        <div className="p-3.5 rounded-2xl bg-[#37474F] text-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-90 text-[11px] font-bold">
            <span>Due Amount</span>
            <AlertTriangle size={16} className="text-rose-400" />
          </div>
          <div className="mt-2">
            <p className="text-xl font-black heading leading-none text-rose-300">{currency(totalAllOverDue)}</p>
            <p className="text-[10px] opacity-80 mt-1">All over due amount</p>
          </div>
        </div>

        {/* 5. Generated Bill */}
        <div className="p-3.5 rounded-2xl bg-[#0288D1] text-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-90 text-[11px] font-bold">
            <span>Generated Bill</span>
            <FileText size={16} />
          </div>
          <div className="mt-2">
            <p className="text-xl font-black heading leading-none">{currency(generatedBillMonth)}</p>
            <p className="text-[10px] opacity-80 mt-1">Monthly generated bill</p>
          </div>
        </div>

        {/* 6. Advance Amount */}
        <div className="p-3.5 rounded-2xl bg-[#26A69A] text-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-90 text-[11px] font-bold">
            <span>Advance Amount</span>
            <Wallet size={16} />
          </div>
          <div className="mt-2">
            <p className="text-xl font-black heading leading-none">{currency(totalAdvanceAmount)}</p>
            <p className="text-[10px] opacity-80 mt-1">Monthly advance amount</p>
          </div>
        </div>

        {/* 7. Monthly Total Target */}
        <div className="p-3.5 rounded-2xl bg-[#673AB7] text-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-90 text-[11px] font-bold">
            <span>Monthly Target</span>
            <Building size={16} />
          </div>
          <div className="mt-2">
            <p className="text-xl font-black heading leading-none">{currency(totalMonthlyTargetBill)}</p>
            <p className="text-[10px] opacity-80 mt-1">Current month total target</p>
          </div>
        </div>
      </div>

      {/* Action Shortcut Pills */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold">
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white bg-slate-800 hover:bg-slate-900 transition-colors shadow-sm"
        >
          <FileSpreadsheet size={13} /> Generate Excel
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white bg-sky-800 hover:bg-sky-900 transition-colors shadow-sm"
        >
          <Printer size={13} /> Generate PDF
        </button>
        <button
          onClick={() => {
            const defaulters = filteredList.filter(d => d.status !== "paid");
            toast(isBn ? `${defaulters.length} জন বকেয়াদার সদস্যের কাছে তাগাদা তালিকা তৈরি হয়েছে।` : `Identified ${defaulters.length} pending members for SMS notification.`);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white bg-teal-800 hover:bg-teal-900 transition-colors shadow-sm"
        >
          <MessageCircle size={13} /> WhatsApp / SMS Defaulters
        </button>
        <button
          onClick={() => setExpenseModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white bg-amber-800 hover:bg-amber-900 transition-colors shadow-sm"
        >
          <ArrowDownRight size={13} /> Record Expense Voucher
        </button>
        <button
          onClick={() => setActiveTab(prev => prev === "gateway" ? "billing" : "gateway")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white bg-indigo-800 hover:bg-indigo-900 transition-colors shadow-sm"
        >
          <Zap size={13} /> Online Gateway Integration Hub
        </button>
      </div>

      {/* FILTER & SEARCH CONTROL TOOLBAR */}
      <div className="p-3.5 rounded-2xl border shadow-sm space-y-3" style={{ backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }}>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
          {/* Search box */}
          <div className="relative sm:col-span-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.outline }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isBn ? "গ্রাহকের নাম, মোবাইল, ইউনিট বা রসিদ নং দিয়ে খুঁজুন…" : "Search Customer / Unit / Mobile / Receipt…"}
              style={inputStyle()}
              className={inputCls + " pl-9 text-xs"}
            />
          </div>

          {/* Month Selector */}
          <div className="sm:col-span-2">
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              style={inputStyle()}
              className={inputCls + " text-xs font-semibold"}
            >
              <option value="all">{isBn ? "সকল মাস (All Months)" : "All Months"}</option>
              <option value={ym}>{monthLabel(ym)} (Current)</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-06">June 2026</option>
              <option value="2026-05">May 2026</option>
              <option value="2026-04">April 2026</option>
              <option value="2026-03">March 2026</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={inputStyle()}
              className={inputCls + " text-xs font-semibold"}
            >
              <option value="all">{isBn ? "সকল বিল অবস্থা (All Status)" : "All Status"}</option>
              <option value="paid">{isBn ? "পরিশোধিত (Paid)" : "Paid"}</option>
              <option value="pending">{isBn ? "বকেয়া (Pay Due)" : "Pay Due"}</option>
            </select>
          </div>

          {/* Block / Zone Filter */}
          <div className="sm:col-span-2">
            <select
              value={blockFilter}
              onChange={e => setBlockFilter(e.target.value)}
              style={inputStyle()}
              className={inputCls + " text-xs font-semibold"}
            >
              <option value="all">{isBn ? "সকল জোন / ব্লক (All Zone)" : "All Zone / Blocks"}</option>
              {BLOCKS.map(b => <option key={b} value={b}>{isBn ? `ব্লক ${b}` : `Block ${b}`}</option>)}
            </select>
          </div>

          {/* Charge Type */}
          <div className="sm:col-span-2">
            <select
              value={chargeTypeFilter}
              onChange={e => setChargeTypeFilter(e.target.value)}
              style={inputStyle()}
              className={inputCls + " text-xs font-semibold"}
            >
              <option value="all">{isBn ? "সকল প্যাকেজ (All Packages)" : "All Packages / Types"}</option>
              <option value="monthly">{isBn ? "মাসিক চাঁদা (Monthly)" : "Monthly Dues"}</option>
              <option value="gm_special_charge">{isBn ? "জিএম লেভি (GM Levy)" : "GM Special Levy"}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t" style={{ borderColor: C.outlineVariant }}>
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={rowsPerPage}
              onChange={e => setRowsPerPage(Number(e.target.value))}
              className="px-2 py-0.5 rounded border text-xs bg-white text-gray-800"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>ENTRIES · Total {filteredList.length} records matching</span>
          </div>

          {selectedRows.length > 0 && (
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {selectedRows.length} selected
            </span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ENTERPRISE BILLING TABLE WITH ALWAYS-VISIBLE HORIZONTAL SCROLLBAR         */}
      {/* ========================================================================= */}
      <div
        className="rounded-2xl border shadow-sm bg-white overflow-hidden"
        style={{ borderColor: C.outlineVariant }}
      >
        {/* Scrollable Container with max-height to ensure horizontal scrollbar is always visible on screen */}
        <div className="overflow-x-auto max-h-[640px] overflow-y-auto" style={{ scrollbarWidth: "auto", WebkitOverflowScrolling: "touch" }}>
          <table className="w-full text-left border-collapse text-xs min-w-[1250px]">
            <thead className="sticky top-0 z-20 shadow-sm">
              <tr className="bg-[#1e293b] text-white text-[11px] font-extrabold uppercase tracking-wider">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filteredList.length && filteredList.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded text-emerald-600 cursor-pointer"
                  />
                </th>
                <th className="p-3 whitespace-nowrap">MEMBER CODE</th>
                <th className="p-3 whitespace-nowrap">ID / Unit</th>
                <th className="p-3 whitespace-nowrap min-w-[170px]">MEMBER NAME</th>
                <th className="p-3 whitespace-nowrap">Mobile Number</th>
                <th className="p-3 whitespace-nowrap">Zone</th>
                <th className="p-3 whitespace-nowrap">MEMBER TYPE</th>
                <th className="p-3 whitespace-nowrap min-w-[150px]">Title</th>
                <th className="p-3 whitespace-nowrap">Due Date</th>
                <th className="p-3 text-right whitespace-nowrap">M.Bill</th>
                <th className="p-3 text-right whitespace-nowrap">Received</th>
                <th className="p-3 text-right whitespace-nowrap">Balance Due</th>
                <th className="p-3 whitespace-nowrap">Payment Date</th>
                <th className="p-3 whitespace-nowrap">Verified</th>
                <th className="p-3 text-center whitespace-nowrap">B.Status</th>
                <th className="p-3 text-center whitespace-nowrap sticky right-0 bg-[#1e293b] z-10 shadow-md">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredList.slice(0, rowsPerPage).map((d, index) => {
                const member = activeResidents.find(u => u.id === d.residentId) || {};
                const isPaid = d.status === "paid";
                const isSelected = selectedRows.includes(d.id);
                const rawPhone = cleanPhone(member.phone);
                const memberCode = `00${index + 1}`.slice(-4);
                const memberID = `KC-${member.block || "A"}${member.unit || "01"}`;
                const billingLastDate = d.dueDate || `${d.month}-15`;
                const dueMonthName = monthLabel(d.month);
                const monthlyBillVal = `৳${Number(d.amount).toLocaleString("en-IN")}`;
                const dueAmountVal = isPaid ? "৳০" : `৳${Number(d.amount).toLocaleString("en-IN")}`;

                // Exact custom formatted WhatsApp message requested by user
                const customWaMessage = `প্রিয়  ${member.name || "সদস্য"} ,
অনুগ্রহ করে আপনার ${dueMonthName} এর মাসিক চাঁদা প্রদান করুন।
ব্যবহারকারীর নাম:   ${member.name || ""} 
মাসিক বিলের পরিমাণ:  ${monthlyBillVal} 
বকেয়া:  ${dueAmountVal} 
বিল পরিশোধ এর করার শেষ তারিখ:  ${billingLastDate} 
ধন্যবাদ
কুঞ্জাছায়া ক্লাব
কোষাধ্যক্ষ: ${treasurerUser.phone || "01787-268864"} 
সাধারণ সম্পাদক: ${gsUser.phone || "01722-227207"}`;

                return (
                  <tr
                    key={d.id}
                    className={`hover:bg-slate-50/80 transition-colors ${isSelected ? "bg-emerald-50/40" : ""}`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(d.id)}
                        className="rounded text-emerald-600 cursor-pointer"
                      />
                    </td>
                    <td className="p-3 font-mono font-bold text-gray-700 whitespace-nowrap">{memberCode}</td>
                    <td className="p-3 font-mono font-bold text-sky-800 whitespace-nowrap">
                      <div>{memberID}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{d.month}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={member.name || "Member"} photoUrl={member.photoUrl} size={28} />
                        <div className="min-w-0">
                          <p className="font-extrabold text-gray-900 truncate max-w-[150px]">{member.name || "Unknown"}</p>
                          {member.nameBn && (
                            <p className="text-[10px] text-emerald-800 font-medium truncate">{member.nameBn}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-gray-800 select-all whitespace-nowrap">{member.phone || "—"}</td>
                    <td className="p-3 text-gray-600 whitespace-nowrap">Block {member.block || "A"}</td>
                    <td className="p-3 whitespace-nowrap">
                      <Badge tone={member.memberClass === "Founding" ? "warning" : "neutral"}>
                        {member.memberClass || "General"}
                      </Badge>
                    </td>
                    <td className="p-3 font-semibold text-gray-800 truncate max-w-[180px]" title={d.chargeTitle}>
                      {d.chargeTitle || `Monthly Dues`}
                    </td>
                    <td className="p-3 text-gray-500 font-mono text-[11px] whitespace-nowrap">{billingLastDate}</td>
                    <td className="p-3 text-right font-mono font-bold text-gray-900 whitespace-nowrap">{currency(d.amount)}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                      {isPaid ? currency(d.receivedAmount || d.amount) : "0.00"}
                    </td>
                    <td className="p-3 text-right font-mono font-black text-rose-600 whitespace-nowrap">
                      {isPaid ? "0.00" : currency(d.amount)}
                    </td>
                    <td className="p-3 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                      {d.paidDate ? fmtDate(d.paidDate) : "—"}
                    </td>
                    <td className="p-3 text-[11px] text-gray-600 truncate max-w-[120px] whitespace-nowrap">
                      {d.collectedBy || (isPaid ? "Treasurer" : "Pending")}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      {isPaid ? (
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-black text-white bg-emerald-600 shadow-sm">
                          Paid
                        </span>
                      ) : (
                        <button
                          onClick={() => openBillReceive(d)}
                          className="inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-black text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm"
                        >
                          Pay Due
                        </button>
                      )}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap sticky right-0 bg-white shadow-md">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Generate Invoice Action Button */}
                        <button
                          onClick={() => openGenerateInvoice(d)}
                          className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs flex items-center gap-1"
                          title="Generate Invoice"
                        >
                          <FileText size={14} />
                          <span className="text-[10px] hidden xl:inline">Invoice</span>
                        </button>

                        {/* Custom WhatsApp Reminder Button */}
                        {rawPhone && (
                          <a
                            href={`https://wa.me/${rawPhone}?text=${encodeURIComponent(customWaMessage)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            title="Send WhatsApp Reminder"
                          >
                            <MessageCircle size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredList.length === 0 && (
          <div className="py-12">
            <Empty
              icon={DollarSign}
              title={isBn ? "কোনো বিল রেকর্ড পাওয়া যায়নি" : "No billing records found"}
              subtitle={isBn ? "অনুগ্রহ করে ফিল্টার পরিবর্তন করুন অথবা নতুন মাসিক চাঁদা জারি করুন।" : "Try changing filters or issue new monthly dues."}
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* BILL RECEIVE MODAL (Exact Reproduction of Screenshot 2 & 3)               */}
      {/* ========================================================================= */}
      <Modal
        open={!!billReceiveModal}
        onClose={() => setBillReceiveModal(null)}
        title="Bill Receive"
        width="max-w-2xl"
      >
        {billReceiveModal && (
          <div className="space-y-4 py-1 text-xs">
            {/* Top Form Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">RECEIVED DATE</label>
                <input
                  type="date"
                  value={rcvDate}
                  onChange={e => setRcvDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs font-semibold bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">USER NAME / ID</label>
                <input
                  type="text"
                  readOnly
                  value={`KC-${billReceiveModal.resident?.block || "A"}${billReceiveModal.resident?.unit || "01"}`}
                  className="w-full rounded-lg border border-gray-200 p-2 text-xs font-mono font-bold bg-gray-100 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">CLIENT CODE</label>
                <input
                  type="text"
                  readOnly
                  value={`000${billReceiveModal.id.slice(-2)}`}
                  className="w-full rounded-lg border border-gray-200 p-2 text-xs font-mono font-bold bg-gray-100 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">MOBILE NO.</label>
                <input
                  type="text"
                  readOnly
                  value={billReceiveModal.resident?.phone || "—"}
                  className="w-full rounded-lg border border-gray-200 p-2 text-xs font-semibold bg-gray-100 text-gray-800"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">PACKAGE / CHARGE TITLE</label>
                <input
                  type="text"
                  readOnly
                  value={billReceiveModal.chargeTitle || `Monthly Dues - ${monthLabel(billReceiveModal.month)}`}
                  className="w-full rounded-lg border border-gray-200 p-2 text-xs font-bold bg-gray-100 text-gray-800 truncate"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">RECEIVE FROM (MEMBER NAME)</label>
                <input
                  type="text"
                  readOnly
                  value={billReceiveModal.resident?.name || "Member Name"}
                  className="w-full rounded-lg border border-gray-200 p-2 text-xs font-black bg-gray-100 text-emerald-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">MONTHLY BILL</label>
                <input
                  type="text"
                  readOnly
                  value={Number(billReceiveModal.amount).toFixed(2)}
                  className="w-full rounded-lg border border-gray-200 p-2 text-xs font-mono font-bold bg-gray-100 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">DUE AMOUNT</label>
                <input
                  type="text"
                  readOnly
                  value={Number(billReceiveModal.amount).toFixed(2)}
                  className="w-full rounded-lg border border-gray-200 p-2 text-xs font-mono font-black bg-rose-50 text-rose-700 border-rose-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">RECEIVED BY</label>
                <select
                  value={rcvCollectedBy}
                  onChange={e => setRcvCollectedBy(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs font-semibold bg-white"
                >
                  <option value="Treasurer (Golam Sarwar Jony)">Treasurer (Golam Sarwar Jony)</option>
                  <option value="General Secretary (Khalid Hasan)">General Secretary (Khalid Hasan)</option>
                  <option value="President (Zakaria Hasan)">President (Zakaria Hasan)</option>
                  <option value="Club Office Cashier">Club Office Cashier</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">PAYMENT METHOD</label>
                <select
                  value={rcvPaymentMethod}
                  onChange={e => {
                    setRcvPaymentMethod(e.target.value);
                    setRcvTxRef(`${e.target.value.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`);
                  }}
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs font-bold text-sky-800 bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="bKash">bKash</option>
                  <option value="Bank">Bank</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="SSLCommerz">SSLCommerz</option>
                  <option value="Foster Payments">Foster Payments</option>
                  <option value="Walletmix">Walletmix</option>
                  <option value="SureCash">SureCash</option>
                  <option value="Upay">Upay</option>
                  <option value="aamarPay">aamarPay</option>
                  <option value="Razorpay">Razorpay</option>
                  <option value="Stripe">Stripe</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Financial Details Table */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#1e293b] text-white font-bold">
                    <th className="p-2.5 text-left">Details</th>
                    <th className="p-2.5 text-right w-44">Amount Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  <tr>
                    <td className="p-2.5 font-semibold text-gray-700">Payable Amount</td>
                    <td className="p-2.5 text-right font-mono font-bold text-gray-900">
                      {Number(billReceiveModal.amount).toFixed(2)}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2.5 font-semibold text-gray-700">Discount / Waiver</td>
                    <td className="p-2 text-right">
                      <input
                        type="number"
                        value={rcvDiscount}
                        onChange={e => setRcvDiscount(Number(e.target.value))}
                        className="w-32 text-right p-1.5 rounded border border-gray-300 text-xs font-mono"
                        placeholder="0.00"
                      />
                    </td>
                  </tr>

                  <tr className="bg-emerald-50/50">
                    <td className="p-2.5 font-bold text-emerald-950">Received Amount *</td>
                    <td className="p-2 text-right">
                      <input
                        type="number"
                        value={rcvAmount}
                        onChange={e => setRcvAmount(Number(e.target.value))}
                        className="w-32 text-right p-1.5 rounded border-2 border-emerald-600 text-xs font-mono font-black text-emerald-900 bg-white"
                        placeholder="0.00"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2.5 font-semibold text-gray-700">Total Received Amount</td>
                    <td className="p-2.5 text-right font-mono font-black text-emerald-700">
                      {Number(rcvAmount).toFixed(2)}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2.5 font-semibold text-gray-700">Receipt / Transaction No.</td>
                    <td className="p-2 text-right">
                      <input
                        type="text"
                        value={rcvTxRef}
                        onChange={e => setRcvTxRef(e.target.value)}
                        className="w-36 text-right p-1.5 rounded border border-gray-300 text-xs font-mono font-bold text-gray-800"
                        placeholder="TRX-12345"
                      />
                    </td>
                  </tr>

                  <tr className="bg-rose-50/30">
                    <td className="p-2.5 font-bold text-rose-900">Balance Due</td>
                    <td className="p-2.5 text-right font-mono font-black text-rose-600">
                      {Math.max(0, Number(billReceiveModal.amount) - (Number(rcvAmount) + Number(rcvDiscount))).toFixed(2)}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2.5 font-semibold text-gray-700">Remarks / Note</td>
                    <td className="p-2 text-right">
                      <input
                        type="text"
                        value={rcvRemarks}
                        onChange={e => setRcvRemarks(e.target.value)}
                        className="w-full text-left p-1.5 rounded border border-gray-300 text-xs"
                        placeholder="Type a remark..."
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom Toggles & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 font-bold text-emerald-900 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rcvSendSms}
                  onChange={e => setRcvSendSms(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Send WhatsApp / SMS Confirmation to Member</span>
              </label>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setBillReceiveModal(null)}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-full border border-rose-300 text-rose-600 font-bold hover:bg-rose-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReceiveBillSubmit}
                  className="flex-1 sm:flex-none px-8 py-2.5 rounded-full font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check size={16} /> Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* OFFICIAL LETTER PAD INVOICE & MONEY RECEIPT MODAL                         */}
      {/* ========================================================================= */}
      <InvoiceReceiptModal
        open={!!invoiceModal}
        onClose={() => setInvoiceModal(null)}
        invoice={invoiceModal}
        treasurer={treasurerUser}
        gs={gsUser}
        president={presidentUser}
        lang={lang}
        toast={toast}
      />

      {/* MODAL: ISSUE REGULAR MONTHLY DUES */}
      <Modal open={monthlyModal} onClose={() => setMonthlyModal(false)} title={isBn ? "নিয়মিত মাসিক চাঁদা জারি করুন" : "Issue Monthly Subscriptions"}>
        <div className="space-y-4 py-1 text-xs">
          <p className="text-gray-600">
            {isBn
              ? "নির্বাচিত মাসের জন্য সকল সদস্যের অ্যাকাউন্টে নির্ধারিত মাসিক চাঁদা বিল জারি করুন।"
              : "Issue regular monthly subscription dues for the designated billing cycle."}
          </p>

          <Field label={isBn ? "চাঁদার মাস (Billing Month)" : "Billing Month"}>
            <input
              type="month"
              style={inputStyle()}
              className={inputCls}
              value={billMonth}
              onChange={e => setBillMonth(e.target.value)}
            />
          </Field>

          <Field label={isBn ? "মাসিক চাঁদার পরিমাণ (৳ BDT)" : "Amount per Unit (৳ BDT)"}>
            <input
              type="number"
              style={inputStyle()}
              className={inputCls}
              value={billAmount}
              onChange={e => setBillAmount(e.target.value)}
              placeholder="1500"
            />
          </Field>

          <Field label={isBn ? "টার্গেট সদস্য / ব্লক" : "Target Block / Scope"}>
            <select style={inputStyle()} className={inputCls} value={billTargetBlock} onChange={e => setBillTargetBlock(e.target.value)}>
              <option value="all">{isBn ? "সকল সক্রিয় সদস্য (All Active Residents)" : "All Active Residents"}</option>
              {BLOCKS.map(b => <option key={b} value={b}>{isBn ? `শুধুমাত্র ব্লক ${b}` : `Only Block ${b}`}</option>)}
            </select>
          </Field>

          <div className="flex items-center gap-2 pt-2">
            <Btn full variant="outline" onClick={() => setMonthlyModal(false)}>{isBn ? "বাতিল" : "Cancel"}</Btn>
            <Btn full icon={Send} onClick={handleIssueMonthlyDues}>{isBn ? "চাঁদা জারি করুন" : "Generate Invoices"}</Btn>
          </div>
        </div>
      </Modal>

      {/* MODAL: ISSUE GM EXTRA CHARGES / SPECIAL LEVIES */}
      <Modal open={gmChargeModal} onClose={() => setGmChargeModal(false)} title={isBn ? "সাধারণ সভার (GM) বিশেষ চার্জ / লেভি জারি" : "Issue GM Extra Charge & Special Levy"}>
        <div className="space-y-4 py-1 text-xs">
          <p className="text-gray-600">
            {isBn
              ? "সাধারণ সভায় অনুমোদিত বিশেষ উন্নয়ন ফি, উৎসব চাঁদা বা জরুরি মেরামত চার্জ সদস্যদের অ্যাকাউন্টে জারি করুন।"
              : "Issue approved extra charges, GM resolution fees, or emergency levies to resident accounts."}
          </p>

          <Field label={isBn ? "চার্জের শিরোনাম ও বিবরণ (Purpose / Title)" : "Charge Purpose / Title"}>
            <input
              style={inputStyle()}
              className={inputCls}
              value={gmTitle}
              onChange={e => setGmTitle(e.target.value)}
              placeholder={isBn ? "যেমন: জরুরি ড্রেন ও রাস্তা মেরামত লেভি" : "e.g. GM Emergency Road & Drain Repair Levy"}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={isBn ? "চার্জের পরিমাণ (৳ BDT)" : "Amount per Member (৳)"}>
              <input
                type="number"
                style={inputStyle()}
                className={inputCls}
                value={gmAmount}
                onChange={e => setGmAmount(e.target.value)}
                placeholder="500"
              />
            </Field>

            <Field label={isBn ? "চার্জের শ্রেণি (Category)" : "Category"}>
              <select style={inputStyle()} className={inputCls} value={gmCategory} onChange={e => setGmCategory(e.target.value)}>
                <option value="GM Special Levy">{isBn ? "জিএম বিশেষ লেভি" : "GM Special Levy"}</option>
                <option value="Festival Fund">{isBn ? "উৎসব ও ঈদ/পূজা তহবিল" : "Festival Fund"}</option>
                <option value="Emergency Repair">{isBn ? "জরুরি মেরামত চার্জ" : "Emergency Repair"}</option>
                <option value="Security Fund">{isBn ? "নিরাপত্তা ও সিসিটিভি আপগ্রেড" : "Security Upgrade"}</option>
                <option value="Sports & Events">{isBn ? "ক্রীড়া ও সাংস্কৃতিক উৎসব" : "Sports & Events"}</option>
              </select>
            </Field>
          </div>

          <Field label={isBn ? "সাধারণ সভার রেজোলিউশন / রেফারেন্স নং (ঐচ্ছিক)" : "GM Resolution Reference No. (Optional)"}>
            <input
              style={inputStyle()}
              className={inputCls}
              value={gmResolutionNo}
              onChange={e => setGmResolutionNo(e.target.value)}
              placeholder="e.g. GM-RES-2026/04"
            />
          </Field>

          <Field label={isBn ? "টার্গেট ব্লক / পরিধি" : "Target Block / Scope"}>
            <select style={inputStyle()} className={inputCls} value={gmTargetBlock} onChange={e => setGmTargetBlock(e.target.value)}>
              <option value="all">{isBn ? "সকল সক্রিয় সদস্য (All Active Residents)" : "All Active Residents"}</option>
              {BLOCKS.map(b => <option key={b} value={b}>{isBn ? `শুধুমাত্র ব্লক ${b}` : `Only Block ${b}`}</option>)}
            </select>
          </Field>

          <div className="flex items-center gap-2 pt-2">
            <Btn full variant="outline" onClick={() => setGmChargeModal(false)}>{isBn ? "বাতিল" : "Cancel"}</Btn>
            <Btn full icon={Plus} onClick={handleIssueGmCharge}>{isBn ? "চার্জ জারি করুন" : "Issue GM Charge"}</Btn>
          </div>
        </div>
      </Modal>

      {/* MODAL: RECORD CLUB EXPENSE VOUCHER */}
      <Modal open={expenseModal} onClose={() => setExpenseModal(false)} title={isBn ? "ক্লাব ব্যয় ও ভাউচার এন্ট্রি" : "Record Club Expense Voucher"}>
        <div className="space-y-4 py-1 text-xs">
          <Field label={isBn ? "খরচের বিবরণ ও উদ্দেশ্য" : "Expense Description / Purpose"}>
            <input
              style={inputStyle()}
              className={inputCls}
              value={expTitle}
              onChange={e => setExpTitle(e.target.value)}
              placeholder={isBn ? "যেমন: ক্লাবের পানির পাম্প মেরামত ও রক্ষণাবেক্ষণ" : "e.g. Water pump maintenance & electrical repair"}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={isBn ? "ব্যয়ের পরিমাণ (৳ BDT)" : "Amount (৳ BDT)"}>
              <input
                type="number"
                style={inputStyle()}
                className={inputCls}
                value={expAmount}
                onChange={e => setExpAmount(e.target.value)}
                placeholder="3500"
              />
            </Field>

            <Field label={isBn ? "খরচের খাত (Category)" : "Category"}>
              <select style={inputStyle()} className={inputCls} value={expCategory} onChange={e => setExpCategory(e.target.value)}>
                <option value="Maintenance">{isBn ? "রক্ষণাবেক্ষণ" : "Maintenance"}</option>
                <option value="Security">{isBn ? "নিরাপত্তা" : "Security"}</option>
                <option value="Utilities">{isBn ? "ইউটিলিটি ও বিদ্যুৎ" : "Utilities"}</option>
                <option value="Events">{isBn ? "ইভেন্ট ও সভা" : "Events"}</option>
                <option value="Administration">{isBn ? "প্রশাসন ও স্টেশনারি" : "Administration"}</option>
                <option value="Welfare">{isBn ? "সমাজকল্যাণ" : "Welfare"}</option>
                <option value="Other">{isBn ? "অন্যান্য" : "Other"}</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={isBn ? "ভাউচার / ইনভয়েস নং" : "Voucher / Invoice No."}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={expVoucherNo}
                onChange={e => setExpVoucherNo(e.target.value)}
                placeholder="VCH-2026-01"
              />
            </Field>

            <Field label={isBn ? "প্রাপক / ভেন্ডারের নাম" : "Payee / Vendor"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={expPayee}
                onChange={e => setExpPayee(e.target.value)}
                placeholder="e.g. Rahim Electric"
              />
            </Field>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Btn full variant="outline" onClick={() => setExpenseModal(false)}>{isBn ? "বাতিল" : "Cancel"}</Btn>
            <Btn full icon={ArrowDownRight} onClick={handleAddExpense}>{isBn ? "ভাউচার সংরক্ষণ করুন" : "Save Voucher"}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
