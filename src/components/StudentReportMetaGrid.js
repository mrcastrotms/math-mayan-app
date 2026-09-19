// src/components/StudentReportMetaGrid.js
import React from "react";

export default function StudentReportMetaGrid({ report }) {
  const formattedDate = report.timestamp?.toDate
    ? report.timestamp.toDate().toLocaleString()
    : report.timestamp
      ? new Date(report.timestamp).toLocaleString()
      : "N/A";

  const officialName = report.officialName || report.studentName || "—";
  const writtenName = report.rawTypedName || report.studentName || "—";

  return (
    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
      <div>
        <span className="font-bold text-slate-500 block text-xs uppercase tracking-wider mb-1">
          Official Student Name
        </span>
        <span className="text-xl font-black text-slate-900">
          {officialName}
        </span>
        {writtenName && writtenName !== officialName && (
          <span className="block text-xs font-medium text-slate-400 mt-0.5">
            Written on test:{" "}
            <span className="text-slate-600 font-semibold">
              &quot;{writtenName}&quot;
            </span>
          </span>
        )}
      </div>
      <div>
        <span className="font-bold text-slate-500 block text-xs uppercase tracking-wider mb-1">
          Google Account Name
        </span>
        <span className="text-slate-700 font-semibold">
          {report.googleAccountName || "N/A"}
        </span>
      </div>
      <div>
        <span className="font-bold text-slate-500 block text-xs uppercase tracking-wider mb-1">
          Section
        </span>
        <span className="font-mono font-bold text-slate-800">
          {report.section}
        </span>
      </div>
      <div>
        <span className="font-bold text-slate-500 block text-xs uppercase tracking-wider mb-1">
          Final Score
        </span>
        <span className="text-2xl font-black text-blue-600">
          {report.score != null ? `${report.score}%` : "—"}
        </span>
      </div>
      <div>
        <span className="font-bold text-slate-500 block text-xs uppercase tracking-wider mb-1">
          Session Code
        </span>
        <span className="font-mono font-bold text-slate-700">
          {report.sessionCode || "—"}
        </span>
      </div>
      <div>
        <span className="font-bold text-slate-500 block text-xs uppercase tracking-wider mb-1">
          Date & Time
        </span>
        <span className="text-slate-700 font-medium">{formattedDate}</span>
      </div>
    </div>
  );
}
