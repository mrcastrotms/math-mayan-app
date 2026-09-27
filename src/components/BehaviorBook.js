import React, { useMemo } from "react";
import { useBehaviorBook } from "../hooks/useBehaviorBook";

export default function BehaviorBook({ activeSection, onOpenHistory }) {
  const { records, dateKey, error } = useBehaviorBook();
  
  const sectionRecords = useMemo(() => {
    if (!activeSection) return [];
    
    // Filter to ONLY the active section
    const rawRecords = records.filter((item) => item.section === activeSection);
    
    // Deduplicate! Only show the most recent record per student
    const uniqueStudentsMap = rawRecords.reduce((acc, curr) => {
      // The hook already calculates net behaviorScore, we just want the latest one
      acc[curr.studentName || curr.uid] = curr;
      return acc;
    }, {});
    
    // Sort highest score first
    return Object.values(uniqueStudentsMap).sort((a, b) => String(a.studentName || a.uid || "").localeCompare(String(b.studentName || b.uid || "")));
  }, [activeSection, records]);

  if (!activeSection) return null;

  return (
    <section className="w-full max-w-4xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-[var(--app-fg)] shadow-xl" aria-labelledby="behavior-book-title">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 id="behavior-book-title" className="text-xl font-bold">Live Behavior: Section {activeSection}</h2>
          <p className="text-sm opacity-75">Relative daily score: 70–100. Highest net merits earns 100. Date: {dateKey}</p>
        </div>
        <button type="button" onClick={onOpenHistory} className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500">
          Open complete history
        </button>
      </div>

      {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
      
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {sectionRecords.map((record) => (
          <article key={record.id} className={`rounded-xl border border-[var(--app-border)] p-4 flex flex-col justify-between ${record.behaviorScore === 100 ? 'bg-blue-500/5 border-blue-500/30' : ''}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-bold text-sm leading-tight truncate" title={record.studentName || record.uid}>{record.studentName || record.uid}</h3>
              <span className={`text-xl font-black ${record.behaviorScore === 100 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>{record.behaviorScore}%</span>
            </div>
            <div className="flex gap-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">{record.merits} M</span>
              <span className="text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-1 rounded">{record.demerits} D</span>
            </div>
          </article>
        ))}
        {sectionRecords.length === 0 && <p className="text-sm opacity-75 col-span-full py-4 text-center">No behavior events recorded today for {activeSection}.</p>}
      </div>
    </section>
  );
}
