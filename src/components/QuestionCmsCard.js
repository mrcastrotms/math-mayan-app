// src/components/QuestionCmsCard.js
import React from "react";

export default function QuestionCmsCard({
  onGenerateAI,
  isGenerating,
  onSyncCloud,
}) {
  return (
    <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-700 mb-8 flex justify-between items-center flex-wrap gap-4">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-indigo-400">
          Question Bank
        </h2>
        <p className="text-slate-400 text-sm">
          Generate adaptive problems with Gemini
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onGenerateAI}
          disabled={isGenerating}
          className="bg-purple-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg active:scale-95 whitespace-nowrap disabled:opacity-50"
        >
          {isGenerating ? "Generating" : "Generate"}
        </button>
        <button
          type="button"
          onClick={onSyncCloud}
          className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg active:scale-95 whitespace-nowrap"
        >
          Sync
        </button>
      </div>
    </div>
  );
}
