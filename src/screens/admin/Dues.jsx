import React, { useState } from "react";
import { Shield, Send, Plus, CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, Wallet, CheckCircle2, Clock, Search, Filter, Printer, MessageCircle, Phone, FileText, Check, AlertTriangle, Layers, Building, RefreshCw, Zap } from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Avatar, Empty, Modal, SectionTitle } from "../../components/primitives";
import { C, BLOCKS } from "../../theme";
import { uid, currency, monthLabel, currentMonthYM, fmtDate, cleanPhone } from "../../utils";

export default function AdminDues({ session, db = {}, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const ym = currentMonthYM();

  const isTopTier = session?.role === "admin" && (session?.post === "President" || session?.post === "General Secretary");
  const isTreasurer = session?.role === "admin" && session?.post === "Treasurer";
  const canManage = session?.permissions?.canManageFinancials || isTopTier || isTreasurer;

  // View & Filter States
  const [activeTab, setActiveTab] = useState("dues"); // "dues" | "expenses" | "blocks" | "gateway"
  const [selectedMonth, setSelectedMonth] = useState(ym);
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "paid" | "pending"
  const [blockFilter, setBlockFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [monthlyModal, setMonthlyModal] = useState(false);
  const [gmChargeModal, setGmChargeModal] = useState(false);
  const [recordPaymentModal, setRecordPaymentModal] = useState(null);
  const [expenseModal, setExpenseModal] = useState(false);

  // Form States for Monthly Billing
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

  // Form States for Manual Payment Record
  const [payMethod, setPayMethod] = useState("Cash");
  const [payRef, setPayRef] = useState("");
  const [payNote, setPayNote] = useState("");

  // Form States for Club Expenses
  const [expTitle, setExpTitle] = useState("");
  const [expCategory, setExpCategory] = useState("Maintenance");
  const [expAmount, setExpAmount] = useState("");
  const [expVoucherNo, setExpVoucherNo] = useState("");
  const [expPayee, setExpPayee] = useState("");

  const activeResidents = (db.users || []).filter(u => u.status === "active");
  const allDues = db.dues || [];
  const allExpenses = db.expenses || [];

  // Financial Calculations
  const totalBilled = allDues.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const totalCollected = allDues.filter(d => d.status === "paid").reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const totalOutstanding = allDues.filter(d => d.status !== "paid").reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const totalExpenses = allExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const netReserveBalance = totalCollected - totalExpenses;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  // Month-specific stats
  const monthDues = allDues.filter(d => !selectedMonth || d.month === selectedMonth);
  const monthCollected = monthDues.filter(d => d.status === "paid").reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const monthOutstanding = monthDues.filter(d => d.status !== "paid").reduce((s, d) => s + (Number(d.amount) || 0), 0);

  // Filtered Dues List
  const filteredDues = allDues.filter(d => {
    const user = activeResidents.find(u => u.id === d.residentId) || {};
    const matchesMonth = selectedMonth === "all" || d.month === selectedMonth;
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    const matchesBlock = blockFilter === "all" || user.block === blockFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      (user.name || "").toLowerCase().includes(q) ||
      (user.unit || "").toLowerCase().includes(q) ||
      (user.phone || "").toLowerCase().includes(q) ||
      (d.ref || "").toLowerCase().includes(q) ||
      (d.chargeTitle || "").toLowerCase().includes(q);
    return matchesMonth && matchesStatus && matchesBlock && matchesSearch;
  });

  // Action: Issue Regular Monthly Dues
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
      dueDate: billDueDate || null,
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

  // Action: Issue GM Extra Charges / Special Levies
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
    const chargeCode = uid("gm_chg");

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

    toast(isBn ? `সাধারণ সভার সিদ্ধান্ত অনুসারে ${newEntries.length} জন সদস্যের অ্যাকাউন্টে ৳${gmAmount} চার্জ যুক্ত হয়েছে!` : `GM special charge of ৳${gmAmount} issued to ${newEntries.length} members!`);
    setGmChargeModal(false);
    setGmTitle("");
    setGmResolutionNo("");
  };

  // Action: Record Offline / Manual Payment
  const handleRecordPayment = () => {
    if (!recordPaymentModal) return;

    persist(d => logActivity({
      ...d,
      dues: (d.dues || []).map(due => due.id === recordPaymentModal.id ? {
        ...due,
        status: "paid",
        paidDate: new Date().toISOString(),
        method: payMethod,
        ref: payRef.trim() || `${payMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
        note: payNote.trim() || null,
        collectedBy: session?.name || "Treasurer"
      } : due)
    }, session?.name || "Treasurer", `Verified payment for ${recordPaymentModal.residentName || "member"} (৳${recordPaymentModal.amount}) via ${payMethod}`));

    toast(isBn ? "পেমেন্ট সফলভাবে যাচাই ও পরিশোধিত হিসেবে চিহ্নিত করা হয়েছে!" : "Payment successfully recorded and marked as Paid!");
    setRecordPaymentModal(null);
    setPayRef("");
    setPayNote("");
  };

  // Action: Record Club Expenditure Voucher
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

  return (
    <div className="space-y-5">
      {/* Page Title & Quick Action Buttons */}
      <SectionTitle
        action={
          canManage ? (
            <div className="flex items-center gap-2 flex-wrap">
              <Btn size="sm" variant="outline" icon={Plus} onClick={() => setGmChargeModal(true)}>
                {isBn ? "জিএম অতিরিক্ত চার্জ / লেভি" : "GM Extra Charge"}
              </Btn>
              <Btn size="sm" variant="outline" icon={ArrowDownRight} onClick={() => setExpenseModal(true)}>
                {isBn ? "খরচ / ভাউচার এন্ট্রি" : "Record Expense"}
              </Btn>
              <Btn size="sm" icon={Send} onClick={() => setMonthlyModal(true)}>
                {isBn ? "মাসিক চাঁদা জারি" : "Issue Monthly Dues"}
              </Btn>
            </div>
          ) : null
        }
      >
        {isBn ? "কোষাধ্যক্ষ ড্যাশবোর্ড ও আর্থিক ব্যবস্থাপনা" : "Treasurer Financial Dashboard & Billing"}
      </SectionTitle>

      {!canManage && (
        <div className="p-3.5 rounded-2xl text-xs flex items-center gap-2.5 border" style={{ backgroundColor: C.errorContainer, color: C.onErrorContainer, borderColor: C.error }}>
          <Shield size={16} />
          <span>{isBn ? "শুধুমাত্র প্রদর্শন — আপনার আর্থিক ও কোষাধ্যক্ষ নিয়ন্ত্রণ অনুমতি নেই।" : "View-only — you lack canManageFinancials permission."}</span>
        </div>
      )}

      {/* Authority Banner for Treasurer & Top-Tier */}
      <div className="p-4 rounded-2xl text-xs flex items-center justify-between gap-3 border shadow-sm" style={{ backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-800 shrink-0 font-bold">
            ৳
          </div>
          <div>
            <p className="font-extrabold text-sm text-gray-900">
              {isBn ? "কুঞ্জছায়া ক্লাব কেন্দ্রীয় তহবিল ও কোষাধ্যক্ষ পোর্টাল (ধারা-১৭.৫)" : "Kunjachaya Club Treasury & Financial Authority (Article 17.5)"}
            </p>
            <p className="text-[11px] text-gray-600 mt-0.5">
              {isBn
                ? "মাসিক চাঁদা নির্ধারণ, সাধারণ সভার বিশেষ উন্নয়ন ফি জারি, ক্যাশ ও অনলাইন আদায় হিসাব সংরক্ষণ।"
                : "Manage regular monthly subscriptions, GM special levies, offline & digital reconciliation."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge tone="success">{isBn ? "কোষাধ্যক্ষ নিয়ন্ত্রণ সক্রিয়" : "Treasurer Active"}</Badge>
        </div>
      </div>

      {/* Executive Financial Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="p-4 border shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{isBn ? "মোট বরাদ্দকৃত চাঁদা" : "Total Invoiced"}</span>
            <DollarSign size={15} style={{ color: C.primary }} />
          </div>
          <p className="text-xl font-black heading text-gray-900">{currency(totalBilled)}</p>
          <p className="text-[10px] text-gray-400 mt-1">{allDues.length} {isBn ? "টি ইনভয়েস" : "invoices issued"}</p>
        </Card>

        <Card className="p-4 border shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{isBn ? "মোট আদায়কৃত অর্থ" : "Total Realized"}</span>
            <CheckCircle2 size={15} className="text-emerald-600" />
          </div>
          <p className="text-xl font-black heading text-emerald-700">{currency(totalCollected)}</p>
          <p className="text-[10px] text-emerald-800 font-semibold mt-1">{collectionRate}% {isBn ? "আদায় সম্পন্ন" : "collected"}</p>
        </Card>

        <Card className="p-4 border shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{isBn ? "মোট বকেয়া চাঁদা" : "Outstanding Due"}</span>
            <Clock size={15} className="text-rose-600" />
          </div>
          <p className="text-xl font-black heading text-rose-600">{currency(totalOutstanding)}</p>
          <p className="text-[10px] text-rose-800 font-semibold mt-1">{allDues.filter(d => d.status !== "paid").length} {isBn ? "টি অনিষ্পন্ন" : "pending"}</p>
        </Card>

        <Card className="p-4 border shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{isBn ? "মোট ক্লাব ব্যয়" : "Total Expenses"}</span>
            <ArrowDownRight size={15} className="text-amber-600" />
          </div>
          <p className="text-xl font-black heading text-amber-700">{currency(totalExpenses)}</p>
          <p className="text-[10px] text-gray-400 mt-1">{allExpenses.length} {isBn ? "টি ভাউচার" : "vouchers"}</p>
        </Card>

        <Card className="p-4 col-span-2 lg:col-span-1 border shadow-sm bg-emerald-50/50">
          <div className="flex items-center justify-between text-xs text-emerald-900 mb-1">
            <span className="font-bold">{isBn ? "ক্লাব নিট রিজার্ভ" : "Net Reserve"}</span>
            <Wallet size={15} className="text-emerald-700" />
          </div>
          <p className="text-xl font-black heading text-emerald-950">{currency(netReserveBalance)}</p>
          <p className="text-[10px] text-emerald-800 font-medium mt-1">{isBn ? "হাতে নগদ ও ব্যাংক" : "Cash & Bank Balance"}</p>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex rounded-2xl p-1 border shadow-sm" style={{ backgroundColor: C.surfaceContainer, borderColor: C.outlineVariant }}>
        {[
          { key: "dues", label: isBn ? "সদস্য চাঁদা ও লেভি লেজার" : "Member Dues Ledger", icon: Layers, count: filteredDues.length },
          { key: "expenses", label: isBn ? "খরচ ও ভাউচার ক্যাশবুক" : "Expense Cashbook", icon: FileText, count: allExpenses.length },
          { key: "blocks", label: isBn ? "ব্লকভিত্তিক আদায় বিশ্লেষণ" : "Block Analytics", icon: Building },
          { key: "gateway", label: isBn ? "অনলাইন পেমেন্ট গেটওয়ে" : "Online Gateway", icon: Zap },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all"
              style={activeTab === tab.key ? { backgroundColor: C.primary, color: "#fff" } : { color: C.onSurfaceVariant }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.count !== undefined && <span className="opacity-80 text-[10px]">({tab.count})</span>}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MEMBER DUES & CHARGES LEDGER */}
      {activeTab === "dues" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="grid sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl border" style={{ backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }}>
            <div className="relative sm:col-span-2">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.outline }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isBn ? "সদস্যের নাম, ইউনিট, মোবাইল বা রসিদ দিয়ে খুঁজুন…" : "Search by member name, unit, phone or receipt…"}
                style={inputStyle()}
                className={inputCls + " pl-9"}
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={inputStyle()}
              className={inputCls}
            >
              <option value="all">{isBn ? "সকল অবস্থা (All Status)" : "All Status"}</option>
              <option value="paid">{isBn ? "পরিশোধিত (Paid)" : "Paid"}</option>
              <option value="pending">{isBn ? "বকেয়া (Pending Due)" : "Pending Due"}</option>
            </select>

            <select
              value={blockFilter}
              onChange={e => setBlockFilter(e.target.value)}
              style={inputStyle()}
              className={inputCls}
            >
              <option value="all">{isBn ? "সকল ব্লক (All Blocks)" : "All Blocks"}</option>
              {BLOCKS.map(b => <option key={b} value={b}>{isBn ? `ব্লক ${b}` : `Block ${b}`}</option>)}
            </select>
          </div>

          {/* Dues Cards List */}
          <div className="space-y-2.5">
            {filteredDues.map(d => {
              const member = activeResidents.find(u => u.id === d.residentId) || {};
              const rawPhone = cleanPhone(member.phone);
              const isPaid = d.status === "paid";

              return (
                <Card
                  key={d.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition-shadow border"
                  style={{ borderColor: isPaid ? C.outlineVariant : "#fca5a5" }}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Avatar name={member.name || "Member"} photoUrl={member.photoUrl} size={44} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-extrabold text-sm text-gray-900">{member.name || "Unknown Member"}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-800">
                          {isBn ? "ব্লক" : "Block"} {member.block} ({member.unit})
                        </span>
                        {d.chargeType === "gm_special_charge" && (
                          <Badge tone="warning">{isBn ? "জিএম বিশেষ লেভি" : "GM Special Levy"}</Badge>
                        )}
                      </div>

                      <p className="text-xs font-semibold mt-1" style={{ color: C.onSurfaceVariant }}>
                        {d.chargeTitle || `Monthly Dues - ${monthLabel(d.month)}`} · <span className="font-black text-gray-900">{currency(d.amount)}</span>
                        {d.ref && <span className="font-mono text-[11px] text-gray-500"> ({d.ref})</span>}
                      </p>

                      {d.paidDate && (
                        <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                          {isBn ? "পরিশোধ:" : "Paid on:"} {fmtDate(d.paidDate)} {d.method ? `(${d.method})` : ""}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {isPaid ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 size={15} />
                        <span>{isBn ? "পরিশোধিত" : "Paid"}</span>
                      </div>
                    ) : (
                      <>
                        {rawPhone && (
                          <a
                            href={`https://wa.me/${rawPhone}?text=${encodeURIComponent(isBn ? `আসসালামু আলাইকুম ${member.name}, কুঞ্জছায়া ক্লাবের পক্ষ থেকে ${d.chargeTitle || monthLabel(d.month)}-এর বকেয়া চাঁদা (${currency(d.amount)}) পরিশোধের অনুরোধ জানানো হচ্ছে। ধন্যবাদ।` : `Hello ${member.name}, this is a gentle reminder regarding your Kunjachaya Club dues (${currency(d.amount)}) for ${d.chargeTitle || monthLabel(d.month)}. Thank you.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 border border-emerald-200 text-xs font-bold flex items-center gap-1"
                            title={isBn ? "হোয়াটসঅ্যাপে বকেয়া তাগাদা পাঠান" : "Send WhatsApp Payment Reminder"}
                          >
                            <MessageCircle size={14} />
                            <span className="hidden sm:inline">{isBn ? "তাগাদা" : "Remind"}</span>
                          </a>
                        )}

                        {canManage && (
                          <Btn
                            size="sm"
                            icon={Check}
                            onClick={() => {
                              setRecordPaymentModal({ ...d, residentName: member.name });
                              setPayRef(`CASH-${Math.floor(100000 + Math.random() * 900000)}`);
                            }}
                          >
                            {isBn ? "আদায় গ্রহণ" : "Verify Payment"}
                          </Btn>
                        )}
                      </>
                    )}
                  </div>
                </Card>
              );
            })}

            {filteredDues.length === 0 && (
              <Empty
                icon={DollarSign}
                title={isBn ? "কোনো চাঁদার রেকর্ড পাওয়া যায়নি" : "No dues found"}
                subtitle={isBn ? "ভিন্ন ফিল্টার বা সার্চ দিয়ে চেষ্টা করুন অথবা নতুন চাঁদা জারি করুন।" : "Try adjusting your filters or issue new monthly dues."}
              />
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EXPENSE CASHBOOK & VOUCHERS */}
      {activeTab === "expenses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-gray-900">
              {isBn ? "ক্লাব অফিসিয়াল খরচ ও ভাউচার রেজিস্টার" : "Club Official Expenditure & Voucher Register"}
            </h3>
            {canManage && (
              <Btn size="sm" icon={Plus} onClick={() => setExpenseModal(true)}>
                {isBn ? "+ নতুন খরচ যুক্ত করুন" : "+ Add Expense"}
              </Btn>
            )}
          </div>

          <div className="space-y-2.5">
            {allExpenses.map(exp => (
              <Card key={exp.id} className="p-4 flex items-center justify-between gap-3 border shadow-sm">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-sm text-gray-900">{exp.title}</p>
                    <Badge tone="neutral">{exp.category}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {isBn ? "ভাউচার নং:" : "Voucher:"} <span className="font-mono font-semibold">{exp.voucherNo}</span> · {isBn ? "প্রাপক:" : "Payee:"} <span className="font-semibold">{exp.payee}</span> · {fmtDate(exp.date)}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {isBn ? "অনুমোদনকারী:" : "Approved by:"} {exp.approvedBy}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base font-black text-rose-700 heading">-{currency(exp.amount)}</p>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    {isBn ? "ভাউচার পরিশোধিত" : "Disbursed"}
                  </span>
                </div>
              </Card>
            ))}

            {allExpenses.length === 0 && (
              <Empty
                icon={FileText}
                title={isBn ? "কোনো খরচের রেকর্ড নেই" : "No expense records"}
                subtitle={isBn ? "কোষাধ্যক্ষ এখানে ক্লাবের রক্ষণাবেক্ষণ ও ইভেন্টের ভাউচার এন্ট্রি করতে পারবেন।" : "Treasury expense vouchers will appear here once recorded."}
              />
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BLOCK-WISE PERFORMANCE ANALYTICS */}
      {activeTab === "blocks" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {BLOCKS.map(blockName => {
            const blockUsers = activeResidents.filter(u => u.block === blockName);
            const blockDues = allDues.filter(d => blockUsers.some(u => u.id === d.residentId));
            const bBilled = blockDues.reduce((s, d) => s + (Number(d.amount) || 0), 0);
            const bCollected = blockDues.filter(d => d.status === "paid").reduce((s, d) => s + (Number(d.amount) || 0), 0);
            const bOutstanding = blockDues.filter(d => d.status !== "paid").reduce((s, d) => s + (Number(d.amount) || 0), 0);
            const bRate = bBilled > 0 ? Math.round((bCollected / bBilled) * 100) : 0;

            return (
              <Card key={blockName} className="p-4 border shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <h4 className="font-black text-base text-gray-900">{isBn ? `ব্লক ${blockName}` : `Block ${blockName}`}</h4>
                    <p className="text-[11px] text-gray-500">{blockUsers.length} {isBn ? "জন সক্রিয় সদস্য" : "active residents"}</p>
                  </div>
                  <Badge tone={bRate >= 80 ? "success" : bRate >= 50 ? "warning" : "danger"}>
                    {bRate}% {isBn ? "আদায়" : "Collection"}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isBn ? "মোট বরাদ্দ:" : "Total Billed:"}</span>
                    <span className="font-bold">{currency(bBilled)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isBn ? "মোট সংগৃহীত:" : "Realized:"}</span>
                    <span className="font-bold text-emerald-700">{currency(bCollected)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isBn ? "মোট বকেয়া:" : "Outstanding:"}</span>
                    <span className="font-bold text-rose-600">{currency(bOutstanding)}</span>
                  </div>
                </div>

                <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                  <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${bRate}%` }} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB 4: ONLINE PAYMENT GATEWAY HUB */}
      {activeTab === "gateway" && (
        <div className="p-5 rounded-2xl border bg-gradient-to-br from-emerald-50/50 to-sky-50/50 border-emerald-200 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-black text-base text-emerald-950">
                {isBn ? "ডিজিটাল পেমেন্ট গেটওয়ে ইন্টিগ্রেশন হাব" : "Digital Payment Gateway Integration Hub"}
              </h3>
              <p className="text-xs text-emerald-800">
                {isBn
                  ? "সদস্যরা সরাসরি bKash, Nagad ও কার্ডের মাধ্যমে চাঁদা পরিশোধ করতে পারবেন। স্বয়ংক্রিয়ভাবে রসিদ ও হিসাব আপডেট হবে।"
                  : "Enable resident direct online payments via bKash, Nagad, and Cards with instant auto-reconciliation."}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 pt-2">
            <Card className="p-4 border bg-white shadow-sm space-y-1.5">
              <p className="font-black text-sm text-pink-600">bKash Merchant</p>
              <p className="text-xs text-gray-600">{isBn ? "সরাসরি বিকাশ পেমেন্ট গেটওয়ে এপিআই রেডি" : "Direct bKash Checkout API Bridge"}</p>
              <Badge tone="success">{isBn ? "সক্রিয় প্রস্তুত" : "Ready"}</Badge>
            </Card>

            <Card className="p-4 border bg-white shadow-sm space-y-1.5">
              <p className="font-black text-sm text-orange-600">Nagad Merchant</p>
              <p className="text-xs text-gray-600">{isBn ? "নগদ ডিরেক্ট ওয়ালেট ট্রান্সফার এপিআই" : "Nagad Payment Bridge"}</p>
              <Badge tone="success">{isBn ? "সক্রিয় প্রস্তুত" : "Ready"}</Badge>
            </Card>

            <Card className="p-4 border bg-white shadow-sm space-y-1.5">
              <p className="font-black text-sm text-blue-600">PipraPay / SSLCommerz</p>
              <p className="text-xs text-gray-600">{isBn ? "ভিসা/মাস্টারকার্ড ও ইন্টারনেট ব্যাংকিং" : "Cards & Net Banking Gateway"}</p>
              <Badge tone="info">{isBn ? "কনফিগারেশন লিঙ্কড" : "Configured"}</Badge>
            </Card>
          </div>

          <div className="p-3.5 rounded-xl bg-white border text-xs text-gray-700 leading-relaxed">
            <p className="font-bold text-gray-900 mb-1">
              {isBn ? "💡 কোষাধ্যক্ষের সুবিধা:" : "💡 Treasury Integration Perks:"}
            </p>
            {isBn
              ? "সদস্য অ্যাপে 'Pay Now' বাটনে ক্লিক করলে গেটওয়ে থেকে স্বয়ংক্রিয়ভাবে টাকা জমা হয়ে এই ড্যাশবোর্ডে স্ট্যাটাস 'Paid' হয়ে যাবে। কোনো ম্যানুয়াল রসিদ কাটার প্রয়োজন হবে না।"
              : "When members pay online, transactions are verified and reconciled instantly with zero manual bookkeeping required."}
          </div>
        </div>
      )}

      {/* MODAL 1: ISSUE REGULAR MONTHLY DUES */}
      <Modal open={monthlyModal} onClose={() => setMonthlyModal(false)} title={isBn ? "নিয়মিত মাসিক চাঁদা জারি করুন" : "Issue Monthly Subscriptions"}>
        <div className="space-y-4 py-1">
          <p className="text-xs text-gray-600">
            {isBn
              ? "নির্বাচিত মাসের জন্য সদস্যদের অ্যাকাউন্টে নির্ধারিত মাসিক চাঁদা বিল জারি করুন।"
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

      {/* MODAL 2: ISSUE GM EXTRA CHARGES / SPECIAL LEVIES */}
      <Modal open={gmChargeModal} onClose={() => setGmChargeModal(false)} title={isBn ? "সাধারণ সভার (GM) বিশেষ চার্জ / লেভি জারি" : "Issue GM Extra Charge & Special Levy"}>
        <div className="space-y-4 py-1">
          <p className="text-xs text-gray-600">
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

      {/* MODAL 3: MANUAL PAYMENT VERIFICATION */}
      <Modal open={!!recordPaymentModal} onClose={() => setRecordPaymentModal(null)} title={isBn ? "ম্যানুয়াল / ক্যাশ পেমেন্ট যাচাই ও গ্রহণ" : "Record Offline Payment"}>
        {recordPaymentModal && (
          <div className="space-y-4 py-1">
            <div className="p-3.5 rounded-xl border bg-slate-50 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">{isBn ? "সদস্যের নাম:" : "Member:"}</span> <span className="font-bold">{recordPaymentModal.residentName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{isBn ? "বিবরণ:" : "Charge:"}</span> <span className="font-semibold">{recordPaymentModal.chargeTitle || monthLabel(recordPaymentModal.month)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{isBn ? "পরিমাণ:" : "Amount:"}</span> <span className="font-black text-emerald-700 text-sm">{currency(recordPaymentModal.amount)}</span></div>
            </div>

            <Field label={isBn ? "পেমেন্ট মাধ্যম (Payment Method)" : "Payment Method"}>
              <select style={inputStyle()} className={inputCls} value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                <option value="Cash">{isBn ? "নগদ ক্যাশ (Cash)" : "Cash"}</option>
                <option value="bKash">{isBn ? "বিকাশ (bKash)" : "bKash"}</option>
                <option value="Nagad">{isBn ? "নগদ (Nagad)" : "Nagad"}</option>
                <option value="Bank Transfer">{isBn ? "ব্যাংক স্থানান্তর (Bank Transfer)" : "Bank Transfer"}</option>
                <option value="Cheque">{isBn ? "চেক (Cheque)" : "Cheque"}</option>
              </select>
            </Field>

            <Field label={isBn ? "রসিদ / ট্রানজেকশন রেফারেন্স নং" : "Receipt / Transaction Ref No."}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={payRef}
                onChange={e => setPayRef(e.target.value)}
                placeholder="e.g. REC-2026-0819"
              />
            </Field>

            <Field label={isBn ? "মন্তব্য / নোট (ঐচ্ছিক)" : "Note (Optional)"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={payNote}
                onChange={e => setPayNote(e.target.value)}
                placeholder={isBn ? "কোষাধ্যক্ষের হাতে জমা হয়েছে" : "Received by Treasurer"}
              />
            </Field>

            <div className="flex items-center gap-2 pt-2">
              <Btn full variant="outline" onClick={() => setRecordPaymentModal(null)}>{isBn ? "বাতিল" : "Cancel"}</Btn>
              <Btn full icon={CheckCircle2} onClick={handleRecordPayment}>{isBn ? "পরিশোধ নিশ্চিত করুন" : "Confirm Payment"}</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 4: RECORD CLUB EXPENSE VOUCHER */}
      <Modal open={expenseModal} onClose={() => setExpenseModal(false)} title={isBn ? "ক্লাব ব্যয় ও ভাউচার এন্ট্রি" : "Record Club Expense Voucher"}>
        <div className="space-y-4 py-1">
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
