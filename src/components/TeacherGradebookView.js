import { useState } from "react";
import StudentReportPrintSheet from "./StudentReportPrintSheet";

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
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  // Filter the data based on the selected section (or show all)
  const filteredData = gradebookData.filter(
    (record) => gradebookFilter === "All" || record.section === gradebookFilter,
  );

  const handlePrintAll = () => {
    setIsPreparingPrint(true);
    // Give React time to render all QR codes and sheets before launching the print preview
    setTimeout(() => {
      window.print();
      setIsPreparingPrint(false);
    }, 600);
  };

  const currentOrigin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://math-mayan-app.vercel.app";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 w-full absolute top-0 left-0 z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 print:hidden gap-4">
          <h1 className="text-4xl font-black text-slate-800">Gradebook</h1>
          <div className="flex gap-4 w-full md:w-auto">
            <button
              onClick={handlePrintAll}
              disabled={isPreparingPrint || filteredData.length === 0}
              className="flex-1 md:flex-none bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPreparingPrint
                ? "Preparing PDF..."
                : `Print All (${filteredData.length})`}
            </button>
            <button
              onClick={onBack}
              className="flex-1 md:flex-none bg-slate-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-700 shadow-lg transition-all active:scale-95"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Filters & Bulk Actions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 print:hidden flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-bold text-slate-600">Filter by Section:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setGradebookFilter("All")}
                className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${
                  gradebookFilter === "All"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All
              </button>
              {availableSections.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setGradebookFilter(sec)}
                  className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${
                    gradebookFilter === sec
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onBulkDelete(filteredData)}
            className="bg-red-50 text-red-600 border border-red-100 font-bold py-2 px-6 rounded-lg hover:bg-red-100 transition-all active:scale-95 whitespace-nowrap"
          >
            Clear Visible Records
          </button>
        </div>

        {/* The Gradebook Table (Hidden during print) */}
        {isLoadingGradebook ? (
          <div className="text-center py-20 text-2xl font-black text-slate-300 animate-pulse print:hidden">
            Loading Gradebook...
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto print:hidden">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600">
                  <th className="p-5 font-bold uppercase tracking-wider text-sm">
                    Name
                  </th>
                  <th className="p-5 font-bold uppercase tracking-wider text-sm">
                    Section
                  </th>
                  <th className="p-5 font-bold uppercase tracking-wider text-sm">
                    Activity
                  </th>
                  <th className="p-5 font-bold uppercase tracking-wider text-sm">
                    Score
                  </th>
                  <th className="p-5 font-bold uppercase tracking-wider text-sm">
                    Date
                  </th>
                  <th className="p-5 font-bold uppercase tracking-wider text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-10 text-center text-slate-400 font-bold text-lg"
                    >
                      No results found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((record, index) => {
                    let safeScore = 0;
                    if (
                      typeof record.score === "number" &&
                      !isNaN(record.score)
                    ) {
                      safeScore = record.score;
                    } else if (
                      typeof record.score === "string" &&
                      !isNaN(parseFloat(record.score))
                    ) {
                      safeScore = parseFloat(record.score);
                    }

                    const displayDate = record.timestamp?.toDate
                      ? record.timestamp.toDate().toLocaleDateString()
                      : record.timestamp
                        ? new Date(record.timestamp).toLocaleDateString()
                        : "Unknown Date";

                    return (
                      <tr
                        key={record.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-5 font-bold text-slate-800 text-lg">
                          <span className="text-slate-400 font-medium mr-2">
                            {index + 1}.
                          </span>
                          {record.studentName}
                        </td>
                        <td className="p-5 text-slate-600 font-bold">
                          {record.section}
                        </td>
                        <td className="p-5 text-slate-600">
                          {record.activityType}
                        </td>
                        <td className="p-5">
                          <span
                            className={`font-black text-xl px-3 py-1 rounded-lg ${
                              safeScore >= 80
                                ? "bg-green-100 text-green-700"
                                : safeScore >= 70
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {safeScore}%
                          </span>
                        </td>
                        <td className="p-5 text-slate-500 font-medium">
                          {displayDate}
                        </td>
                        <td className="p-5 flex gap-2">
                          <button
                            onClick={() => onViewReport(record)}
                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-100 transition active:scale-95 text-sm border border-blue-100"
                          >
                            Report
                          </button>
                          <button
                            onClick={() => onDeleteRecord(record.id)}
                            className="bg-slate-50 text-red-500 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition active:scale-95 text-sm border border-slate-100"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* JIT Batch Print Engine: Mounts solely during print */}
        {isPreparingPrint && (
          <div id="batch-print-container" className="hidden print:block w-full">
            {filteredData.map((record) => (
              <StudentReportPrintSheet
                key={record.id}
                record={record}
                baseUrl={currentOrigin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
