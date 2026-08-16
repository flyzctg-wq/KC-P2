import React, { useState } from "react";
import { Vote, Plus, Scale, CheckCircle2 } from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Empty, Modal, SectionTitle } from "../components/primitives";
import { C } from "../theme";
import { uid } from "../utils";

export default function Amendments({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [form, setForm] = useState(false);
  const isCouncil = !!session.standingCouncil;
  const isTopTier = session.role === "admin" && (session.post === "President" || session.post === "General Secretary");
  const list = [...(db.amendments || [])].sort((a, b) => (a.status === "voting" ? -1 : 1));

  const statusLabels = {
    proposed: isBn ? "প্রস্তাবিত" : "PROPOSED",
    voting: isBn ? "ভোট চলছে" : "VOTING",
    ratified: isBn ? "অনুমোদিত ও কার্যকর" : "RATIFIED",
    rejected: isBn ? "প্রত্যাখ্যাত" : "REJECTED",
  };

  const propose = (title, articleRef, currentText, proposedText) => {
    persist(d => logActivity({ ...d, amendments: [{ id: uid("amd"), title, articleRef, currentText, proposedText, proposerId: session.id, proposerName: session.name, status: "proposed", councilVotes: [] }, ...(d.amendments || [])] }, session.name, `Proposed amendment: ${title}`));
    toast(isBn ? "সংশোধনী প্রস্তাব জমা হয়েছে — স্থায়ী পরিষদের পর্যালোচনার অপেক্ষায়।" : "Amendment proposed — awaiting Standing Council review.");
    setForm(false);
  };
  const openVoting = (a) => persist(d => logActivity({ ...d, amendments: d.amendments.map(x => x.id === a.id ? { ...x, status: "voting" } : x) }, session.name, `Opened council vote: ${a.title}`));
  const castCouncilVote = (a, choice) => {
    persist(d => ({
      ...d, amendments: d.amendments.map(x => x.id !== a.id ? x : { ...x, councilVotes: [...x.councilVotes.filter(v => v.voterId !== session.id), { voterId: session.id, choice }] }),
    }));
    toast(isBn ? (choice === "for" ? "পক্ষে ভোট সংরক্ষিত হয়েছে।" : "বিপক্ষে ভোট সংরক্ষিত হয়েছে।") : `Vote cast ${choice}.`);
  };
  const ratify = (a, status) => {
    persist(d => logActivity({ ...d, amendments: d.amendments.map(x => x.id === a.id ? { ...x, status } : x) }, session.name, `${status === "ratified" ? "Ratified" : "Rejected"} amendment: ${a.title}`));
    toast(isBn ? (status === "ratified" ? "সংশোধনী চূড়ান্তভাবে অনুমোদিত হয়েছে।" : "সংশোধনী প্রত্যাখ্যাত হয়েছে।") : `Amendment ${status}.`);
  };

  return (
    <div>
      <SectionTitle
        action={
          <Btn size="sm" icon={Plus} onClick={() => setForm(true)}>
            {isBn ? "+ সংশোধনী প্রস্তাব করুন" : "+ Propose amendment"}
          </Btn>
        }
      >
        {isBn ? "সংবিধান সংশোধনী প্রস্তাব ও স্থায়ী পরিষদ ভোট" : "Constitutional amendments"}
      </SectionTitle>
      {isCouncil && (
        <div className="mb-4 p-3 rounded-xl text-xs flex items-center gap-2" style={{ backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer }}>
          <Scale size={14} /> {isBn ? "আপনি স্থায়ী পরিষদের সদস্য — পর্যালোচনার জন্য উন্মুক্ত সংশোধনীতে ভোট দিতে পারেন।" : "You're a Standing Council member — you can vote on amendments open for review."}
        </div>
      )}
      <div className="flex flex-col gap-3">
        {list.map(a => {
          const forVotes = a.councilVotes.filter(v => v.choice === "for").length;
          const againstVotes = a.councilVotes.filter(v => v.choice === "against").length;
          const myVote = a.councilVotes.find(v => v.voterId === session.id)?.choice;
          return (
            <Card key={a.id} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge tone={a.status === "ratified" ? "success" : a.status === "rejected" ? "danger" : a.status === "voting" ? "info" : "neutral"}>
                  {statusLabels[a.status] || a.status}
                </Badge>
                <span className="text-[11px] font-semibold" style={{ color: C.outline }}>
                  {a.articleRef}
                </span>
              </div>
              <h3 className="font-bold text-sm mb-2">{a.title}</h3>
              <div className="grid sm:grid-cols-2 gap-2 mb-2">
                <div className="p-2.5 rounded-lg text-xs" style={{ backgroundColor: C.errorContainer, color: C.onErrorContainer }}>
                  <span className="font-bold block mb-0.5">{isBn ? "বর্তমান ধারা টেক্সট" : "Current"}</span>
                  {a.currentText}
                </div>
                <div className="p-2.5 rounded-lg text-xs" style={{ backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer }}>
                  <span className="font-bold block mb-0.5">{isBn ? "প্রস্তাবিত নতুন টেক্সট" : "Proposed"}</span>
                  {a.proposedText}
                </div>
              </div>
              <p className="text-[11px] mb-2" style={{ color: C.outline }}>
                {isBn ? `প্রস্তাবক: ${a.proposerName}` : `Proposed by ${a.proposerName}`}
              </p>

              {a.status === "proposed" && isTopTier && (
                <Btn size="sm" variant="outline" onClick={() => openVoting(a)}>
                  {isBn ? "স্থায়ী পরিষদ ভোটের জন্য উন্মুক্ত করুন" : "Open for council vote"}
                </Btn>
              )}
              {a.status === "voting" && (
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: C.onSurfaceVariant }}>
                    {forVotes} {isBn ? "পক্ষে" : "for"} · {againstVotes} {isBn ? "বিপক্ষে" : "against"}
                  </p>
                  {isCouncil && (
                    <div className="flex gap-2 mb-2">
                      <Btn size="sm" variant={myVote === "for" ? "primary" : "outline"} onClick={() => castCouncilVote(a, "for")}>
                        {isBn ? "পক্ষে ভোট দিন" : "Vote for"}
                      </Btn>
                      <Btn size="sm" variant={myVote === "against" ? "danger" : "outline"} onClick={() => castCouncilVote(a, "against")}>
                        {isBn ? "বিপক্ষে ভোট দিন" : "Vote against"}
                      </Btn>
                    </div>
                  )}
                  {isTopTier && (
                    <div className="flex gap-2 mt-2">
                      <Btn size="sm" onClick={() => ratify(a, "ratified")}>
                        {isBn ? "চূড়ান্ত অনুমোদন (Ratify)" : "Ratify"}
                      </Btn>
                      <Btn size="sm" variant="outline" onClick={() => ratify(a, "rejected")}>
                        {isBn ? "প্রত্যাখ্যান" : "Reject"}
                      </Btn>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
        {list.length === 0 && (
          <Empty
            icon={Scale}
            title={isBn ? "কোনো সংশোধনী প্রস্তাব নেই" : "No amendments proposed"}
            subtitle={isBn ? "সংবিধানের কোনো ধারা পরিবর্তনের প্রস্তাব করতে উপরের বোতামটি ব্যবহার করুন।" : "Use the button above to propose an amendment."}
          />
        )}
      </div>
      <Modal open={form} onClose={() => setForm(false)} title={isBn ? "সংবিধান সংশোধনী প্রস্তাব জমা" : "Propose an amendment"}>
        <AmendmentForm onSubmit={propose} isBn={isBn} />
      </Modal>
    </div>
  );
}

export function AmendmentForm({ onSubmit, isBn = false }) {
  const [title, setTitle] = useState("");
  const [articleRef, setArticleRef] = useState("");
  const [currentText, setCurrentText] = useState("");
  const [proposedText, setProposedText] = useState("");
  return (
    <div className="space-y-4">
      <Field label={isBn ? "সংশোধনীর বিষয় / শিরোনাম" : "Title"}>
        <input style={inputStyle()} className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder={isBn ? "উদাঃ সাধারণ সভার কোরাম স্পষ্টীকরণ" : "e.g. Clarify AGM quorum"} />
      </Field>
      <Field label={isBn ? "ধারা রেফারেন্স" : "Article reference"}>
        <input style={inputStyle()} className={inputCls} value={articleRef} onChange={e => setArticleRef(e.target.value)} placeholder={isBn ? "উদাঃ ধারা ১৯ অথবা ধারা ২১" : "e.g. Article 19"} />
      </Field>
      <Field label={isBn ? "বর্তমান টেক্সট" : "Current text"}>
        <textarea style={inputStyle()} className={inputCls} rows={2} value={currentText} onChange={e => setCurrentText(e.target.value)} placeholder={isBn ? "সংবিধানের বর্তমান টেক্সট লিখুন…" : "Current constitutional wording…"} />
      </Field>
      <Field label={isBn ? "প্রস্তাবিত নতুন টেক্সট" : "Proposed text"}>
        <textarea style={inputStyle()} className={inputCls} rows={2} value={proposedText} onChange={e => setProposedText(e.target.value)} placeholder={isBn ? "সংশোধিত নতুন টেক্সট লিখুন…" : "Proposed new wording…"} />
      </Field>
      <Btn full disabled={!title.trim() || !proposedText.trim()} onClick={() => onSubmit(title, articleRef, currentText, proposedText)}>
        {isBn ? "প্রস্তাব জমা দিন" : "Submit proposal"}
      </Btn>
    </div>
  );
}

