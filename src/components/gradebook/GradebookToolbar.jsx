"use client";

import React from "react";
import STYLES from "../../styles/gradebookStyles.json";

export default function GradebookToolbar({
  gradebookFilter,
  setGradebookFilter,
  availableSections = [],
  viewMode,
  selectedCount,
  onClearSelection,
  onOpenPurgeModal,
  onBulkSoftDelete,
  onBulkHardDelete,
  printableSubmissions = [],
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 flex justify-between items-center flex-wrap gap-4">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="font-bold text-slate-600">Filter</span>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setGradebookFilter("All")}
            className={
              gradebookFilter === "All"
                ? STYLES.filterBtnActive
                : STYLES.filterBtnInactive
            }
          >
            All
          </button>
          {availableSections.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setGradebookFilter(sec)}
              className={
                gradebookFilter === sec
                  ? STYLES.filterBtnActive
                  : STYLES.filterBtnInactive
              }
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5 mr-2">
            <span className="text-xs font-bold text-red-700">
              {selectedCount} Selected
            </span>
            <button
              type="button"
              onClick={onClearSelection}
              className="text-xs text-slate-600 hover:text-slate-900 underline font-semibold cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onOpenPurgeModal}
              className="bg-red-600 text-white hover:bg-red-700 px-3 py-1 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Purge Selected
            </button>
          </div>
        )}

        {viewMode === "active" ? (
          <>
            <button
              type="button"
              onClick={() => onBulkSoftDelete && onBulkSoftDelete(printableSubmissions)}
              disabled={printableSubmissions.length === 0}
              className="px-4 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Hide visible records from UI (QR codes remain live)"
            >
              Hide Visible
            </button>
            <button
              type="button"
              onClick={() => onBulkHardDelete && onBulkHardDelete(printableSubmissions)}
              disabled={printableSubmissions.length === 0}
              className={`${STYLES.clearBtn} disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
              title="Permanently purge visible records from database"
            >
              Purge Visible
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onBulkHardDelete && onBulkHardDelete(printableSubmissions)}
            disabled={printableSubmissions.length === 0}
            className={`${STYLES.clearBtn} disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
            title="Permanently purge all hidden records from database"
          >
            Purge All Hidden
          </button>
        )}
      </div>
    </div>
  );
}
