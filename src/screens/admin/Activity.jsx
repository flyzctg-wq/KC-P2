import React from "react";
import { ClipboardList } from "lucide-react";
import { Card, Empty, SectionTitle } from "../../components/primitives";
import { C } from "../../theme";
import { fmtDateTime } from "../../utils";

/* ============================== ADMIN: ACTIVITY LOG ============================== */
export default function AdminActivity({ db }) {
  const sorted = [...db.activity].sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <div>
      <SectionTitle>Activity log</SectionTitle>
      <Card className="p-2">
        {sorted.map((a, i) => (
          <div key={a.id} className="flex items-start gap-3 px-3 py-3" style={{ borderTop: i ? `1px solid ${C.outlineVariant}` : "none" }}>
            <div style={{ backgroundColor: C.surfaceContainer }} className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"><ClipboardList size={13} style={{ color: C.onSurfaceVariant }} /></div>
            <div className="min-w-0"><p className="text-sm"><span className="font-bold">{a.actor}</span> <span style={{ color: C.onSurfaceVariant }}>{a.action}</span></p><p className="text-[11px]" style={{ color: C.outline }}>{fmtDateTime(a.date)}</p></div>
          </div>
        ))}
        {sorted.length === 0 && <Empty icon={ClipboardList} title="No activity yet" />}
      </Card>
    </div>
  );
}
