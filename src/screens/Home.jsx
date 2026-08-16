import React from "react";
import { Bell, Wallet, Vote, LifeBuoy, ChevronRight } from "lucide-react";
import { Btn, Card, Badge, SectionTitle, StatMini } from "../components/primitives";
import { C } from "../theme";
import { fmtDate } from "../utils";

export default function ResidentHome({ session, db, go }) {
  const myDues = db.dues.filter(d => d.residentId === session.id);
  const pending = myDues.filter(d => d.status !== "paid");
  const activeElection = db.elections.find(e => e.status === "active");
  const myVotes = db.votes.filter(v => v.voterId === session.id);
  const recentNotices = [...db.notices].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  const myTickets = db.tickets.filter(t => t.residentId === session.id);

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm" style={{ color: C.onSurfaceVariant }}>{new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</p>
        <h1 className="text-2xl font-extrabold heading">Hi, {session.name.split(" ")[0]} 👋</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatMini icon={Wallet} label="Dues due" value={pending.length} tone={pending.length ? "warning" : "success"} onClick={() => go("r-dues")} />
        <StatMini icon={Vote} label="Active election" value={activeElection ? 1 : 0} tone={activeElection ? "info" : "neutral"} onClick={() => go("r-elections")} />
        <StatMini icon={Bell} label="Notices" value={db.notices.length} tone="neutral" onClick={() => go("r-notices")} />
        <StatMini icon={LifeBuoy} label="My tickets" value={myTickets.length} tone="neutral" onClick={() => go("r-tickets")} />
      </div>

      {activeElection && (
        <Card className="p-5 mb-6" style={{ backgroundColor: C.primary }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <Badge tone="success">Live election</Badge>
              <h3 className="text-white font-bold text-lg mt-2 heading">{activeElection.title}</h3>
              <p className="text-white/70 text-xs mt-1">Voting closes {fmtDate(activeElection.endDate)}</p>
            </div>
            <Btn variant="secondary" onClick={() => go("r-elections")}>Cast your vote <ChevronRight size={14} /></Btn>
          </div>
        </Card>
      )}

      <SectionTitle action={<button onClick={() => go("r-notices")} className="text-xs font-bold flex items-center" style={{ color: C.primary }}>See all <ChevronRight size={14} /></button>}>Recent notices</SectionTitle>
      <div className="flex flex-col gap-2.5 mb-8">
        {recentNotices.map(n => (
          <Card key={n.id} className="p-4 flex items-start gap-3" onClick={() => go("r-notices")}>
            <div style={{ backgroundColor: C.secondaryContainer }} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"><Bell size={15} style={{ color: C.onSecondaryContainer }} /></div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><p className="font-bold text-sm truncate">{n.title}</p><Badge tone={n.category === "Urgent" ? "danger" : n.category === "Financial" ? "warning" : "info"}>{n.category}</Badge></div>
              <p className="text-xs mt-1 line-clamp-1" style={{ color: C.onSurfaceVariant }}>{n.body}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
