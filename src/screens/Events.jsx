import React, { useState } from "react";
import { Plus, Calendar, MapPin, CalendarRange } from "lucide-react";
import { Btn, Card, Field, inputCls, inputStyle, Empty, Modal, SectionTitle } from "../components/primitives";
import { C } from "../theme";
import { uid, fmtDate } from "../utils";

export default function Events({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [form, setForm] = useState(false);
  const canManage = session.role === "admin" && (session.permissions?.canManageNotices || session.post === "President");
  const sorted = [...(db.events || [])].sort((a, b) => new Date(a.date) - new Date(b.date));

  const create = (title, description, date, location) => {
    persist(d => logActivity({ ...d, events: [...(d.events || []), { id: uid("ev"), title, description, date, location, rsvps: [] }] }, session.name, `Created event: ${title}`));
    toast(isBn ? "ইভেন্ট তৈরি সম্পন্ন হয়েছে।" : "Event created.");
    setForm(false);
  };
  const rsvp = (ev) => {
    const going = ev.rsvps.includes(session.id);
    persist(d => ({ ...d, events: d.events.map(e => e.id === ev.id ? { ...e, rsvps: going ? e.rsvps.filter(x => x !== session.id) : [...e.rsvps, session.id] } : e) }));
    toast(isBn ? (going ? "উপস্থিতি বাতিল করা হয়েছে।" : "উপস্থিতি নিশ্চিত করা হয়েছে।") : (going ? "RSVP cancelled." : "RSVP confirmed."));
  };

  return (
    <div>
      <SectionTitle
        action={
          canManage && (
            <Btn size="sm" icon={Plus} onClick={() => setForm(true)}>
              {isBn ? "+ নতুন ইভেন্ট" : "+ New event"}
            </Btn>
          )
        }
      >
        {isBn ? "কমিউনিটি ও সাংস্কৃতিক ইভেন্ট" : "Community events"}
      </SectionTitle>
      <div className="flex flex-col gap-3">
        {sorted.map(ev => {
          const going = ev.rsvps.includes(session.id);
          return (
            <Card key={ev.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-sm">{ev.title}</h3>
                  <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: C.onSurfaceVariant }}>
                    <Calendar size={12} /> {fmtDate(ev.date)} <MapPin size={12} className="ml-2" /> {ev.location}
                  </p>
                  <p className="text-xs mt-2" style={{ color: C.onSurfaceVariant }}>{ev.description}</p>
                  <p className="text-[11px] mt-2 font-semibold" style={{ color: C.outline }}>
                    {ev.rsvps.length} {isBn ? "জন অংশগ্রহণ করছেন" : "attending"}
                  </p>
                </div>
                <Btn size="sm" variant={going ? "secondary" : "outline"} onClick={() => rsvp(ev)}>
                  {going ? (isBn ? "✓ অংশগ্রহণ নিশ্চিত" : "✓ Going") : (isBn ? "উপস্থিতি (RSVP)" : "RSVP")}
                </Btn>
              </div>
            </Card>
          );
        })}
        {sorted.length === 0 && (
          <Empty
            icon={CalendarRange}
            title={isBn ? "কোনো আসন্ন ইভেন্ট নেই" : "No upcoming events"}
            subtitle={isBn ? "নতুন ক্রীড়া, সাংস্কৃতিক বা সমাজসেবামূলক ইভেন্ট তৈরি করতে উপরের বোতামটি ব্যবহার করুন।" : "Use the button above to schedule an event."}
          />
        )}
      </div>
      <Modal open={form} onClose={() => setForm(false)} title={isBn ? "নতুন ইভেন্ট তৈরি" : "Create event"}>
        <EventForm onSubmit={create} isBn={isBn} />
      </Modal>
    </div>
  );
}

export function EventForm({ onSubmit, isBn = false }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  return (
    <div className="space-y-4">
      <Field label={isBn ? "ইভেন্টের নাম" : "Title"}>
        <input style={inputStyle()} className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder={isBn ? "উদাঃ বাৎসরিক বনভোজন ও খেলাধুলা" : "e.g. Annual Picnic"} />
      </Field>
      <Field label={isBn ? "বিবরণ" : "Description"}>
        <textarea style={inputStyle()} className={inputCls} rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder={isBn ? "ইভেন্টের বিস্তারিত সময় ও বিবরণ…" : "Event details…"} />
      </Field>
      <Field label={isBn ? "তারিখ" : "Date"}>
        <input type="date" style={inputStyle()} className={inputCls} value={date} onChange={e => setDate(e.target.value)} />
      </Field>
      <Field label={isBn ? "স্থান" : "Location"}>
        <input style={inputStyle()} className={inputCls} value={location} onChange={e => setLocation(e.target.value)} placeholder={isBn ? "উদাঃ ক্লাব মাঠ / কমিউনিটি হল" : "e.g. Club grounds"} />
      </Field>
      <Btn full disabled={!title.trim() || !date} onClick={() => onSubmit(title, description, new Date(date).toISOString(), location)}>
        {isBn ? "ইভেন্ট প্রকাশ করুন" : "Create event"}
      </Btn>
    </div>
  );
}

