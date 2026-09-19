"use client";

import React from "react";
import GradebookRow from "./gradebook/GradebookRow";

export default function GradebookTable({
  records = [],
  isLoading = false,
  onViewReport,
  onSoftDelete,
  onRestoreRecord,
  onHardDelete,
  viewMode = "active",
  selectedIds = new Set(),
  onToggleSelect,
}) {
  if (isLoading) {
    return (
      <div className="text-center py-20 text-2xl font-black text-slate-300 animate-pulse">
        Loading Gradebook...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-200 text-slate-600">
            <th className="p-5 font-bold uppercase tracking-wider text-sm">Name</th>
            <th className="p-5 font-bold uppercase tracking-wider text-sm">Section</th>
            <th className="p-5 font-bold uppercase tracking-wider text-sm">Activity</th>
            <th className="p-5 font-bold uppercase tracking-wider text-sm">Score</th>
            <th className="p-5 font-bold uppercase tracking-wider text-sm">Date</th>
            <th className="p-5 font-bold uppercase tracking-wider text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                className="p-10 text-center text-slate-400 font-bold text-lg"
              >
                {viewMode === "hidden"
                  ? "No hidden records found."
                  : "No results found."}
              </td>
            </tr>
          ) : (
            records.map((record, index) => (
              <GradebookRow
                key={record.id || `${record.section}-${index}`}
                record={record}
                index={index}
                isSelected={Boolean(record.id && selectedIds.has(record.id))}
                onToggleSelect={onToggleSelect}
                onViewReport={onViewReport}
                onSoftDelete={onSoftDelete}
                onRestoreRecord={onRestoreRecord}
                onHardDelete={onHardDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
