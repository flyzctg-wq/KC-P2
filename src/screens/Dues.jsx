import React, { useState } from "react";
import { Wallet, CreditCard, Loader2 } from "lucide-react";
import { Btn, Card, Badge, Empty, Modal, SectionTitle } from "../components/primitives";
import { C } from "../theme";
import { currency, monthLabel } from "../utils";
import { startDuesPayment } from "../lib/payments";
import { trackEvent } from "../lib/analytics";

export default function Dues({ session, db, toast }) {
  const [payModal, setPayModal] = useState(null);
  const [paying, setPaying] = useState(false);
  const mine = db.dues.filter(d => d.residentId === session.id).sort((a, b) => b.month.localeCompare(a.month));
  const totalDue = mine.filter(d => d.status !== "paid").reduce((s, d) => s + d.amount, 0);

  const pay = async (due) => {
    setPaying(true);
    trackEvent("dues_payment_started", { amount: due.amount, month: due.month });
    try {
      await startDuesPayment({ dueId: due.id, residentId: session.id, amount: due.amount, month: due.month });
      // startDuesPayment redirects the browser on success — if we're
      // still here, something didn't throw but also didn't redirect,
      // which shouldn't happen, but don't leave the button stuck either way.
    } catch (e) {
      toast(e.message || "Could not start payment. Please try again.", "error");
      setPaying(false);
    }
  };

  return (
    <div>
      <SectionTitle>Financials & dues</SectionTitle>
      <Card className="p-5 mb-5" style={{ backgroundColor: totalDue ? C.tertiaryContainer : C.primaryContainer }}>
        <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>{totalDue ? "Outstanding balance" : "You're all caught up"}</p>
        <p className="text-3xl font-extrabold text-white heading mt-1">{currency(totalDue)}</p>
      </Card>
      <SectionTitle>History</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {mine.map(d => (
          <Card key={d.id} className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-sm">{monthLabel(d.month)}</p>
              <p className="text-xs" style={{ color: C.onSurfaceVariant }}>{currency(d.amount)}{d.ref ? ` · ${d.ref}` : ""}</p>
            </div>
            {d.status === "paid" ? <Badge tone="success">Paid</Badge> : <Btn size="sm" onClick={() => setPayModal(d)}>Pay now</Btn>}
          </Card>
        ))}
        {mine.length === 0 && <Empty icon={Wallet} title="No dues issued yet" subtitle="The treasurer hasn't issued dues for your account." />}
      </div>

      <Modal open={!!payModal} onClose={() => !paying && setPayModal(null)} title="Confirm payment">
        {payModal && (
          <div>
            <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: C.surfaceContainerLow }}>
              <div className="flex justify-between text-sm mb-1"><span style={{ color: C.onSurfaceVariant }}>Period</span><span className="font-semibold">{monthLabel(payModal.month)}</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: C.onSurfaceVariant }}>Amount</span><span className="font-bold">{currency(payModal.amount)}</span></div>
            </div>
            <p className="text-xs mb-4 flex items-center gap-1.5" style={{ color: C.onSurfaceVariant }}><CreditCard size={13} /> You'll be redirected to PipraPay to complete this payment securely.</p>
            <Btn full onClick={() => pay(payModal)} disabled={paying} icon={paying ? Loader2 : undefined}>
              {paying ? "Redirecting…" : `Proceed to pay ${currency(payModal.amount)}`}
            </Btn>
          </div>
        )}
      </Modal>
    </div>
  );
}
