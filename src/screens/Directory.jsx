import React, { useState } from "react";
import { Search } from "lucide-react";
import { Card, Badge, inputCls, inputStyle, Avatar, Empty, SectionTitle } from "../components/primitives";
import { C, BLOCKS } from "../theme";

export default function Directory({ db, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [q, setQ] = useState(""); const [block, setBlock] = useState("All");
  const active = db.users.filter(u => u.status === "active");
  const filtered = active.filter(u =>
    (block === "All" || u.block === block) &&
    (u.name.toLowerCase().includes(q.toLowerCase()) || u.unit.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <div>
      <SectionTitle>{isBn ? "সদস্য ডিরেক্টরি" : "Member directory"}</SectionTitle>
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.outline }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={isBn ? "নাম বা ইউনিট দিয়ে অনুসন্ধান…" : "Search by name or unit…"} style={inputStyle()} className={inputCls + " pl-9"} />
        </div>
        <select value={block} onChange={e => setBlock(e.target.value)} style={inputStyle()} className={inputCls + " sm:w-40"}>
          <option value="All">{isBn ? "সকল ব্লক" : "All blocks"}</option>
          {BLOCKS.map(b => <option key={b} value={b}>{isBn ? `ব্লক ${b}` : `Block ${b}`}</option>)}
        </select>
      </div>
      <p className="text-xs mb-3" style={{ color: C.outline }}>{filtered.length} {isBn ? "জন সদস্য" : "residents"}</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(u => (
          <Card key={u.id} className="p-4 flex items-center gap-3">
            <Avatar name={u.name} photoUrl={u.photoUrl} size={44} />
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{u.name}</p>
              <p className="text-xs truncate" style={{ color: C.onSurfaceVariant }}>{isBn ? "ইউনিট" : "Unit"} {u.unit} · {u.memberClass}</p>
              {u.post && <Badge tone="success">{u.post}</Badge>}
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <div className="col-span-full"><Empty icon={Search} title={isBn ? "কোনো সদস্য পাওয়া যায়নি" : "No residents found"} subtitle={isBn ? "ভিন্ন নাম বা ব্লক দিয়ে চেষ্টা করুন।" : "Try a different name or block filter."} /></div>}
      </div>
    </div>
  );
}
