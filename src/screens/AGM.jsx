import React, { useState } from "react";
import { Plus, ChevronRight, Calendar, CalendarCheck } from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Empty, Modal, SectionTitle } from "../components/primitives";
import { C } from "../theme";
import { uid, fmtDate } from "../utils";

export default function AGM({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [form, setForm] = useState(false);
  const [openEvent, setOpenEvent] = useState(null);
  const isTopTier = session.role === "admin" && (session.post === "President" || session.post === "General Secretary");
  const sorted = [...(db.agmEvents || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  const createEvent = (title, date, agendaText) => {
    const agenda = agendaText.split("\n").filter(Boolean);
    persist(d => logActivity({ ...d, agmEvents: [{ id: uid("agm"), title, date, status: "upcoming", agenda, resolutions: [], minutes: "", attendees: [] }, ...(d.agmEvents || [])] }, session.name, `Scheduled AGM: ${title}`));
    toast(isBn ? "বার্ষিক সাধারণ সভা নির্ধারিত হয়েছে।" : "AGM scheduled.");
    setForm(false);
  };

  return (
    <div>
      <SectionTitle
        action={
          isTopTier && (
            <Btn size="sm" icon={Plus} onClick={() => setForm(true)}>
              {isBn ? "+ এজিএম নির্ধারণ করুন" : "+ Schedule AGM"}
            </Btn>
          )
        }
      >
        {isBn ? "বার্ষিক সাধারণ সভা (এজিএম - ধারা ১৯)" : "Annual General Meetings (AGM)"}
      </SectionTitle>
      <div className="flex flex-col gap-3">
        {sorted.map(ev => (
          <Card key={ev.id} className="p-4 cursor-pointer hover:border-primary transition-all" onClick={() => setOpenEvent(ev)}>
            <div className="flex items-start justify-between">
              <div>
                <Badge tone={ev.status === "upcoming" ? "info" : "success"}>
                  {ev.status === "upcoming" ? (isBn ? "আসন্ন সভা" : "Upcoming") : (isBn ? "সম্পন্ন" : "Completed")}
                </Badge>
                <h3 className="font-bold text-sm mt-2">{ev.title}</h3>
                <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: C.onSurfaceVariant }}>
                  <Calendar size={12} /> {fmtDate(ev.date)} · {ev.attendees.length} {isBn ? "জন অংশগ্রহণকারী" : "attending"}
                </p>
              </div>
              <ChevronRight size={18} style={{ color: C.outline }} />
            </div>
          </Card>
        ))}
        {sorted.length === 0 && (
          <Empty
            icon={CalendarCheck}
            title={isBn ? "কোনো এজিএম নির্ধারিত নেই" : "No AGM scheduled"}
            subtitle={isBn ? "নতুন বার্ষিক সাধারণ সভা নির্ধারণ করতে উপরের বোতামটি ব্যবহার করুন।" : "Use the button above to schedule an AGM."}
          />
        )}
      </div>
      <Modal open={!!openEvent} onClose={() => setOpenEvent(null)} title={openEvent?.title || ""} width="max-w-lg">
        {openEvent && <AGMDetail event={openEvent} session={session} db={db} persist={persist} toast={toast} logActivity={logActivity} isTopTier={isTopTier} isBn={isBn} />}
      </Modal>
      <Modal open={form} onClose={() => setForm(false)} title={isBn ? "নতুন বার্ষিক সাধারণ সভা নির্ধারণ" : "Schedule AGM"}>
        <AGMForm onSubmit={createEvent} isBn={isBn} />
      </Modal>
    </div>
  );
}

export function AGMForm({ onSubmit, isBn = false }) {
  const [title, setTitle] = useState(isBn ? "বার্ষিক সাধারণ সভা" : "Annual General Meeting");
  const [date, setDate] = useState("");
  const [agenda, setAgenda] = useState("");
  return (
    <div className="space-y-4">
      <Field label={isBn ? "সভার শিরোনাম" : "Title"}>
        <input style={inputStyle()} className={inputCls} value={title} onChange={e => setTitle(e.target.value)} />
      </Field>
      <Field label={isBn ? "তারিখ" : "Date"}>
        <input type="date" style={inputStyle()} className={inputCls} value={date} onChange={e => setDate(e.target.value)} />
      </Field>
      <Field label={isBn ? "এজেন্ডা / আলোচ্যসূচি (প্রতি লাইনে একটি)" : "Agenda (one item per line)"}>
        <textarea style={inputStyle()} className={inputCls} rows={4} value={agenda} onChange={e => setAgenda(e.target.value)} placeholder={isBn ? "১. বিগত সভার কার্যবিবরণী অনুমোদন\n২. বার্ষিক বাজেট অনুমোদন..." : "1. Minutes approval\n2. Annual budget..."} />
      </Field>
      <Btn full disabled={!title.trim() || !date} onClick={() => onSubmit(title, new Date(date).toISOString(), agenda)}>
        {isBn ? "নির্ধারণ করুন" : "Schedule"}
      </Btn>
    </div>
  );
}

export function AGMDetail({ event, session, db, persist, toast, logActivity, isTopTier, isBn = false }) {
  const attending = event.attendees.includes(session.id);
  const rsvp = () => {
    persist(d => ({ ...d, agmEvents: d.agmEvents.map(e => e.id === event.id ? { ...e, attendees: attending ? e.attendees.filter(x => x !== session.id) : [...e.attendees, session.id] } : e) }));
    toast(isBn ? (attending ? "উপস্থিতি বাতিল করা হয়েছে।" : "উপস্থিতি নিশ্চিত করা হয়েছে।") : (attending ? "RSVP cancelled." : "RSVP confirmed."));
  };

  const myProxy = (event.proxies || []).find(p => p.granterId === session.id);
  const proxiedToMe = (event.proxies || []).filter(p => p.granteeId === session.id).map(p => p.granterId);
  const otherAttendees = db.users.filter(u => event.attendees.includes(u.id) && u.id !== session.id);
  const setProxy = (granteeId) => {
    persist(d => logActivity({
      ...d, agmEvents: d.agmEvents.map(e => e.id !== event.id ? e : { ...e, proxies: [...(e.proxies || []).filter(p => p.granterId !== session.id), ...(granteeId ? [{ granterId: session.id, granteeId }] : [])] }),
    }, session.name, granteeId ? `Assigned AGM proxy for ${event.title}` : `Cleared AGM proxy for ${event.title}`));
    toast(isBn ? (granteeId ? "প্রতিনিধি (Proxy) নির্ধারিত হয়েছে।" : "প্রতিনিধি বাতিল করা হয়েছে।") : (granteeId ? "Proxy assigned." : "Proxy cleared."));
  };

  const voteRes = (resId, side) => {
    const voterIds = [session.id, ...proxiedToMe];
    persist(d => ({
      ...d, agmEvents: d.agmEvents.map(e => e.id !== event.id ? e : {
        ...e, resolutions: e.resolutions.map(r => r.id !== resId ? r : {
          ...r,
          votesFor: side === "for" ? [...new Set([...r.votesFor.filter(x => !voterIds.includes(x)), ...voterIds])] : r.votesFor.filter(x => !voterIds.includes(x)),
          votesAgainst: side === "against" ? [...new Set([...r.votesAgainst.filter(x => !voterIds.includes(x)), ...voterIds])] : r.votesAgainst.filter(x => !voterIds.includes(x)),
        }),
      }),
    }));
  };
  const complete = (minutes) => {
    persist(d => logActivity({ ...d, agmEvents: d.agmEvents.map(e => e.id === event.id ? { ...e, status: "completed", minutes } : e) }, session.name, `Recorded minutes for ${event.title}`));
    toast(isBn ? "কার্যবিবরণী সংরক্ষিত ও সভা সমাপ্ত করা হয়েছে।" : "Minutes recorded and AGM marked completed.");
  };
  const [minutesDraft, setMinutesDraft] = useState(event.minutes);

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold" style={{ color: C.onSurfaceVariant }}>{fmtDate(event.date)}</p>
      
      <div>
        <h4 className="font-bold text-xs mb-2" style={{ color: C.onSurfaceVariant }}>
          {isBn ? "আলোচ্যসূচি (AGENDA)" : "AGENDA"}
        </h4>
        <ul className="text-sm list-disc pl-4 space-y-1" style={{ color: C.onSurface }}>
          {event.agenda.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </div>

      {event.status === "upcoming" && (
        <Btn size="sm" variant={attending ? "secondary" : "primary"} onClick={rsvp}>
          {attending ? (isBn ? "✓ আপনি উপস্থিত থাকবেন" : "✓ You're attending") : (isBn ? "উপস্থিতি নিশ্চিত করুন (RSVP)" : "RSVP to attend")}
        </Btn>
      )}

      {event.status === "upcoming" && attending && (
        <div className="p-3.5 rounded-xl border" style={{ borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow }}>
          <h4 className="font-bold text-xs mb-1" style={{ color: C.onSurfaceVariant }}>
            {isBn ? "প্রতিনিধি ভোট (PROXY VOTING)" : "PROXY VOTING"}
          </h4>
          <p className="text-xs mb-2" style={{ color: C.onSurfaceVariant }}>
            {isBn ? "ব্যক্তিগতভাবে উপস্থিত হতে না পারলে আপনার পক্ষে ভোটদানের জন্য অন্য উপস্থিত সদস্যকে মনোনীত করুন।" : "Can't attend in person? Assign another attending member to vote on your behalf."}
          </p>
          <select style={inputStyle()} className={inputCls} value={myProxy?.granteeId || ""} onChange={e => setProxy(e.target.value || null)}>
            <option value="">{isBn ? "কোনো প্রক্সি নির্ধারিত নেই" : "No proxy assigned"}</option>
            {otherAttendees.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          {proxiedToMe.length > 0 && (
            <p className="text-[11px] mt-2 font-semibold" style={{ color: C.primary }}>
              {isBn ? `আপনি ${proxiedToMe.length} জন সদস্যের পক্ষে প্রক্সি ভোট প্রদান করছেন।` : `You're voting on behalf of ${proxiedToMe.length} member(s) who named you proxy.`}
            </p>
          )}
        </div>
      )}

      {event.resolutions.length > 0 && (
        <div>
          <h4 className="font-bold text-xs mb-2" style={{ color: C.onSurfaceVariant }}>
            {isBn ? "প্রস্তাব ও সিদ্ধান্তসমূহ (RESOLUTIONS)" : "RESOLUTIONS"}
          </h4>
          {event.resolutions.map(r => {
            const total = r.votesFor.length + r.votesAgainst.length || 1;
            const pctFor = Math.round((r.votesFor.length / total) * 100);
            const votedFor = r.votesFor.includes(session.id);
            const votedAgainst = r.votesAgainst.includes(session.id);
            return (
              <div key={r.id} className="p-3 rounded-xl mb-2 border" style={{ borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow }}>
                <p className="font-bold text-sm">{r.title}</p>
                <p className="text-xs mt-0.5 mb-2" style={{ color: C.onSurfaceVariant }}>{r.description}</p>
                <div className="h-2 rounded-full overflow-hidden mb-1.5" style={{ backgroundColor: C.surfaceContainerHigh }}>
                  <div className="h-full" style={{ width: `${pctFor}%`, backgroundColor: C.primary }} />
                </div>
                <p className="text-[11px] font-semibold mb-2" style={{ color: C.outline }}>
                  {r.votesFor.length} {isBn ? "পক্ষে" : "for"} · {r.votesAgainst.length} {isBn ? "বিপক্ষে" : "against"}
                </p>
                {event.status === "upcoming" && (
                  <div className="flex gap-2">
                    <Btn size="sm" variant={votedFor ? "primary" : "outline"} onClick={() => voteRes(r.id, "for")}>{isBn ? "পক্ষে" : "For"}</Btn>
                    <Btn size="sm" variant={votedAgainst ? "danger" : "outline"} onClick={() => voteRes(r.id, "against")}>{isBn ? "বিপক্ষে" : "Against"}</Btn>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {event.status === "completed" ? (
        <div>
          <h4 className="font-bold text-xs mb-2" style={{ color: C.onSurfaceVariant }}>
            {isBn ? "কার্যবিবরণী (MINUTES)" : "MINUTES"}
          </h4>
          <p className="text-sm p-3 rounded-xl whitespace-pre-wrap border" style={{ borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow }}>
            {event.minutes || (isBn ? "কোনো কার্যবিবরণী লিপিবদ্ধ নেই।" : "No minutes recorded.")}
          </p>
        </div>
      ) : isTopTier && (
        <div className="pt-3 border-t space-y-3" style={{ borderColor: C.outlineVariant }}>
          <Field label={isBn ? "কার্যবিবরণী লিপিবদ্ধ ও সভা সমাপ্তকরণ" : "Record minutes & close meeting"}>
            <textarea style={inputStyle()} className={inputCls} rows={3} value={minutesDraft} onChange={e => setMinutesDraft(e.target.value)} placeholder={isBn ? "সভার সিদ্ধান্ত ও কার্যবিবরণী লিখুন…" : "Meeting minutes & resolutions…"} />
          </Field>
          <Btn size="sm" onClick={() => complete(minutesDraft)} disabled={!minutesDraft.trim()}>
            {isBn ? "কার্যবিবরণী সংরক্ষণ ও সম্পন্ন করুন" : "Record minutes & complete"}
          </Btn>
        </div>
      )}
    </div>
  );
}

