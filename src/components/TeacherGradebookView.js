import React from "react";
import { QRCodeSVG } from "qrcode.react";

export default function TeacherGradebookView({
  gradebookData,
  gradebookFilter,
  setGradebookFilter,
  availableSections,
  isLoadingGradebook,
  onBack,
  onBulkDelete,
  onDeleteRecord,
  onViewReport,
}) {
  const filteredData = gradebookData.filter(
    (record) => gradebookFilter === "All" || record.section === gradebookFilter,
  );

  const handleDeleteAllVisible = () => {
    onBulkDelete(filteredData);
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 absolute top-0 left-0 z-50 overflow-y-auto">
      {/* =========================================================
          NORMAL DASHBOARD UI (HIDDEN WHEN CMD+P IS PRESSED)
          ========================================================= */}
      <div className="print:hidden flex flex-col p-8 text-white w-full max-w-6xl mx-auto">
        {/* Header section with Print Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-green-400">Gradebook</h1>
          <div className="flex gap-4">
            <button
              onClick={() => window.print()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg flex items-center gap-2 active:scale-95"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                ></path>
              </svg>
              Print All to PDF ({filteredData.length})
            </button>
            <button
              onClick={onBack}
              className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-xl font-bold transition active:scale-95"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <p className="text-slate-400 font-bold uppercase tracking-wider text-sm">
              Filter by Section:
            </p>
            {filteredData.length > 0 && (
              <button
                onClick={handleDeleteAllVisible}
                className="text-red-400 hover:text-red-300 text-sm font-bold underline transition"
              >
                Clear Visible Records
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setGradebookFilter("All")}
              className={`px-4 py-2 rounded-lg font-bold transition ${gradebookFilter === "All" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
            >
              All
            </button>
            {availableSections.map((sec) => (
              <button
                key={sec}
                onClick={() => setGradebookFilter(sec)}
                className={`px-4 py-2 rounded-lg font-bold transition ${gradebookFilter === sec ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        {isLoadingGradebook ? (
          <p className="text-center text-slate-400 text-xl font-bold py-12 animate-pulse">
            Loading...
          </p>
        ) : (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold border-b border-slate-700">
                      Name
                    </th>
                    <th className="p-4 font-bold border-b border-slate-700">
                      Section
                    </th>
                    <th className="p-4 font-bold border-b border-slate-700">
                      Activity Type
                    </th>
                    <th className="p-4 font-bold border-b border-slate-700">
                      Score
                    </th>
                    <th className="p-4 font-bold border-b border-slate-700">
                      Date
                    </th>
                    <th className="p-4 font-bold border-b border-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-8 text-center text-slate-500 font-bold"
                      >
                        No results found.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-slate-700/50 hover:bg-slate-750 transition"
                      >
                        <td className="p-4 font-bold text-white flex items-center gap-2">
                          {record.studentName}
                          {record.isTestRun && (
                            <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-1 rounded-md uppercase tracking-wider">
                              Test Run
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-slate-300">
                          {record.section}
                        </td>
                        <td className="p-4 text-slate-400">
                          {record.activityType}
                        </td>
                        <td className="p-4 font-black text-blue-400">
                          {record.score}%
                        </td>
                        <td className="p-4 text-slate-400 text-xs">
                          {record.timestamp?.toDate
                            ? record.timestamp.toDate().toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="p-4 flex gap-3">
                          <button
                            onClick={() => onViewReport(record)}
                            className="text-blue-400 hover:text-blue-300 font-bold transition"
                          >
                            Report
                          </button>
                          <button
                            onClick={() => onDeleteRecord(record.id)}
                            className="text-red-400 hover:text-red-300 font-bold transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================
          PRINT ONLY UI (PDF EXPORT W/ PAGE BREAKS & QR CODES)
          ========================================================= */}
      <div className="hidden print:block bg-white text-black min-h-screen">
        {filteredData.map((report) => (
          <div key={report.id} className="break-after-page w-full px-8 py-12">
            {/* Header / Student Info for the PDF */}
            <div className="border-4 border-slate-800 p-8 rounded-3xl mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-5xl font-black mb-4 text-slate-900 tracking-tight">
                  {report.studentName}
                </h1>
                <div className="flex gap-4 mb-4">
                  <span className="bg-slate-100 text-slate-800 px-4 py-2 rounded-lg font-bold border border-slate-300">
                    Section {report.section}
                  </span>
                  <span className="bg-slate-100 text-slate-800 px-4 py-2 rounded-lg font-bold border border-slate-300">
                    {report.activityType}
                  </span>
                  <span className="bg-slate-100 text-slate-800 px-4 py-2 rounded-lg font-bold border border-slate-300">
                    {report.timestamp?.toDate
                      ? report.timestamp.toDate().toLocaleDateString()
                      : "Date N/A"}
                  </span>
                </div>
                <div className="text-3xl font-black mt-6">
                  Final Score:{" "}
                  <span
                    className={
                      report.score >= 70 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {report.score}%
                  </span>
                </div>
              </div>

              {/* QR Code mapped strictly to this report's ID */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl">
                <QRCodeSVG
                  value={
                    typeof window !== "undefined"
                      ? `${window.location.origin}?report=${report.id}`
                      : `https://mrcastro.vercel.app?report=${report.id}`
                  }
                  size={140}
                />
                <span className="mt-3 text-xs font-bold text-slate-600 uppercase tracking-widest text-center w-32">
                  Scan to view full report online
                </span>
              </div>
            </div>

            {/* Complete Answers Breakdown */}
            <div className="grid grid-cols-1 gap-4">
              {report.answers &&
                report.answers.map((ans, i) => {
                  // Formatting logic inline for print
                  let formattedInput = ans.studentInput || "Skipped";
                  if (
                    ans.instruction &&
                    (ans.studentInput === "1" ||
                      ans.studentInput === "2" ||
                      ans.studentInput === "3" ||
                      ans.studentInput === "4")
                  ) {
                    const regex = new RegExp(
                      `${ans.studentInput}\\s*(?:for|\\)|\\-)\\s*([^\\.\\,\\;]+)`,
                      "i",
                    );
                    const match = ans.instruction.match(regex);
                    if (match && match[1])
                      formattedInput = `${ans.studentInput} (${match[1].trim()})`;
                  } else if (
                    ans.instruction &&
                    ans.instruction.includes("Yes")
                  ) {
                    formattedInput =
                      ans.studentInput === "1"
                        ? "1 (Yes)"
                        : ans.studentInput === "2"
                          ? "2 (No)"
                          : formattedInput;
                  }

                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border-2 ${ans.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-lg text-slate-800">
                          <span className="text-slate-500 mr-2">
                            Q{ans.questionNumber || i + 1}:
                          </span>{" "}
                          {ans.question}
                        </p>
                        <span
                          className={`text-2xl font-black ${ans.isCorrect ? "text-green-600" : "text-red-600"}`}
                        >
                          {ans.isCorrect ? "✓" : "✗"}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm mt-2">
                        <p className="font-bold text-slate-700">
                          Student Answer:{" "}
                          <span
                            className={
                              ans.isCorrect ? "text-green-700" : "text-red-700"
                            }
                          >
                            {formattedInput}
                          </span>
                        </p>
                        {!ans.isCorrect && (
                          <p className="font-bold text-slate-500">
                            Correct Answer:{" "}
                            <span className="text-slate-800">
                              {ans.correctAnswer}
                            </span>
                          </p>
                        )}
                        {ans.observation && (
                          <p className="text-slate-400 italic">
                            Note: {ans.observation}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Show Demerits if any were given */}
            {report.demerits > 0 && (
              <div className="mt-8 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="font-bold text-red-800">
                  Behavioral Demerits Issued: {report.demerits}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
