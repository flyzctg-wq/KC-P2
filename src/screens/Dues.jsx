import React, { useState } from "react";
import { Wallet, CreditCard, Loader2 } from "lucide-react";
import { Btn, Card, Badge, Empty, Modal, SectionTitle } from "../components/primitives";
import { C } from "../theme";
import { currency, monthLabel } from "../utils";
import { startDuesPayment } from "../lib/payments";
import { trackEvent } from "../lib/analytics";

export default function Dues({ session, db, toast, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [payModal, setPayModal] = useState(null);
  const [paying, setPaying] = useState(false);
  const mine = db.dues.filter(d => d.residentId === session.id).sort((a, b) => b.month.localeCompare(a.month));
  const totalDue = mine.filter(d => d.status !== "paid").reduce((s, d) => s + d.amount, 0);

  const pay = async (due) => {
    setPaying(true);
    trackEvent("dues_payment_started", { amount: due.amount, month: due.month });
    try {
      await startDuesPayment({ dueId: due.id, residentId: session.id, amount: due.amount, month: due.month });
    } catch (e) {
      toast(e.message || (isBn ? "পেমেন্ট শুরু করা যায়নি। পুনরায় চেষ্টা করুন।" : "Could not start payment. Please try again."), "error");
      setPaying(false);
    }
  };

  return (
    <div>
      <SectionTitle>{isBn ? "অর্থ ও মাসিক চাঁদা" : "Financials & dues"}</SectionTitle>
      <Card className="p-5 mb-5" style={{ backgroundColor: totalDue ? C.tertiaryContainer : C.primaryContainer }}>
        <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>
          {totalDue ? (isBn ? "মোট বকেয়া চাঁদা" : "Outstanding balance") : (isBn ? "সব চাঁদা পরিশোধিত আছে" : "You're all caught up")}
        </p>
        <p className="text-3xl font-extrabold text-white heading mt-1">{currency(totalDue)}</p>
      </Card>
      <SectionTitle>{isBn ? "চাঁদা পরিশোধের ইতিহাস" : "History"}</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {mine.map(d => (
          <Card key={d.id} className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-sm">{monthLabel(d.month)}</p>
              <p className="text-xs" style={{ color: C.onSurfaceVariant }}>{currency(d.amount)}{d.ref ? ` · ${d.ref}` : ""}</p>
            </div>
            {d.status === "paid" ? (
              <Badge tone="success">{isBn ? "পরিশোধিত" : "Paid"}</Badge>
            ) : (
              <Btn size="sm" onClick={() => setPayModal(d)}>
                {isBn ? "পরিশোধ করুন" : "Pay now"}
              </Btn>
            )}
          </Card>
        ))}
        {mine.length === 0 && (
          <Empty
            icon={Wallet}
            title={isBn ? "কোনো চাঁদার রেকর্ড নেই" : "No dues issued yet"}
            subtitle={isBn ? "কোষাধ্যক্ষ এখনো আপনার অ্যাকাউন্টে চাঁদা বরাদ্দ করেননি।" : "The treasurer hasn't issued dues for your account."}
          />
        )}
      </div>

      <Modal open={!!payModal} onClose={() => !paying && setPayModal(null)} title={isBn ? "পেমেন্ট নিশ্চিতকরণ" : "Confirm payment"}>
        {payModal && (
          <div>
            <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: C.surfaceContainerLow }}>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: C.onSurfaceVariant }}>{isBn ? "সময়কাল / মাস" : "Period"}</span>
                <span className="font-semibold">{monthLabel(payModal.month)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: C.onSurfaceVariant }}>{isBn ? "চাঁদার পরিমাণ" : "Amount"}</span>
                <span className="font-bold">{currency(payModal.amount)}</span>
              </div>
            </div>
            <p className="text-xs mb-4 flex items-center gap-1.5" style={{ color: C.onSurfaceVariant }}>
              <CreditCard size={13} /> {isBn ? "নিরাপদ অনলাইন পেমেন্ট সম্পন্ন করতে আপনাকে PipraPay-তে রিডাইরেক্ট করা হবে।" : "You'll be redirected to PipraPay to complete this payment securely."}
            </p>
            <Btn full onClick={() => pay(payModal)} disabled={paying} icon={paying ? Loader2 : undefined}>
              {paying ? (isBn ? "রিডাইরেক্ট করা হচ্ছে..." : "Redirecting…") : (isBn ? `পরিশোধ করুন ${currency(payModal.amount)}` : `Proceed to pay ${currency(payModal.amount)}`)}
            </Btn>
          </div>
        )}
      </Modal>
    </div>
  );
}
