import STYLES from "../styles/gradebookStyles.json";
import {
  formatSafeScore,
  formatRecordDate,
  getScoreBadgeClass,
} from "../utils/gradebookUtils";

export default function GradebookTable({
  records,
  isLoading,
  onViewReport,
  onDeleteRecord,
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
          {records.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                className="p-10 text-center text-slate-400 font-bold text-lg"
              >
                No results found.
              </td>
            </tr>
          ) : (
            records.map((record, index) => {
              const safeScore = formatSafeScore(record.score);
              const displayDate = formatRecordDate(record.timestamp);
              const badgeClass = getScoreBadgeClass(safeScore);

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
                  <td className="p-5 text-slate-600">{record.activityType}</td>
                  <td className="p-5">
                    <span
                      className={`font-black text-xl px-3 py-1 rounded-lg ${badgeClass}`}
                    >
                      {safeScore}%
                    </span>
                  </td>
                  <td className="p-5 text-slate-500 font-medium">
                    {displayDate}
                  </td>
                  <td className="p-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onViewReport(record)}
                      className={STYLES.reportBtn}
                    >
                      Report
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRecord(record.id)}
                      className={STYLES.deleteBtn}
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
  );
}
