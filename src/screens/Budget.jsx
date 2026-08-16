import React, { useState } from "react";
import { Vote, Plus, PieChart } from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Empty, Modal, SectionTitle } from "../components/primitives";
import { C } from "../theme";
import { uid, currency } from "../utils";

export default function Budget({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [form, setForm] = useState(false);
  const isCouncil = !!session.standingCouncil;
  const isTopTier = session.role === "admin" && (session.post === "President" || session.post === "General Secretary");
  const canPropose = session.role === "admin" && (session.permissions?.canManageFinancials || isTopTier);
  const items = [...(db.budgetItems || [])].sort((a, b) => (a.status === "voting" ? -1 : 1));
  const totalApproved = items.filter(i => i.status === "approved").reduce((s, i) => s + i.amount, 0);
  const totalProposed = items.reduce((s, i) => s + i.amount, 0);

  const statusLabels = {
    proposed: isBn ? "প্রস্তাবিত" : "PROPOSED",
    voting: isBn ? "পর্যালোচনা চলছে" : "VOTING",
    approved: isBn ? "অনুমোদিত" : "APPROVED",
    rejected: isBn ? "প্রত্যাখ্যাত" : "REJECTED",
  };

  const categoryLabels = {
    Maintenance: isBn ? "রক্ষণাবেক্ষণ" : "Maintenance",
    Security: isBn ? "নিরাপত্তা" : "Security",
    Events: isBn ? "ইভেন্ট ও ক্রীড়া" : "Events",
    Utilities: isBn ? "ইউটিলিটি ও সেবা" : "Utilities",
    Administration: isBn ? "প্রশাসন" : "Administration",
    Other: isBn ? "অন্যান্য" : "Other",
  };

  const propose = (category, description, amount) => {
    if (!description.trim() || !amount) return;
    persist(d => logActivity({ ...d, budgetItems: [{ id: uid("bud"), category, description, amount: Number(amount), proposedBy: session.name, status: "proposed", councilVotes: [] }, ...(d.budgetItems || [])] }, session.name, `Proposed budget item: ${description}`));
    toast(isBn ? "বাজেট প্রস্তাব জমা হয়েছে।" : "Budget item proposed.");
    setForm(false);
  };
  const openVoting = (item) => persist(d => logActivity({ ...d, budgetItems: d.budgetItems.map(x => x.id === item.id ? { ...x, status: "voting" } : x) }, session.name, `Opened council review: ${item.description}`));
  const castVote = (item, choice) => {
    persist(d => ({ ...d, budgetItems: d.budgetItems.map(x => x.id !== item.id ? x : { ...x, councilVotes: [...x.councilVotes.filter(v => v.voterId !== session.id), { voterId: session.id, choice }] }) }));
    toast(isBn ? (choice === "for" ? "পক্ষে ভোট সম্পন্ন।" : "বিপক্ষে ভোট সম্পন্ন।") : `Vote cast ${choice}.`);
  };
  const finalize = (item, status) => {
    persist(d => logActivity({ ...d, budgetItems: d.budgetItems.map(x => x.id === item.id ? { ...x, status } : x) }, session.name, `${status === "approved" ? "Approved" : "Rejected"} budget item: ${item.description}`));
    toast(isBn ? (status === "approved" ? "বাজেট অনুমোদন করা হয়েছে।" : "বাজেট বাতিল করা হয়েছে।") : `Budget item ${status}.`);
  };

  return (
    <div>
      <SectionTitle
        action={
          canPropose && (
            <Btn size="sm" icon={Plus} onClick={() => setForm(true)}>
              {isBn ? "+ বাজেট প্রস্তাব করুন" : "+ Propose item"}
            </Btn>
          )
        }
      >
        {isBn ? "বার্ষিক বাজেট ও স্থায়ী পরিষদ পর্যালোচনা" : "Annual budget review"}
      </SectionTitle>
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <Card className="p-4">
          <p className="text-xs" style={{ color: C.onSurfaceVariant }}>{isBn ? "অনুমোদিত মোট বাজেট" : "Approved so far"}</p>
          <p className="text-xl font-extrabold heading" style={{ color: C.primary }}>{currency(totalApproved)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs" style={{ color: C.onSurfaceVariant }}>{isBn ? "মোট প্রস্তাবিত বাজেট" : "Total proposed"}</p>
          <p className="text-xl font-extrabold heading">{currency(totalProposed)}</p>
        </Card>
      </div>
      <div className="flex flex-col gap-3">
        {items.map(item => {
          const forV = item.councilVotes.filter(v => v.choice === "for").length;
          const againstV = item.councilVotes.filter(v => v.choice === "against").length;
          const myVote = item.councilVotes.find(v => v.voterId === session.id)?.choice;
          return (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge tone={item.status === "approved" ? "success" : item.status === "rejected" ? "danger" : item.status === "voting" ? "info" : "neutral"}>
                      {statusLabels[item.status] || item.status}
                    </Badge>
                    <span className="text-[11px] font-semibold" style={{ color: C.outline }}>
                      {categoryLabels[item.category] || item.category}
                    </span>
                  </div>
                  <p className="font-bold text-sm">{item.description}</p>
                  <p className="text-xs mt-0.5" style={{ color: C.onSurfaceVariant }}>
                    {currency(item.amount)} · {isBn ? "প্রস্তাবক:" : "proposed by"} {item.proposedBy}
                  </p>
                </div>
              </div>
              {item.status === "proposed" && isTopTier && (
                <Btn size="sm" variant="outline" className="mt-3" onClick={() => openVoting(item)}>
                  {isBn ? "স্থায়ী পরিষদ পর্যালোচনার জন্য উন্মুক্ত করুন" : "Open for council review"}
                </Btn>
              )}
              {item.status === "voting" && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: C.outlineVariant }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: C.onSurfaceVariant }}>
                    {forV} {isBn ? "পক্ষে" : "for"} · {againstV} {isBn ? "বিপক্ষে" : "against"}
                  </p>
                  {isCouncil && (
                    <div className="flex gap-2 mb-2">
                      <Btn size="sm" variant={myVote === "for" ? "primary" : "outline"} onClick={() => castVote(item, "for")}>
                        {isBn ? "পক্ষে" : "Vote for"}
                      </Btn>
                      <Btn size="sm" variant={myVote === "against" ? "danger" : "outline"} onClick={() => castVote(item, "against")}>
                        {isBn ? "বিপক্ষে" : "Vote against"}
                      </Btn>
                    </div>
                  )}
                  {isTopTier && (
                    <div className="flex gap-2">
                      <Btn size="sm" onClick={() => finalize(item, "approved")}>{isBn ? "অনুমোদন" : "Approve"}</Btn>
                      <Btn size="sm" variant="outline" onClick={() => finalize(item, "rejected")}>{isBn ? "বাতিল" : "Reject"}</Btn>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
        {items.length === 0 && (
          <Empty
            icon={PieChart}
            title={isBn ? "কোনো বাজেট আইটেম প্রস্তাব করা হয়নি" : "No budget items yet"}
            subtitle={isBn ? "নতুন উন্নয়ন বা পরিচালনা ব্যয়ের প্রস্তাব জমা দিতে উপরের বোতামটি ব্যবহার করুন।" : "Use the button above to propose budget items."}
          />
        )}
      </div>
      <Modal open={form} onClose={() => setForm(false)} title={isBn ? "নতুন বাজেট আইটেম প্রস্তাব" : "Propose budget item"}>
        <BudgetForm onSubmit={propose} isBn={isBn} />
      </Modal>
    </div>
  );
}

export function BudgetForm({ onSubmit, isBn = false }) {
  const [category, setCategory] = useState("Maintenance");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const categories = [
    { key: "Maintenance", label: isBn ? "রক্ষণাবেক্ষণ" : "Maintenance" },
    { key: "Security", label: isBn ? "নিরাপত্তা" : "Security" },
    { key: "Events", label: isBn ? "ইভেন্ট ও ক্রীড়া" : "Events" },
    { key: "Utilities", label: isBn ? "ইউটিলিটি ও সেবা" : "Utilities" },
    { key: "Administration", label: isBn ? "প্রশাসন" : "Administration" },
    { key: "Other", label: isBn ? "অন্যান্য" : "Other" },
  ];

  return (
    <div className="space-y-4">
      <Field label={isBn ? "খাত / শ্রেণি" : "Category"}>
        <select style={inputStyle()} className={inputCls} value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </Field>
      <Field label={isBn ? "বিবরণ" : "Description"}>
        <input style={inputStyle()} className={inputCls} value={description} onChange={e => setDescription(e.target.value)} placeholder={isBn ? "উদাঃ সিসিটিভি ক্যামেরা মেরামত" : "e.g. Streetlight repairs"} />
      </Field>
      <Field label={isBn ? "পরিমাণ (৳)" : "Amount (৳)"}>
        <input type="number" style={inputStyle()} className={inputCls} value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
      </Field>
      <Btn full disabled={!description.trim() || !amount} onClick={() => onSubmit(category, description, amount)}>
        {isBn ? "প্রস্তাব জমা দিন" : "Submit proposal"}
      </Btn>
    </div>
  );
}

