import { useState } from "react";
// Make sure you have your QR code library imported if you use it for the print view!
// import { QRCodeSVG } from "qrcode.react";

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
    // Give React a split second to mount the heavy print components before triggering the browser print dialog
    setTimeout(() => {
      window.print();
      setIsPreparingPrint(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 w-full absolute top-0 left-0 z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <h1 className="text-4xl font-black text-slate-800">Gradebook</h1>
          <div className="flex gap-4">
            <button
              onClick={handlePrintAll}
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              Print All to PDF ({filteredData.length})
            </button>
            <button
              onClick={onBack}
              className="bg-slate-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-700 shadow-lg transition-all active:scale-95"
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
            className="bg-red-50 text-red-600 border border-red-100 font-bold py-2 px-6 rounded-lg hover:bg-red-100 transition-all active:scale-95"
          >
            Clear Visible Records
          </button>
        </div>

        {/* The Gradebook Table */}
        {isLoadingGradebook ? (
          <div className="text-center py-20 text-2xl font-black text-slate-300 animate-pulse">
            Loading Gradebook...
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 print:bg-transparent">
                  <th className="p-5 font-bold uppercase tracking-wider text-sm">
                    Name
                  </th>
                  <th className="p-5 font-bold uppercase tracking-wider text-sm">
                    Section
                  </th>
                  <th className="p-5 font-bold uppercase tracking-wider text-sm">
                    Activity Type
                  </th>
                  <th className="p-5 font-bold uppercase tracking-wider text-sm">
                    Score
                  </th>
                  <th className="p-5 font-bold uppercase tracking-wider text-sm">
                    Date
                  </th>
                  <th className="p-5 font-bold uppercase tracking-wider text-sm print:hidden">
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
                  filteredData.map((record, index) => (
                    <tr
                      key={record.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-5 font-bold text-slate-800 text-lg">
                        {/* THIS IS THE FIX: Automatically numbers them based on their sorted array position */}
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
                            record.score >= 80
                              ? "bg-green-100 text-green-700"
                              : record.score >= 70
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {record.score}%
                        </span>
                      </td>
                      <td className="p-5 text-slate-500 font-medium">
                        {/* Handles Firebase Timestamp objects safely */}
                        {record.timestamp?.toDate
                          ? record.timestamp.toDate().toLocaleDateString()
                          : new Date(record.timestamp).toLocaleDateString()}
                      </td>
                      <td className="p-5 print:hidden flex gap-2">
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ==============================================================================
            JIT (Just-In-Time) PRINT VIEW 
            This only mounts when you hit "Print All to PDF". It drops the 400MB RAM leak
            because it doesn't render 100 QR codes until the exact second you need them.
            ============================================================================== */}
        {isPreparingPrint && (
          <div className="hidden print:block w-full">
            {/* If you have a specific PrintReport component for each student, map it here! */}
            {/* Example: 
                filteredData.map(record => (
                  <div key={record.id} className="break-after-page">
                     <PrintableStudentReport data={record} />
                  </div>
                ))
             */}
          </div>
        )}
      </div>
    </div>
  );
}
