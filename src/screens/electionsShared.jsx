import React, { useState } from "react";
import { CheckCircle2, ShieldCheck, BadgeCheck, FileCheck2, Printer, ListChecks } from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Avatar, Modal } from "../components/primitives";
import { C } from "../theme";
import { uid, fmtDate } from "../utils";

export function NominationView({ election, session, db, persist, toast, logActivity }) {
  const [position, setPosition] = useState(election.positions[0]); const [manifesto, setManifesto] = useState("");
  const myNomination = (election.nominations || []).find(n => n.userId === session.id);
  const canManage = session.role === "admin" && (session.permissions.canManageMembers || session.post === "President");

  const submit = () => {
    if (!manifesto.trim()) return;
    persist(d => logActivity({
      ...d, elections: d.elections.map(e => e.id !== election.id ? e : { ...e, nominations: [...(e.nominations || []), { id: uid("nom"), userId: session.id, userName: session.name, position, manifesto, status: "pending" }] }),
    }, session.name, `Submitted nomination for ${position} in ${election.title}`));
    toast("Nomination submitted for review.");
    setManifesto("");
  };
  const review = (nom, status) => {
    persist(d => {
      let elections = d.elections.map(e => e.id !== election.id ? e : { ...e, nominations: e.nominations.map(n => n.id === nom.id ? { ...n, status } : n) });
      if (status === "approved") {
        const nomUser = d.users.find(u => u.id === nom.userId);
        elections = elections.map(e => e.id !== election.id ? e : { ...e, candidates: [...e.candidates, { id: uid("cand"), name: nom.userName, position: nom.position, block: nomUser?.block || "—", manifesto: nom.manifesto }] });
      }
      return logActivity({ ...d, elections }, session.name, `${status === "approved" ? "Approved" : "Rejected"} nomination: ${nom.userName} for ${nom.position}`);
    });
  };
  const openVoting = () => persist(d => logActivity({ ...d, elections: d.elections.map(e => e.id === election.id ? { ...e, status: "active" } : e) }, session.name, `Opened voting for ${election.title}`));

  return (
    <div>
      <p className="text-xs mb-4" style={{ color: C.onSurfaceVariant }}>Nominations close {fmtDate(election.endDate)}. {election.candidates.length} candidate{election.candidates.length !== 1 ? "s" : ""} confirmed so far.</p>
      {!myNomination && !canManage && (
        <div className="mb-5 p-4 rounded-xl" style={{ backgroundColor: C.surfaceContainerLow }}>
          <h4 className="font-bold text-sm mb-2">Nominate yourself</h4>
          <Field label="Position"><select style={inputStyle()} className={inputCls} value={position} onChange={e => setPosition(e.target.value)}>{election.positions.map(p => <option key={p}>{p}</option>)}</select></Field>
          <Field label="Manifesto"><textarea style={inputStyle()} className={inputCls} rows={3} value={manifesto} onChange={e => setManifesto(e.target.value)} /></Field>
          <Btn size="sm" onClick={submit} disabled={!manifesto.trim()}>Submit nomination</Btn>
        </div>
      )}
      {myNomination && <div className="mb-5 p-3 rounded-xl text-xs flex items-center gap-2" style={{ backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer }}><CheckCircle2 size={14} /> Your nomination for {myNomination.position} is {myNomination.status}.</div>}

      <h4 className="font-bold text-xs mb-2" style={{ color: C.onSurfaceVariant }}>NOMINATIONS</h4>
      <div className="flex flex-col gap-2 mb-4">
        {(election.nominations || []).map(n => (
          <Card key={n.id} className="p-3.5">
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-sm">{n.userName} <span className="font-normal text-xs" style={{ color: C.outline }}>· {n.position}</span></p>
              <Badge tone={n.status === "approved" ? "success" : n.status === "rejected" ? "danger" : "neutral"}>{n.status}</Badge>
            </div>
            <p className="text-xs mb-2" style={{ color: C.onSurfaceVariant }}>{n.manifesto}</p>
            {canManage && n.status === "pending" && <div className="flex gap-2"><Btn size="sm" onClick={() => review(n, "approved")}>Approve</Btn><Btn size="sm" variant="outline" onClick={() => review(n, "rejected")}>Reject</Btn></div>}
          </Card>
        ))}
        {(election.nominations || []).length === 0 && <p className="text-xs" style={{ color: C.outline }}>No nominations submitted yet.</p>}
      </div>
      {canManage && election.candidates.length > 0 && <Btn full onClick={openVoting}>Close nominations & open voting ({election.candidates.length} candidates)</Btn>}
    </div>
  );
}

export function ElectionOversight({ election, db }) {
  const eligible = db.users.filter(u => u.status === "active" && u.memberClass !== "New");
  const votedIds = new Set(db.votes.filter(v => v.electionId === election.id).map(v => v.voterId));
  const uniqueVoters = votedIds.size;
  const turnout = eligible.length ? Math.round((uniqueVoters / eligible.length) * 100) : 0;
  const [showRoll, setShowRoll] = useState(false);
  const [showReport, setShowReport] = useState(false);

  return (
    <div className="mt-5 pt-4 border-t" style={{ borderColor: C.outlineVariant }}>
      <h4 className="font-bold text-xs mb-2 flex items-center gap-1.5" style={{ color: C.onSurfaceVariant }}><ShieldCheck size={13} /> STANDING COUNCIL OVERSIGHT</h4>
      <div className="p-3 rounded-xl mb-2" style={{ backgroundColor: C.surfaceContainerLow }}>
        <div className="flex justify-between text-xs font-semibold mb-1.5"><span>Turnout</span><span>{uniqueVoters} / {eligible.length} eligible ({turnout}%)</span></div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.surfaceContainerHigh }}><div className="h-full rounded-full" style={{ width: `${turnout}%`, backgroundColor: C.primary }} /></div>
      </div>
      <div className="flex gap-2">
        <Btn size="sm" variant="outline" icon={ListChecks} onClick={() => setShowRoll(true)}>Voter list audit</Btn>
        {election.status === "closed" && <Btn size="sm" variant="outline" icon={FileCheck2} onClick={() => setShowReport(true)}>Certification report</Btn>}
      </div>
      <Modal open={showRoll} onClose={() => setShowRoll(false)} title="Voter list audit">
        <p className="text-xs mb-3" style={{ color: C.onSurfaceVariant }}>Confirms who cast a ballot — not who they voted for — for independent turnout verification.</p>
        <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto">
          {eligible.map(u => (
            <div key={u.id} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: C.surfaceContainerLow }}>
              <div className="flex items-center gap-2"><Avatar name={u.name} size={24} /><span className="text-sm font-semibold">{u.name}</span></div>
              {votedIds.has(u.id) ? <Badge tone="success">Voted</Badge> : <Badge tone="neutral">Not yet</Badge>}
            </div>
          ))}
        </div>
      </Modal>
      <Modal open={showReport} onClose={() => setShowReport(false)} title="Election certification report" width="max-w-lg">
        <CertificationReport election={election} db={db} eligible={eligible.length} turnout={turnout} />
      </Modal>
    </div>
  );
}

export function CertificationReport({ election, db, eligible, turnout }) {
  return (
    <div>
      <div id="cert-report-print">
        <div className="text-center mb-5 pb-4 border-b" style={{ borderColor: C.outlineVariant }}>
          <BadgeCheck size={28} style={{ color: C.primary }} className="mx-auto mb-2" />
          <p className="font-extrabold heading text-lg">{election.title}</p>
          <p className="text-xs" style={{ color: C.outline }}>Certified election summary · {fmtDate(election.endDate)}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5 text-center">
          <div><p className="text-2xl font-extrabold heading">{eligible}</p><p className="text-[11px]" style={{ color: C.outline }}>Eligible voters</p></div>
          <div><p className="text-2xl font-extrabold heading">{turnout}%</p><p className="text-[11px]" style={{ color: C.outline }}>Turnout</p></div>
        </div>
        {election.positions.map(pos => {
          const cands = election.candidates.filter(c => c.position === pos);
          const votes = db.votes.filter(v => v.electionId === election.id && v.position === pos);
          const ranked = cands.map(c => ({ ...c, count: votes.filter(v => v.candidateId === c.id).length })).sort((a, b) => b.count - a.count);
          const winner = ranked[0];
          return (
            <div key={pos} className="mb-4">
              <p className="font-bold text-sm mb-1.5">{pos}</p>
              {ranked.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between text-xs py-1">
                  <span className={i === 0 ? "font-bold" : ""}>{i === 0 && "🏆 "}{c.name}</span>
                  <span className="font-semibold" style={{ color: C.onSurfaceVariant }}>{c.count} votes</span>
                </div>
              ))}
              {winner && <p className="text-[11px] mt-1 font-semibold" style={{ color: C.primary }}>Declared winner: {winner.name}</p>}
            </div>
          );
        })}
      </div>
      <Btn full icon={Printer} onClick={() => window.print()}>Print / save as PDF</Btn>
    </div>
  );
}
