// src/components/TeacherGradebookView.js
import React, { useState, useMemo } from "react";
import STYLES from "../styles/gradebookStyles.json";
import { useBatchPrint } from "../hooks/useBatchPrint";
import {
  mergeRosterWithSubmissions,
  getHiddenSubmissions,
} from "../utils/rosterUtils";
import GradebookTable from "./GradebookTable";
import StudentReportPrintSheet from "./StudentReportPrintSheet";

export default function TeacherGradebookView({
  gradebookData,
  gradebookFilter,
  setGradebookFilter,
  availableSections,
  isLoadingGradebook,
  onBack,
  onBulkSoftDelete,
  onBulkHardDelete,
  onSoftDelete,
  onRestoreRecord,
  onHardDelete,
  onViewReport,
}) {
  const [viewMode, setViewMode] = useState("active"); // "active" | "hidden"
  const { isPreparingPrint, triggerBatchPrint, currentOrigin } =
    useBatchPrint(800);

  // Compute records based on selected view mode
  const displayData = useMemo(() => {
    if (viewMode === "hidden") {
      return getHiddenSubmissions(gradebookFilter, gradebookData || []);
    }
    return mergeRosterWithSubmissions(gradebookFilter, gradebookData || []);
  }, [viewMode, gradebookFilter, gradebookData]);

  // Printable set: only records that represent completed submissions
  const printableSubmissions = useMemo(() => {
    return displayData.filter(
      (record) => record.status !== "NO_ATTEMPT" && record.score !== null,
    );
  }, [displayData]);

  // Total hidden records matching current filter
  const hiddenCount = useMemo(() => {
    return (gradebookData || []).filter(
      (s) =>
        (s.isDeleted || s.deleted) &&
        (gradebookFilter === "All" || s.section === gradebookFilter),
    ).length;
  }, [gradebookData, gradebookFilter]);

  return (
    <div className={`${STYLES.container} relative`}>
      {/* Interactive UI - Suppressed during print */}
      <div className={`${STYLES.innerWrapper} print:hidden`}>
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className={STYLES.title}>Gradebook</h1>

            {/* Active vs. Hidden Switcher */}
            <div className="flex bg-slate-200 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode("active")}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition cursor-pointer ${
                  viewMode === "active"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Active Roster
              </button>
              <button
                type="button"
                onClick={() => setViewMode("hidden")}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                  viewMode === "hidden"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <span>Hidden Archive</span>
                {hiddenCount > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-black">
                    {hiddenCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <button
              type="button"
              onClick={triggerBatchPrint}
              disabled={isPreparingPrint || printableSubmissions.length === 0}
              className={`${STYLES.primaryBtn} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isPreparingPrint
                ? "Preparing PDF..."
                : `Print All ${viewMode === "hidden" ? "Hidden" : ""} (${printableSubmissions.length})`}
            </button>
            <button
              type="button"
              onClick={onBack}
              className={`${STYLES.darkBtn} cursor-pointer`}
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Section Filters & Bulk Actions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-bold text-slate-600">Filter by Section:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setGradebookFilter("All")}
                className={
                  gradebookFilter === "All"
                    ? STYLES.filterBtnActive
                    : STYLES.filterBtnInactive
                }
              >
                All
              </button>
              {(availableSections || []).map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setGradebookFilter(sec)}
                  className={
                    gradebookFilter === sec
                      ? STYLES.filterBtnActive
                      : STYLES.filterBtnInactive
                  }
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === "active" ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    onBulkSoftDelete && onBulkSoftDelete(printableSubmissions)
                  }
                  disabled={printableSubmissions.length === 0}
                  className="px-4 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title="Hide visible records from UI (QR codes remain live)"
                >
                  Hide Visible
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onBulkHardDelete && onBulkHardDelete(printableSubmissions)
                  }
                  disabled={printableSubmissions.length === 0}
                  className={`${STYLES.clearBtn} disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
                  title="Permanently purge visible records from database"
                >
                  Purge Visible
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() =>
                  onBulkHardDelete && onBulkHardDelete(printableSubmissions)
                }
                disabled={printableSubmissions.length === 0}
                className={`${STYLES.clearBtn} disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
                title="Permanently purge all hidden records from database"
              >
                Purge All Hidden
              </button>
            )}
          </div>
        </div>

        {/* Modular Table */}
        <GradebookTable
          records={displayData}
          isLoading={isLoadingGradebook}
          onViewReport={onViewReport}
          onSoftDelete={onSoftDelete}
          onRestoreRecord={onRestoreRecord}
          onHardDelete={onHardDelete}
          viewMode={viewMode}
        />
      </div>

      {/* Printable Sheet Container - Renders only when printing */}
      {isPreparingPrint && (
        <div
          id="batch-print-container"
          className="hidden print:block w-full bg-white text-black"
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
                @media print {
                  body {
                    background: white !important;
                    margin: 0 !important;
                    padding: 0 !important;
                  }
                  #batch-print-container {
                    display: block !important;
                  }
                  .report-page {
                    page-break-after: always !important;
                    break-after: page !important;
                    min-height: 100vh;
                  }
                  .report-page:last-child {
                    page-break-after: auto !important;
                    break-after: auto !important;
                  }
                }
              `,
            }}
          />
          {printableSubmissions.map((record) => (
            <StudentReportPrintSheet
              key={record.id || `${record.name}-${record.timestamp}`}
              record={record}
              baseUrl={currentOrigin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
