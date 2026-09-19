"use client";

import React from "react";
import STYLES from "../../styles/gradebookStyles.json";
import {
  formatSafeScore,
  formatRecordDate,
  getScoreBadgeClass,
} from "../../utils/gradebookUtils";

export default function GradebookRow({
  record,
  index,
  isSelected,
  onToggleSelect,
  onViewReport,
  onSoftDelete,
  onRestoreRecord,
  onHardDelete,
}) {
  const isHiddenEntry = record.status === "HIDDEN";
  const hasAttempt =
    record.status !== "NO_ATTEMPT" &&
    record.score !== null &&
    record.score !== undefined;

  const safeScore = hasAttempt ? formatSafeScore(record.score) : null;
  const displayDate = hasAttempt ? formatRecordDate(record.timestamp) : "—";
  const badgeClass = hasAttempt ? getScoreBadgeClass(safeScore) : "";

  const displayName = record.officialName || record.studentName;
  const hasDifferentTypedName =
    record.rawTypedName &&
    record.rawTypedName.trim().toLowerCase() !==
      displayName.trim().toLowerCase();

  return (
    <tr
      onDoubleClick={() => {
        if (record.id) {
          onToggleSelect?.(record.id);
        }
      }}
      className={`border-b border-slate-100 transition-colors select-none cursor-pointer ${
        isSelected
          ? "bg-red-50/90 border-l-4 border-l-red-500"
          : hasAttempt
            ? "hover:bg-slate-50"
            : "bg-slate-50/40 text-slate-400 hover:bg-slate-100/50"
      }`}
    >
      <td className="p-5 font-bold text-slate-800 text-lg">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">{index + 1}.</span>
          <span
            className={
              hasAttempt
                ? "text-slate-800"
                : "text-slate-600 font-semibold"
            }
          >
            {displayName}
          </span>
          {isSelected && (
            <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Selected
            </span>
          )}
        </div>
        {hasDifferentTypedName && (
          <span className="block text-xs font-normal text-slate-400 italic mt-0.5">
            Typed: &quot;{record.rawTypedName}&quot;
          </span>
        )}
      </td>
      <td className="p-5 text-slate-600 font-bold">{record.section}</td>
      <td className="p-5 text-slate-600">{record.activityType || "—"}</td>
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
              onClick={(e) => {
                e.stopPropagation();
                onViewReport(record);
              }}
              className={STYLES.reportBtn}
            >
              Report
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRestoreRecord(record.id);
              }}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-xs transition cursor-pointer"
              title="Restore record to active roster"
            >
              Unhide
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onHardDelete(record.id);
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                onViewReport(record);
              }}
              className={STYLES.reportBtn}
            >
              Report
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSoftDelete(record.id);
              }}
              className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg font-bold text-xs transition cursor-pointer"
              title="Hide from UI while preserving QR code and report URL"
            >
              Hide
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onHardDelete(record.id);
              }}
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
}
