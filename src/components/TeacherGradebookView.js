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
  const filteredData =
    gradebookFilter === "All"
      ? gradebookData
      : gradebookData.filter((d) => d.section === gradebookFilter);
  const filterOptions = ["All", ...availableSections];

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-8 w-full z-50 absolute top-0 left-0 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900">Gradebook</h1>
          <button
            onClick={onBack}
            className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-bold hover:bg-slate-300 transition"
          >
            Dashboard
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-bold text-slate-600">
                Filter by Section:
              </span>
              {filterOptions.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setGradebookFilter(sec)}
                  className={`px-4 py-1 rounded-full text-sm font-bold transition ${gradebookFilter === sec ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-100"}`}
                >
                  {sec}
                </button>
              ))}
            </div>
            <button
              onClick={() => onBulkDelete(filteredData)}
              className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-200 transition whitespace-nowrap ml-4"
            >
              Clear
            </button>
          </div>
          {isLoadingGradebook ? (
            <div className="p-12 text-center text-slate-500 font-bold animate-pulse">
              Loading scores...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider">
                  <th className="p-4 border-b">Name</th>
                  <th className="p-4 border-b">Section</th>
                  <th className="p-4 border-b">Activity Type</th>
                  <th className="p-4 border-b">Score</th>
                  <th className="p-4 border-b">Done</th>
                  <th className="p-4 border-b">Date</th>
                  <th className="p-4 border-b text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">
                      No results found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((result, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50 border-b last:border-0 transition"
                    >
                      <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                        {result.studentName}
                        {result.isTestRun && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                            [Test Run]
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-600 font-mono">
                        {result.section}
                      </td>
                      <td className="p-4 text-slate-600 text-xs font-bold">
                        {result.activityType || "Assessment / Exam"}
                      </td>
                      <td className="p-4 font-bold text-blue-600">
                        {result.score}%
                      </td>
                      <td className="p-4 text-slate-600">
                        {result.questionsAttempted}
                      </td>
                      <td className="p-4 text-slate-400 text-sm">
                        {result.timestamp
                          ? new Date(
                              result.timestamp.toDate(),
                            ).toLocaleDateString()
                          : "Just now"}
                      </td>
                      <td className="p-4 text-right space-x-3">
                        <button
                          onClick={() => onViewReport(result)}
                          className="text-blue-600 font-bold hover:text-blue-800 text-sm uppercase"
                        >
                          Report
                        </button>
                        <button
                          onClick={() => onDeleteRecord(result.id)}
                          className="text-red-500 font-bold hover:text-red-700 text-sm uppercase"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
