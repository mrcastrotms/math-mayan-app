import React from "react";
import { useBehaviorBook } from "../hooks/useBehaviorBook";

export default function BehaviorBook({ onOpenHistory }) {
  const { records, dateKey, error } = useBehaviorBook();
  return (
    <section className="w-full max-w-4xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-[var(--app-fg)] shadow-xl" aria-labelledby="behavior-book-title">
      <h2 id="behavior-book-title" className="text-xl font-bold">Behavior & Values Book</h2>
      <p className="mb-4 text-sm opacity-75">Relative daily score: 70–100. Highest net merits earns 100. Date: {dateKey}</p>
      <button type="button" onClick={onOpenHistory} className="mb-4 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500">Open complete values history</button>
      {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {records.map((record) => (
          <article key={record.id} className="rounded-xl border border-[var(--app-border)] p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold">{record.studentName || record.uid}</h3>
              <span className="text-2xl font-black text-blue-600">{record.behaviorScore}%</span>
            </div>
            <p className="text-sm opacity-75">Section {record.section} · {record.merits} merits · {record.demerits} demerits</p>
          </article>
        ))}
        {records.length === 0 && <p className="text-sm opacity-75">No behavior events recorded today.</p>}
      </div>
    </section>
  );
}
