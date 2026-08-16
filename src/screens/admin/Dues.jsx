import React from "react";
import { Shield, Send } from "lucide-react";
import { Btn, Card, Badge, Avatar, SectionTitle } from "../../components/primitives";
import { C } from "../../theme";
import { uid, currency, monthLabel, currentMonthYM } from "../../utils";

export default function AdminDues({ session, db, persist, toast, logActivity }) {
  const canManage = session.permissions.canManageFinancials;
  const ym = currentMonthYM();
  const activeResidents = db.users.filter(u => u.status === "active");
  const alreadyIssued = db.dues.filter(d => d.month === ym);
  const notIssued = activeResidents.filter(u => !alreadyIssued.some(d => d.residentId === u.id));

  const issueBulk = (amount) => {
    const newDues = notIssued.map(u => ({ id: uid("due"), residentId: u.id, month: ym, amount, status: "pending", paidDate: null, ref: null }));
    if (newDues.length === 0) { toast("Dues already issued for everyone.", "error"); return; }
    persist(d => logActivity({ ...d, dues: [...d.dues, ...newDues] }, session.name, `Issued ${monthLabel(ym)} dues to ${newDues.length} residents`));
    toast(`Issued dues to ${newDues.length} residents.`);
  };

  const paid = db.dues.filter(d => d.status === "paid");
  const outstanding = db.dues.filter(d => d.status !== "paid");

  return (
    <div>
      <SectionTitle>Financials & dues</SectionTitle>
      {!canManage && <div className="mb-4 p-3 rounded-xl text-xs flex items-center gap-2" style={{ backgroundColor: C.errorContainer, color: C.onErrorContainer }}><Shield size={14} /> View-only — you lack canManageFinancials permission.</div>}
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <Card className="p-4"><p className="text-xs" style={{ color: C.onSurfaceVariant }}>Collected</p><p className="text-xl font-extrabold heading" style={{ color: C.primary }}>{currency(paid.reduce((s, d) => s + d.amount, 0))}</p></Card>
        <Card className="p-4"><p className="text-xs" style={{ color: C.onSurfaceVariant }}>Outstanding</p><p className="text-xl font-extrabold heading" style={{ color: C.error }}>{currency(outstanding.reduce((s, d) => s + d.amount, 0))}</p></Card>
        <Card className="p-4"><p className="text-xs" style={{ color: C.onSurfaceVariant }}>{monthLabel(ym)} not issued</p><p className="text-xl font-extrabold heading">{notIssued.length}</p></Card>
      </div>
      {canManage && notIssued.length > 0 && <Btn icon={Send} className="mb-6" onClick={() => issueBulk(1500)}>Issue {monthLabel(ym)} dues (৳1,500) to {notIssued.length} residents</Btn>}

      <SectionTitle>All resident dues — {monthLabel(ym)}</SectionTitle>
      <div className="flex flex-col gap-2">
        {activeResidents.map(u => {
          const due = db.dues.find(d => d.residentId === u.id && d.month === ym);
          return (
            <Card key={u.id} className="p-3.5 flex items-center gap-3">
              <Avatar name={u.name} size={32} />
              <div className="flex-1 min-w-0"><p className="font-semibold text-sm truncate">{u.name}</p><p className="text-[11px]" style={{ color: C.outline }}>Block {u.block} · {u.unit}</p></div>
              {due ? <Badge tone={due.status === "paid" ? "success" : "warning"}>{due.status}</Badge> : <Badge tone="neutral">not issued</Badge>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
