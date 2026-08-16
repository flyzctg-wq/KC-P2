import { NominationView, ElectionOversight } from "./electionsShared";
import React, { useState } from "react";
import { Vote, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Btn, Card, Badge, Avatar, Modal, SectionTitle } from "../components/primitives";
import { C } from "../theme";
import { supabase } from "../lib/supabase";
import { trackEvent } from "../lib/analytics";

export default function Elections({ session, db, persist, toast, logActivity }) {
  const [openEl, setOpenEl] = useState(null);
  const sorted = [...db.elections].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  const canVote = session.memberClass !== "New";
  const isCouncil = !!session.standingCouncil || (session.role === "admin" && (session.post === "President" || session.post === "General Secretary"));

  return (
    <div>
      <SectionTitle>Elections</SectionTitle>
      {!canVote && <div className="mb-4 p-3 rounded-xl text-xs flex items-center gap-2" style={{ backgroundColor: C.errorContainer, color: C.onErrorContainer }}><AlertCircle size={14} /> New members gain voting rights after admin approval upgrades their class.</div>}
      <div className="flex flex-col gap-3">
        {sorted.map(el => (
          <Card key={el.id} className="p-4 cursor-pointer" onClick={() => setOpenEl(el)}>
            <div className="flex items-center justify-between">
              <div>
                <Badge tone={el.status === "active" ? "success" : el.status === "closed" ? "neutral" : el.status === "nomination" ? "warning" : "info"}>{el.status === "nomination" ? "nominations open" : el.status}</Badge>
                <h3 className="font-bold text-sm mt-2">{el.title}</h3>
                <p className="text-xs mt-1" style={{ color: C.onSurfaceVariant }}>{el.positions.join(" · ")}</p>
              </div>
              <ChevronRight size={18} style={{ color: C.outline }} />
            </div>
          </Card>
        ))}
      </div>
      <Modal open={!!openEl} onClose={() => setOpenEl(null)} title={openEl?.title || ""} width="max-w-lg">
        {openEl && openEl.status === "nomination" ? (
          <NominationView election={openEl} session={session} db={db} persist={persist} toast={toast} logActivity={logActivity} />
        ) : openEl && (
          <div>
            <BallotView election={openEl} session={session} db={db} persist={persist} toast={toast} logActivity={logActivity} canVote={canVote} />
            {isCouncil && <ElectionOversight election={openEl} db={db} />}
          </div>
        )}
      </Modal>
    </div>
  );
}

export function BallotView({ election, session, db, persist, toast, logActivity, canVote }) {
  const myVotes = db.votes.filter(v => v.electionId === election.id && v.voterId === session.id);
  const [choice, setChoice] = useState({});

  const submitVote = async (position) => {
    const candId = choice[position];
    if (!candId) return;
    const { error } = await supabase.rpc("cast_vote", { p_election_id: election.id, p_position: position, p_candidate_id: candId });
    if (error) { toast(error.message || "Could not cast vote.", "error"); return; }
    persist(d => logActivity(d, session.name, `Voted for ${position} in ${election.title}`)); // realtime refetch also picks this up
    trackEvent("vote_cast", { election_id: election.id, position });
    toast(`Vote recorded for ${position}.`);
  };

  const results = (position) => {
    const cands = election.candidates.filter(c => c.position === position);
    const votes = db.votes.filter(v => v.electionId === election.id && v.position === position);
    const total = votes.length || 1;
    return cands.map(c => ({ ...c, count: votes.filter(v => v.candidateId === c.id).length, pct: Math.round((votes.filter(v => v.candidateId === c.id).length / total) * 100) }));
  };

  return (
    <div className="flex flex-col gap-6">
      {election.positions.map(pos => {
        const already = myVotes.find(v => v.position === pos);
        const showResults = election.status === "closed";
        return (
          <div key={pos}>
            <h4 className="font-bold text-sm mb-2.5">{pos}</h4>
            <div className="flex flex-col gap-2">
              {(showResults ? results(pos) : election.candidates.filter(c => c.position === pos)).map(c => (
                <div key={c.id}>
                  <label className="flex items-start gap-3 p-3 rounded-xl cursor-pointer" style={{ backgroundColor: choice[pos] === c.id ? C.secondaryContainer : C.surfaceContainerLow, border: `1.5px solid ${choice[pos] === c.id ? C.primary : "transparent"}` }}>
                    {!showResults && !already && election.status === "active" && (
                      <input type="radio" name={pos} className="mt-1" checked={choice[pos] === c.id} onChange={() => setChoice({ ...choice, [pos]: c.id })} />
                    )}
                    <Avatar name={c.name} size={32} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{c.name} <span className="font-normal text-xs" style={{ color: C.outline }}>· Block {c.block}</span></p>
                      <p className="text-xs mt-0.5" style={{ color: C.onSurfaceVariant }}>{c.manifesto}</p>
                      {showResults && <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.surfaceContainerHigh }}><div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: C.primary }} /></div>}
                      {showResults && <p className="text-[11px] font-bold mt-1" style={{ color: C.primary }}>{c.count} votes · {c.pct}%</p>}
                    </div>
                  </label>
                </div>
              ))}
            </div>
            {!showResults && (already ? <p className="text-xs font-semibold mt-2 flex items-center gap-1.5" style={{ color: C.primary }}><CheckCircle2 size={13} /> Vote submitted for {pos}</p> :
              canVote && election.status === "active" && <Btn size="sm" className="mt-2.5" onClick={() => submitVote(pos)} disabled={!choice[pos]}>Submit vote</Btn>)}
          </div>
        );
      })}
    </div>
  );
}

