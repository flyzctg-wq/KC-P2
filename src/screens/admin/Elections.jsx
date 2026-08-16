import { NominationView, ElectionOversight } from "../electionsShared";
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Modal, SectionTitle } from "../../components/primitives";
import { C } from "../../theme";
import { uid, nowISO, fmtDate } from "../../utils";

export default function AdminElections({ session, db, persist, toast, logActivity }) {
  const [form, setForm] = useState(false);
  const [openEl, setOpenEl] = useState(null);

  const closeElection = (el) => persist(d => logActivity({ ...d, elections: d.elections.map(x => x.id === el.id ? { ...x, status: "closed" } : x) }, session.name, `Certified & closed election: ${el.title}`));
  const createElection = (title, positions, candidates, nominationMode) => {
    persist(d => logActivity({ ...d, elections: [{ id: uid("el"), title, status: nominationMode ? "nomination" : "active", startDate: nowISO(), endDate: new Date(Date.now() + 7 * 86400000).toISOString(), positions, candidates, nominations: [] }, ...d.elections] }, session.name, `Created election: ${title}${nominationMode ? " (nominations open)" : ""}`));
    toast("Election created.");
    setForm(false);
  };

  return (
    <div>
      <SectionTitle action={<Btn size="sm" icon={Plus} onClick={() => setForm(true)}>New election</Btn>}>Elections</SectionTitle>
      <div className="flex flex-col gap-3">
        {db.elections.map(el => {
          const votes = db.votes.filter(v => v.electionId === el.id);
          return (
            <Card key={el.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 cursor-pointer" onClick={() => setOpenEl(el)}>
                  <Badge tone={el.status === "active" ? "success" : el.status === "nomination" ? "warning" : "neutral"}>{el.status === "nomination" ? "nominations open" : el.status}</Badge>
                  <h3 className="font-bold text-sm mt-2">{el.title}</h3>
                  <p className="text-xs mt-1" style={{ color: C.onSurfaceVariant }}>{el.candidates.length} candidates · {votes.length} votes cast · closes {fmtDate(el.endDate)}</p>
                </div>
                {el.status === "active" && <Btn size="sm" variant="outline" onClick={() => closeElection(el)}>Certify & close</Btn>}
              </div>
            </Card>
          );
        })}
      </div>
      <Modal open={!!openEl} onClose={() => setOpenEl(null)} title={openEl?.title || ""} width="max-w-lg">
        {openEl && (openEl.status === "nomination"
          ? <NominationView election={openEl} session={session} db={db} persist={persist} toast={toast} logActivity={logActivity} />
          : <div><AdminElectionResults election={openEl} db={db} /><ElectionOversight election={openEl} db={db} /></div>)}
      </Modal>
      <Modal open={form} onClose={() => setForm(false)} title="Create election" width="max-w-lg">
        <ElectionForm onSubmit={createElection} />
      </Modal>
    </div>
  );
}

export function AdminElectionResults({ election, db }) {
  return (
    <div className="flex flex-col gap-5">
      {election.positions.map(pos => {
        const cands = election.candidates.filter(c => c.position === pos);
        const votes = db.votes.filter(v => v.electionId === election.id && v.position === pos);
        const total = votes.length || 1;
        return (
          <div key={pos}>
            <h4 className="font-bold text-sm mb-2">{pos} <span className="font-normal text-xs" style={{ color: C.outline }}>({votes.length} votes)</span></h4>
            {cands.map(c => {
              const count = votes.filter(v => v.candidateId === c.id).length;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={c.id} className="mb-2">
                  <div className="flex justify-between text-xs font-semibold mb-1"><span>{c.name}</span><span>{count} ({pct}%)</span></div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.surfaceContainerHigh }}><div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: C.primary }} /></div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function ElectionForm({ onSubmit }) {
  const [title, setTitle] = useState(""); const [positions, setPositions] = useState("General Secretary, Treasurer");
  const [candText, setCandText] = useState(""); const [nominationMode, setNominationMode] = useState(false);
  return (
    <div>
      <Field label="Election title"><input style={inputStyle()} className={inputCls} value={title} onChange={e => setTitle(e.target.value)} /></Field>
      <Field label="Positions (comma separated)"><input style={inputStyle()} className={inputCls} value={positions} onChange={e => setPositions(e.target.value)} /></Field>
      <Field label="">
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={nominationMode} onChange={e => setNominationMode(e.target.checked)} /> Open for member self-nomination instead of pre-set candidates</label>
      </Field>
      {!nominationMode && (
        <Field label="Candidates — one per line: Name | Position | Block | Manifesto">
          <textarea style={inputStyle()} className={inputCls} rows={5} value={candText} onChange={e => setCandText(e.target.value)} placeholder="Jane Doe | Treasurer | A | Improve reporting" />
        </Field>
      )}
      <Btn full onClick={() => {
        const posArr = positions.split(",").map(s => s.trim()).filter(Boolean);
        const cands = nominationMode ? [] : candText.split("\n").filter(Boolean).map(line => {
          const [name, position, block, manifesto] = line.split("|").map(s => (s || "").trim());
          return { id: uid("cand"), name, position, block, manifesto };
        });
        onSubmit(title, posArr, cands, nominationMode);
      }} disabled={!title.trim()}>Create election</Btn>
    </div>
  );
}

