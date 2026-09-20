// src/components/GradebookSummaryCard.js
import React from "react";

export default function GradebookSummaryCard({ onOpenGradebook }) {
  return (
    <section aria-labelledby="gradebook-summary-title" className="bg-[var(--app-surface)] text-[var(--app-fg)] p-8 rounded-2xl w-80 shadow-2xl border border-[var(--app-border)] flex flex-col justify-between items-center text-center">
      <div className="w-full">
        <h2 id="gradebook-summary-title" className="text-2xl font-bold mb-4 text-green-600">Gradebook</h2>
        <p className="opacity-75 mb-6 text-sm">Track student progress</p>
      </div>
      <button
        type="button"
        onClick={onOpenGradebook}
        className="bg-green-600 text-white px-8 py-4 w-full rounded-xl text-xl font-bold hover:bg-green-700 transition shadow-lg active:scale-95"
      >
        Open
      </button>
    </section>
  );
}
