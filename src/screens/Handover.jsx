import React, { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Btn, Card, inputCls, inputStyle, SectionTitle } from "../components/primitives";
import { C } from "../theme";
import { uid, nowISO, fmtDate } from "../utils";

export default function Handover({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [text, setText] = useState("");
  const [category, setCategory] = useState("Operations");
  const canManage = session.role === "admin" && (session.permissions?.canManageMembers || session.post === "President");
  const list = db.handoverChecklist || [];
  const done = list.filter(i => i.done).length;
  const pct = list.length ? Math.round((done / list.length) * 100) : 0;

  const categoryLabels = {
    Financial: isBn ? "আর্থিক ও ব্যাংক হস্তান্তর" : "Financial",
    Operations: isBn ? "প্রশাসনিক ও পরিচালনগত হস্তান্তর" : "Operations",
    Ceremonial: isBn ? "আনুষ্ঠানিক ও প্রতীকী হস্তান্তর" : "Ceremonial",
  };

  const toggle = (item) => persist(d => logActivity({
    ...d, handoverChecklist: d.handoverChecklist.map(x => x.id === item.id ? { ...x, done: !x.done, doneBy: !x.done ? session.name : null, doneDate: !x.done ? nowISO() : null } : x),
  }, session.name, `${!item.done ? "Completed" : "Reopened"} handover item: ${item.item}`));

  const add = () => {
    if (!text.trim()) return;
    persist(d => ({ ...d, handoverChecklist: [...(d.handoverChecklist || []), { id: uid("ho"), item: text, category, done: false, doneBy: null, doneDate: null }] }));
    toast(isBn ? "চেকলিস্ট আইটেম যুক্ত হয়েছে।" : "Handover item added.");
    setText("");
  };

  const categories = [...new Set(list.map(i => i.category))];

  return (
    <div>
      <SectionTitle>{isBn ? "দায়িত্ব ও ক্ষমতা হস্তান্তর চেকলিস্ট" : "Committee handover"}</SectionTitle>
      <Card className="p-5 mb-6" style={{ backgroundColor: C.primaryContainer }}>
        <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>
          {isBn ? "হস্তান্তর অগ্রগতি (সম্পন্ন/মোট)" : "Handover progress"}
        </p>
        <p className="text-3xl font-extrabold text-white heading mt-1 mb-2">{pct}%</p>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.25)" }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "#fff" }} />
        </div>
      </Card>
      {categories.map(cat => (
        <div key={cat} className="mb-5">
          <h3 className="font-bold text-sm mb-2.5" style={{ color: C.onSurfaceVariant }}>
            {categoryLabels[cat] || cat}
          </h3>
          <div className="flex flex-col gap-2">
            {list.filter(i => i.category === cat).map(item => (
              <Card key={item.id} className="p-3.5 flex items-center gap-3 cursor-pointer" onClick={() => canManage && toggle(item)}>
                <div style={{ backgroundColor: item.done ? C.primary : C.surfaceContainerHigh }} className="w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                  {item.done && <Check size={14} color="#fff" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${item.done ? "line-through" : ""}`} style={{ color: item.done ? C.outline : C.onSurface }}>
                    {item.item}
                  </p>
                  {item.done && (
                    <p className="text-[11px]" style={{ color: C.outline }}>
                      {item.doneBy} · {fmtDate(item.doneDate)}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
      {canManage && (
        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t" style={{ borderColor: C.outlineVariant }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={isBn ? "নতুন হস্তান্তর চেকলিস্ট আইটেম…" : "New checklist item…"}
            style={inputStyle()}
            className={inputCls + " flex-1"}
          />
          <select style={inputStyle()} className={inputCls + " sm:w-44"} value={category} onChange={e => setCategory(e.target.value)}>
            {["Operations", "Financial", "Ceremonial"].map(c => (
              <option key={c} value={c}>{categoryLabels[c] || c}</option>
            ))}
          </select>
          <Btn size="sm" icon={Plus} onClick={add}>
            {isBn ? "যুক্ত করুন" : "Add"}
          </Btn>
        </div>
      )}
    </div>
  );
}

