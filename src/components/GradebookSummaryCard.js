// src/components/GradebookSummaryCard.js
import React from "react";

export default function GradebookSummaryCard({ onOpenGradebook }) {
  return (
    <div className="bg-slate-800 p-8 rounded-2xl w-80 shadow-2xl border border-slate-700 flex flex-col justify-between items-center text-center">
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-4 text-green-400">Gradebook</h2>
        <p className="text-slate-400 mb-6 text-sm">
          View completed assessments and track student progress.
        </p>
      </div>
      <button
        type="button"
        onClick={onOpenGradebook}
        className="bg-green-600 text-white px-8 py-4 w-full rounded-xl text-xl font-bold hover:bg-green-700 transition shadow-lg active:scale-95"
      >
        Open Gradebook
      </button>
    </div>
  );
}
