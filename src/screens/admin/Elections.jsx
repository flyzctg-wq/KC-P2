import { NominationView, ElectionOversight } from "../electionsShared";
import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Modal, SectionTitle } from "../../components/primitives";
import { C } from "../../theme";
import { uid, nowISO, fmtDate } from "../../utils";

export default function AdminElections({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [form, setForm] = useState(false);
  const [openEl, setOpenEl] = useState(null);

  // Bolt Optimization: Pre-compute vote counts per electionId to avoid O(E * V) array filtering on render
  const voteCounts = useMemo(() => {
    const counts = {};
    for (const v of db.votes || []) {
      counts[v.electionId] = (counts[v.electionId] || 0) + 1;
    }
    return counts;
  }, [db.votes]);

  const closeElection = (el) => {
    persist(d => logActivity({ ...d, elections: d.elections.map(x => x.id === el.id ? { ...x, status: "closed" } : x) }, session.name, `Certified & closed election: ${el.title}`));
    toast(isBn ? "নির্বাচন সফলভাবে সমাপ্ত ও সত্যায়িত করা হয়েছে।" : "Election certified & closed.");
  };

  const createElection = (title, positions, candidates, nominationMode) => {
    persist(d => logActivity({ ...d, elections: [{ id: uid("el"), title, status: nominationMode ? "nomination" : "active", startDate: nowISO(), endDate: new Date(Date.now() + 7 * 86400000).toISOString(), positions, candidates, nominations: [] }, ...d.elections] }, session.name, `Created election: ${title}${nominationMode ? " (nominations open)" : ""}`));
    toast(isBn ? "নতুন নির্বাচন সফলভাবে তৈরি হয়েছে।" : "Election created.");
    setForm(false);
  };

  const statusMap = {
    active: isBn ? "চলমান ভোটগ্রহণ" : "Live election",
    closed: isBn ? "সমাপ্ত" : "Closed",
    nomination: isBn ? "মনোনয়ন চলছে" : "Nominations open",
  };

  return (
    <div>
      <SectionTitle action={<Btn size="sm" icon={Plus} onClick={() => setForm(true)}>{isBn ? "নতুন নির্বাচন তৈরি" : "New election"}</Btn>}>
        {isBn ? "নির্বাচন প্রশাসন ও পর্যবেক্ষণ" : "Elections"}
      </SectionTitle>
      <div className="flex flex-col gap-3">
        {(db.elections || []).map(el => {
          const voteCount = voteCounts[el.id] || 0;
          return (
            <Card key={el.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 cursor-pointer" onClick={() => setOpenEl(el)}>
                  <Badge tone={el.status === "active" ? "success" : el.status === "nomination" ? "warning" : "neutral"}>
                    {statusMap[el.status] || el.status}
                  </Badge>
                  <h3 className="font-bold text-sm mt-2">{el.title}</h3>
                  <p className="text-xs mt-1" style={{ color: C.onSurfaceVariant }}>
                    {(el.candidates || []).length} {isBn ? "জন প্রার্থী" : "candidates"} · {voteCount} {isBn ? "টি ভোট সংগৃহীত" : "votes cast"} · {isBn ? `শেষ: ${fmtDate(el.endDate)}` : `closes ${fmtDate(el.endDate)}`}
                  </p>
                </div>
                {el.status === "active" && (
                  <Btn size="sm" variant="outline" onClick={() => closeElection(el)}>
                    {isBn ? "ফলাফল সত্যায়ন ও সমাপ্ত" : "Certify & close"}
                  </Btn>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      <Modal open={!!openEl} onClose={() => setOpenEl(null)} title={openEl?.title || ""} width="max-w-lg">
        {openEl && (openEl.status === "nomination"
          ? <NominationView election={openEl} session={session} db={db} persist={persist} toast={toast} logActivity={logActivity} lang={lang} isBn={isBn} />
          : <div><AdminElectionResults election={openEl} db={db} lang={lang} isBn={isBn} /><ElectionOversight election={openEl} db={db} lang={lang} isBn={isBn} /></div>)}
      </Modal>
      <Modal open={form} onClose={() => setForm(false)} title={isBn ? "নতুন নির্বাচন আয়োজন" : "Create election"} width="max-w-lg">
        <ElectionForm onSubmit={createElection} lang={lang} isBn={isBn} />
      </Modal>
    </div>
  );
}

export function AdminElectionResults({ election, db, lang = "en", isBn = false }) {
  // Bolt Optimization: Calculate per-position vote totals and candidate breakdown in a single pass memo
  const resultsByPosition = useMemo(() => {
    const votes = db.votes || [];
    const electionVotes = votes.filter(v => v.electionId === election?.id);

    return (election?.positions || []).map(pos => {
      const posVotes = electionVotes.filter(v => v.position === pos);
      const total = posVotes.length || 1;
      const cands = (election.candidates || []).filter(c => c.position === pos);

      const candCounts = {};
      for (const v of posVotes) {
        if (v.candidateId) candCounts[v.candidateId] = (candCounts[v.candidateId] || 0) + 1;
      }

      const candList = cands.map(c => {
        const count = candCounts[c.id] || 0;
        const pct = Math.round((count / total) * 100);
        return { ...c, count, pct };
      });

      return {
        pos,
        totalVotes: posVotes.length,
        candidates: candList
      };
    });
  }, [election, db.votes]);

  return (
    <div className="flex flex-col gap-5">
      {resultsByPosition.map(({ pos, totalVotes, candidates }) => (
        <div key={pos}>
          <h4 className="font-bold text-sm mb-2">
            {pos} <span className="font-normal text-xs" style={{ color: C.outline }}>({totalVotes} {isBn ? "ভোট" : "votes"})</span>
          </h4>
          {candidates.map(c => (
            <div key={c.id} className="mb-2">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>{c.name}</span>
                <span>{c.count} ({c.pct}%)</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.surfaceContainerHigh }}>
                <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: C.primary }} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function ElectionForm({ onSubmit, lang = "en", isBn = false }) {
  const [title, setTitle] = useState("");
  const [positions, setPositions] = useState("General Secretary, Treasurer");
  const [candText, setCandText] = useState("");
  const [nominationMode, setNominationMode] = useState(false);

  return (
    <div>
      <Field label={isBn ? "নির্বাচনের শিরোনাম" : "Election title"}>
        <input
          style={inputStyle()}
          className={inputCls}
          placeholder={isBn ? "যেমন: কার্যনির্বাহী পরিষদ নির্বাচন ২০২৬" : "e.g. Executive Committee Election 2026"}
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </Field>
      <Field label={isBn ? "নির্বাচনি পদসমূহ (কমা দিয়ে আলাদা করুন)" : "Positions (comma separated)"}>
        <input style={inputStyle()} className={inputCls} value={positions} onChange={e => setPositions(e.target.value)} />
      </Field>
      <Field label="">
        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
          <input type="checkbox" checked={nominationMode} onChange={e => setNominationMode(e.target.checked)} />
          {isBn ? "সদস্যদের উন্মুক্ত আত্ম-মনোনয়ন প্রক্রিয়া চালু করুন" : "Open for member self-nomination instead of pre-set candidates"}
        </label>
      </Field>
      {!nominationMode && (
        <Field label={isBn ? "প্রার্থী তালিকা — প্রতি লাইনে: নাম | পদ | ব্লক | ইশতেহার" : "Candidates — one per line: Name | Position | Block | Manifesto"}>
          <textarea
            style={inputStyle()}
            className={inputCls}
            rows={5}
            value={candText}
            onChange={e => setCandText(e.target.value)}
            placeholder="Jane Doe | Treasurer | A | Improve reporting"
          />
        </Field>
      )}
      <Btn
        full
        onClick={() => {
          const posArr = positions.split(",").map(s => s.trim()).filter(Boolean);
          const cands = nominationMode ? [] : candText.split("\n").filter(Boolean).map(line => {
            const [name, position, block, manifesto] = line.split("|").map(s => (s || "").trim());
            return { id: uid("cand"), name, position, block, manifesto };
          });
          onSubmit(title, posArr, cands, nominationMode);
        }}
        disabled={!title.trim()}
      >
        {isBn ? "নির্বাচন তৈরি করুন" : "Create election"}
      </Btn>
    </div>
  );
}

