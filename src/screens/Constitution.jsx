import React, { useState, useMemo } from "react";
import { Search, BookOpen, Globe, ChevronDown, ChevronUp, FileText, CheckCircle2 } from "lucide-react";
import { Card, inputCls, inputStyle, Empty, SectionTitle, Badge, Btn } from "../components/primitives";
import { C } from "../theme";
import { CONSTITUTION_ARTICLES } from "../data/constitutionArticles";

export default function Constitution({ lang }) {
  const [q, setQ] = useState("");
  const [viewLang, setViewLang] = useState(lang || "bn"); // 'bn', 'en', 'both'
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (num) => {
    setExpanded(prev => ({ ...prev, [num]: !prev[num] }));
  };

  const expandAll = () => {
    const all = {};
    CONSTITUTION_ARTICLES.forEach(a => { all[a.num] = true; });
    setExpanded(all);
  };

  const collapseAll = () => {
    setExpanded({});
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return CONSTITUTION_ARTICLES;
    return CONSTITUTION_ARTICLES.filter(a => {
      const numMatch = String(a.num) === query || `ধারা ${a.num}`.includes(query) || `article ${a.num}`.toLowerCase().includes(query);
      const titleEnMatch = a.titleEn?.toLowerCase().includes(query);
      const titleBnMatch = a.titleBn?.toLowerCase().includes(query);
      const enMatch = a.en?.toLowerCase().includes(query);
      const bnMatch = a.bn?.toLowerCase().includes(query);
      return numMatch || titleEnMatch || titleBnMatch || enMatch || bnMatch;
    });
  }, [q]);

  const renderFormatted = (text) => {
    if (!text) return null;
    return (
      <div className="space-y-2 text-sm leading-relaxed whitespace-pre-line">
        {text.split("\n\n").map((para, pIdx) => {
          if (para.includes("|") && para.includes("---")) {
            // Simple markdown table parser
            const rows = para.split("\n").filter(r => r.trim().startsWith("|"));
            if (rows.length > 2) {
              const headers = rows[0].split("|").map(c => c.trim()).filter(Boolean);
              const dataRows = rows.slice(2).map(r => r.split("|").map(c => c.trim()).filter(Boolean));
              return (
                <div key={pIdx} className="overflow-x-auto my-3">
                  <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-700 rounded-lg">
                    <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                      <tr>{headers.map((h, i) => <th key={i} className="p-2 border-b">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {dataRows.map((r, ri) => (
                        <tr key={ri} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          {r.map((c, ci) => <td key={ci} className="p-2">{c}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
          }
          return <p key={pIdx} className="break-words">{para}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <SectionTitle>Club Constitution · গঠনতন্ত্র</SectionTitle>
          <p className="text-xs -mt-3" style={{ color: C.onSurfaceVariant }}>
            Ratified 32 Articles governing Kunjachhaya Club operations and leadership.
          </p>
        </div>

        {/* Language selector toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl shrink-0" style={{ backgroundColor: C.surfaceContainerHigh }}>
          {[
            { key: "bn", label: "বাংলা" },
            { key: "en", label: "English" },
            { key: "both", label: "উভয় (Both)" },
          ].map(m => (
            <button
              key={m.key}
              onClick={() => setViewLang(m.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={viewLang === m.key ? { backgroundColor: C.primary, color: "#fff" } : { color: C.onSurfaceVariant }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2 mb-5">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.outline }} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search article number, keyword, title in English or বাংলা…"
            style={inputStyle()}
            className={inputCls + " pl-10 pr-4 text-sm"}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={expandAll}
            className="px-3 py-2 text-xs font-semibold rounded-xl border"
            style={{ borderColor: C.outlineVariant, color: C.onSurfaceVariant }}
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-3 py-2 text-xs font-semibold rounded-xl border"
            style={{ borderColor: C.outlineVariant, color: C.onSurfaceVariant }}
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Articles List */}
      <div className="flex flex-col gap-3">
        {filtered.map(a => {
          const isOpen = expanded[a.num] ?? (filtered.length <= 4 || q.trim().length > 0);
          return (
            <Card key={a.num} className="p-4 transition-all duration-200">
              <div
                onClick={() => toggleExpand(a.num)}
                className="flex items-start justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{ backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-extrabold shadow-sm"
                  >
                    {a.num}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base leading-snug">
                      {viewLang === "bn" ? `ধারা- ${a.num}: ${a.titleBn}` : viewLang === "en" ? `Article ${a.num}: ${a.titleEn}` : `Article ${a.num}: ${a.titleEn} / ধারা- ${a.titleBn}`}
                    </h3>
                  </div>
                </div>
                <div className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  {isOpen ? <ChevronUp size={18} style={{ color: C.outline }} /> : <ChevronDown size={18} style={{ color: C.outline }} />}
                </div>
              </div>

              {isOpen && (
                <div className="mt-4 pt-3 border-t space-y-4" style={{ borderColor: C.outlineVariant }}>
                  {/* Bangla Text */}
                  {(viewLang === "bn" || viewLang === "both") && a.bn && (
                    <div className="p-3.5 rounded-xl" style={{ backgroundColor: C.surfaceContainerLow }}>
                      {viewLang === "both" && (
                        <div className="flex items-center gap-1.5 text-xs font-bold mb-2 text-emerald-700 dark:text-emerald-400">
                          <Globe size={13} /> বাংলা সংস্করণ:
                        </div>
                      )}
                      <div style={{ color: C.onSurface }}>{renderFormatted(a.bn)}</div>
                    </div>
                  )}

                  {/* English Text */}
                  {(viewLang === "en" || viewLang === "both") && a.en && (
                    <div className="p-3.5 rounded-xl" style={{ backgroundColor: C.surfaceContainerLow }}>
                      {viewLang === "both" && (
                        <div className="flex items-center gap-1.5 text-xs font-bold mb-2 text-blue-700 dark:text-blue-400">
                          <Globe size={13} /> English Version:
                        </div>
                      )}
                      <div style={{ color: C.onSurface }}>{renderFormatted(a.en)}</div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Empty
            icon={BookOpen}
            title="No matching constitution articles"
            description="Try searching with article numbers like '1', '14', '18' or terms like 'Election', 'Secretary', 'Dues'."
          />
        )}
      </div>

      <div className="mt-8 p-4 rounded-2xl text-center border" style={{ borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow }}>
        <p className="text-xs font-semibold" style={{ color: C.onSurface }}>
          Official Ratified Constitution of Kunjachhaya Club · চট্টগ্রাম
        </p>
        <p className="text-[11px] mt-1" style={{ color: C.onSurfaceVariant }}>
          Contains all 32 articles encompassing membership, executive governance, financial audits, election commission, and dissolution procedures.
        </p>
      </div>
    </div>
  );
}

