// src/components/StudentReportMetaGrid.js
import React from "react";

export default function StudentReportMetaGrid({ report }) {
  const formattedDate = report.timestamp
    ? new Date(report.timestamp.toDate()).toLocaleString()
    : "N/A";

  return (
    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
      <div>
        <span className="font-bold text-slate-500">Written Name:</span>{" "}
        <span className="text-xl font-bold">{report.studentName}</span>
      </div>
      <div>
        <span className="font-bold text-slate-500">Google Account Name:</span>{" "}
        <span className="text-slate-700">
          {report.googleAccountName || "N/A"}
        </span>
      </div>
      <div>
        <span className="font-bold text-slate-500">Section:</span>{" "}
        <span className="font-mono font-bold">{report.section}</span>
      </div>
      <div>
        <span className="font-bold text-slate-500">Final Score:</span>{" "}
        <span className="text-xl font-extrabold text-blue-600">
          {report.score}%
        </span>
      </div>
      <div>
        <span className="font-bold text-slate-500">Session Code:</span>{" "}
        <span className="font-mono">{report.sessionCode}</span>
      </div>
      <div>
        <span className="font-bold text-slate-500">Date:</span> {formattedDate}
      </div>
    </div>
  );
}
