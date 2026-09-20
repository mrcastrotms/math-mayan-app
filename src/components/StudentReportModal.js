// src/components/StudentReportModal.js
import React from "react";
import StudentReportMetaGrid from "./StudentReportMetaGrid";
import StudentReportQuestionsTable from "./StudentReportQuestionsTable";

export default function StudentReportModal({ report, onBack }) {
  if (!report) return null;

  // Normalize answers from either schema
  const resolvedAnswers = report.answers || report.studentAnswers || [];

  // Normalize demerits (could be number or array of objects)
  const isDemeritArray = Array.isArray(report.demerits);
  const demeritCount =
    typeof report.demerits === "number"
      ? report.demerits
      : isDemeritArray
        ? report.demerits.length
        : 0;

  return (
    <div className="min-h-screen bg-white font-sans p-8 md:p-12 w-full z-[999] fixed inset-0 overflow-y-auto text-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <button
            type="button"
            onClick={onBack}
            className="bg-slate-200 text-slate-700 px-6 py-2 rounded-xl font-bold hover:bg-slate-300 transition cursor-pointer"
          >
            ← Back to Gradebook
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-md cursor-pointer"
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
        {report.assignmentTitle && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-950">
            <p className="text-xs font-bold uppercase tracking-wide">Assigned classwork</p>
            <p className="text-lg font-bold">{report.assignmentTitle}</p>
            <p className="text-sm">{report.correctAnswers ?? "—"} of {report.totalQuestions ?? "—"} correct · {report.questionsAttempted ?? 0} answered</p>
            <p className="text-sm">Hints used: {report.hintsUsed ?? 0} / {report.maxHints ?? 4}</p>
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-slate-800">Demerits</h3>
          {isDemeritArray && report.demerits.length > 0 ? (
            <ul className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-2">
              {report.demerits.map((d, i) => (
                <li
                  key={i}
                  className="text-red-700 font-medium text-sm flex justify-between"
                >
                  <span>• {d.reason || "Classroom Rule Violation"}</span>
                  {d.timestamp && (
                    <span className="font-mono text-xs text-slate-400">
                      {new Date(d.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : demeritCount > 0 ? (
            <p className="text-red-700 font-medium bg-red-50 p-4 rounded-xl border border-red-200">
              {demeritCount} demerit{demeritCount > 1 ? "s" : ""} logged during
              this assessment.
            </p>
          ) : (
            <p className="text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-200">
              No behavior demerits logged for this assessment.
            </p>
          )}
        </div>

        <StudentReportQuestionsTable answers={resolvedAnswers} />
      </div>
    </div>
  );
}
