"use client";

import React from "react";
import STYLES from "../../styles/gradebookStyles.json";

export default function GradebookHeader({
  viewMode,
  setViewMode,
  hiddenCount,
  printableCount,
  isPreparingPrint,
  onBatchPrint,
  onBack,
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className={STYLES.title}>Gradebook</h1>

        <div className="flex bg-slate-200 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode("active")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition cursor-pointer ${
              viewMode === "active"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setViewMode("hidden")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
              viewMode === "hidden"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span>Hidden</span>
            {hiddenCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-black">
                {hiddenCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-4 w-full md:w-auto">
        <button
          type="button"
          onClick={onBatchPrint}
          disabled={isPreparingPrint || printableCount === 0}
          className={`${STYLES.primaryBtn} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isPreparingPrint
            ? "Preparing PDF..."
            : `Print ${viewMode === "hidden" ? "Hidden" : ""} (${printableCount})`}
        </button>
        <button
          type="button"
          onClick={onBack}
          className={`${STYLES.darkBtn} cursor-pointer`}
        >
          Dashboard
        </button>
      </div>
    </div>
  );
}
