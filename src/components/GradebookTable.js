// src/components/GradebookTable.js
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
  onSoftDelete,
  onRestoreRecord,
  onHardDelete,
  viewMode = "active",
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
                {viewMode === "hidden"
                  ? "No hidden records found."
                  : "No results found."}
              </td>
            </tr>
          ) : (
            records.map((record, index) => {
              const isHiddenEntry = record.status === "HIDDEN";
              const hasAttempt =
                record.status !== "NO_ATTEMPT" &&
                record.score !== null &&
                record.score !== undefined;

              const safeScore = hasAttempt
                ? formatSafeScore(record.score)
                : null;
              const displayDate = hasAttempt
                ? formatRecordDate(record.timestamp)
                : "—";
              const badgeClass = hasAttempt
                ? getScoreBadgeClass(safeScore)
                : "";

              const displayName = record.officialName || record.studentName;
              const hasDifferentTypedName =
                record.rawTypedName &&
                record.rawTypedName.trim().toLowerCase() !==
                  displayName.trim().toLowerCase();

              return (
                <tr
                  key={record.id || `${record.section}-${index}`}
                  className={`border-b border-slate-100 transition-colors ${
                    hasAttempt
                      ? "hover:bg-slate-50"
                      : "bg-slate-50/40 text-slate-400"
                  }`}
                >
                  <td className="p-5 font-bold text-slate-800 text-lg">
                    <span className="text-slate-400 font-medium mr-2">
                      {index + 1}.
                    </span>
                    <span
                      className={
                        hasAttempt
                          ? "text-slate-800"
                          : "text-slate-600 font-semibold"
                      }
                    >
                      {displayName}
                    </span>
                    {hasDifferentTypedName && (
                      <span className="block text-xs font-normal text-slate-400 italic">
                        Typed: "{record.rawTypedName}"
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-slate-600 font-bold">
                    {record.section}
                  </td>
                  <td className="p-5 text-slate-600">
                    {record.activityType || "—"}
                  </td>
                  <td className="p-5">
                    {hasAttempt ? (
                      <span
                        className={`font-black text-xl px-3 py-1 rounded-lg ${badgeClass}`}
                      >
                        {safeScore}%
                      </span>
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-200 text-slate-500">
                        No Attempt
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-slate-500 font-medium text-sm">
                    {displayDate}
                  </td>
                  <td className="p-5 flex gap-2 items-center">
                    {isHiddenEntry ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onViewReport(record)}
                          className={STYLES.reportBtn}
                        >
                          Report
                        </button>
                        <button
                          type="button"
                          onClick={() => onRestoreRecord(record.id)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-xs transition cursor-pointer"
                          title="Restore record to active roster"
                        >
                          Unhide
                        </button>
                        <button
                          type="button"
                          onClick={() => onHardDelete(record.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold text-xs transition cursor-pointer"
                          title="Permanently remove from database (breaks QR code)"
                        >
                          Purge
                        </button>
                      </>
                    ) : hasAttempt ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onViewReport(record)}
                          className={STYLES.reportBtn}
                        >
                          Report
                        </button>
                        <button
                          type="button"
                          onClick={() => onSoftDelete(record.id)}
                          className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg font-bold text-xs transition cursor-pointer"
                          title="Hide from UI while preserving QR code and report URL"
                        >
                          Hide
                        </button>
                        <button
                          type="button"
                          onClick={() => onHardDelete(record.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold text-xs transition cursor-pointer"
                          title="Permanently remove from database (breaks QR code)"
                        >
                          Purge
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 italic px-2">
                        Pending
                      </span>
                    )}
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
