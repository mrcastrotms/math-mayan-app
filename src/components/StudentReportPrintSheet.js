// src/components/StudentReportPrintSheet.js
import React from "react";
import ReportPrintFooter from "./ReportPrintFooter";

export default function StudentReportPrintSheet({ record, baseUrl }) {
  const reportUrl = `${baseUrl}/?report=${record.id}`;
  const answersList = record.answers || record.studentAnswers || [];
  const MAX_VISIBLE = 10;
  const visibleAnswers = answersList.slice(0, MAX_VISIBLE);
  const remaining = answersList.length - visibleAnswers.length;

  const displayDate = record.timestamp?.toDate
    ? record.timestamp.toDate().toLocaleDateString()
    : record.timestamp
      ? new Date(record.timestamp).toLocaleDateString()
      : "9/16/2026";

  return (
    <div className="report-page bg-white text-slate-900 p-8 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              EVALUATION REPORT
            </h1>
            <p className="text-sm font-semibold text-slate-600">
              Mathematics Department
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-slate-900">
              {record.score}%
            </span>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              {record.activityType || "Assessment"}
            </p>
          </div>
        </div>

        {/* Student Meta Details */}
        <div className="grid grid-cols-3 gap-2 bg-slate-100 p-3 rounded-lg text-xs font-semibold mb-6">
          <div>
            <span className="text-slate-500">Student:</span>{" "}
            <span className="font-bold text-slate-900">
              {record.studentName || record.name}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Section:</span>{" "}
            <span className="font-bold text-slate-900">{record.section}</span>
          </div>
          <div>
            <span className="text-slate-500">Date:</span>{" "}
            <span className="font-bold text-slate-900">{displayDate}</span>
          </div>
        </div>

        {/* Truncated Question Table */}
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Assessment Itemization
          </h2>
          <table className="w-full text-xs text-left border border-slate-200 border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2 w-8">#</th>
                <th className="p-2">Problem / Prompt</th>
                <th className="p-2 w-32">Student Answer</th>
                <th className="p-2 w-20 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {visibleAnswers.map((ans, idx) => {
                const rawPrompt =
                  typeof ans.question === "object" && ans.question !== null
                    ? ans.question.question ||
                      ans.question.instruction ||
                      ans.question.prompt
                    : ans.question || ans.questionText || `Question ${idx + 1}`;
                const prompt =
                  typeof rawPrompt === "object"
                    ? JSON.stringify(rawPrompt)
                    : String(rawPrompt ?? `Question ${idx + 1}`);

                const rawVal =
                  typeof ans.studentInput === "object" &&
                  ans.studentInput !== null
                    ? (ans.studentInput.value ??
                      JSON.stringify(ans.studentInput))
                    : (ans.studentInput ?? ans.userAnswer ?? "—");
                const studentVal = String(rawVal ?? "—");

                const isCorrect = Boolean(ans.isCorrect);

                return (
                  <tr
                    key={idx}
                    className={isCorrect ? "bg-white" : "bg-red-50/40"}
                  >
                    <td className="p-2 font-bold text-slate-600">{idx + 1}</td>
                    <td className="p-2 truncate max-w-sm font-sans">
                      {prompt}
                    </td>
                    <td className="p-2 font-mono font-bold text-slate-800">
                      {studentVal}
                    </td>
                    <td className="p-2 text-center font-bold">
                      {isCorrect ? (
                        <span className="text-green-700">CORRECT</span>
                      ) : (
                        <span className="text-red-700">INCORRECT</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {remaining > 0 && (
            <p className="text-[11px] italic text-slate-500 mt-2">
              * Showing first {MAX_VISIBLE} problems. Scan QR code below for
              complete itemized breakdown, full timing telemetry, and correction
              keys.
            </p>
          )}
        </div>
      </div>

      <ReportPrintFooter reportUrl={reportUrl} recordId={record.id} />
    </div>
  );
}
