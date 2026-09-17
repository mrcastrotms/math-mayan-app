// src/components/StudentReportModal.js
import React from "react";
import StudentReportMetaGrid from "./StudentReportMetaGrid";
import StudentReportQuestionsTable from "./StudentReportQuestionsTable";

export default function StudentReportModal({ report, onBack }) {
  return (
    <div className="min-h-screen bg-white font-sans p-12 w-full z-50 absolute top-0 left-0 overflow-y-auto text-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <button
            type="button"
            onClick={onBack}
            className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-bold hover:bg-slate-300 transition"
          >
            ← Back to Gradebook
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
          >
            Print
          </button>
        </div>

        <div className="border-b-2 border-slate-800 pb-6 mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Student Report
          </h1>
          <p className="text-slate-600 font-medium">The Mayan School</p>
        </div>

        <StudentReportMetaGrid report={report} />

        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-slate-800">Demerits</h3>
          {report.demerits && report.demerits.length > 0 ? (
            <ul className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-2">
              {report.demerits.map((d, i) => (
                <li
                  key={i}
                  className="text-red-700 font-medium text-sm flex justify-between"
                >
                  <span>• {d.reason}</span>
                  <span className="font-mono text-xs text-slate-400">
                    {new Date(d.timestamp).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-200">
              No behavior demerits logged for this assessment.
            </p>
          )}
        </div>

        <StudentReportQuestionsTable answers={report.answers} />
      </div>
    </div>
  );
}
