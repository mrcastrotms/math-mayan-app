// src/components/TeacherGradebookView.js
import React from "react";
import STYLES from "../styles/gradebookStyles.json";
import { useBatchPrint } from "../hooks/useBatchPrint";
import GradebookTable from "./GradebookTable";
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
  const { isPreparingPrint, triggerBatchPrint, currentOrigin } =
    useBatchPrint(800);

  const filteredData = (gradebookData || []).filter(
    (record) => gradebookFilter === "All" || record.section === gradebookFilter,
  );

  return (
    <div className={`${STYLES.container} relative`}>
      {/* Interactive UI - Suppressed during print */}
      <div className={`${STYLES.innerWrapper} print:hidden`}>
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className={STYLES.title}>Gradebook</h1>
          <div className="flex gap-4 w-full md:w-auto">
            <button
              type="button"
              onClick={triggerBatchPrint}
              disabled={isPreparingPrint || filteredData.length === 0}
              className={`${STYLES.primaryBtn} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isPreparingPrint
                ? "Preparing PDF..."
                : `Print All (${filteredData.length})`}
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

        {/* Section Filters & Bulk Clear */}
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

          <button
            type="button"
            onClick={() => onBulkDelete(filteredData)}
            disabled={filteredData.length === 0}
            className={`${STYLES.clearBtn} disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
          >
            Clear Visible Records
          </button>
        </div>

        {/* Modular Table */}
        <GradebookTable
          records={filteredData}
          isLoading={isLoadingGradebook}
          onViewReport={onViewReport}
          onDeleteRecord={onDeleteRecord}
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
          {filteredData.map((record) => (
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
