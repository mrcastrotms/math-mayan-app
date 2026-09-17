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
    useBatchPrint(600);

  const filteredData = gradebookData.filter(
    (record) => gradebookFilter === "All" || record.section === gradebookFilter,
  );

  return (
    <div className={STYLES.container}>
      <div className={STYLES.innerWrapper}>
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className={STYLES.title}>Gradebook</h1>
          <div className="flex gap-4 w-full md:w-auto">
            <button
              type="button"
              onClick={triggerBatchPrint}
              disabled={isPreparingPrint || filteredData.length === 0}
              className={STYLES.primaryBtn}
            >
              {isPreparingPrint
                ? "Preparing PDF..."
                : `Print All (${filteredData.length})`}
            </button>
            <button type="button" onClick={onBack} className={STYLES.darkBtn}>
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
              {availableSections.map((sec) => (
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
            className={STYLES.clearBtn}
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

      {/* Static Root-Level Print Container (Fixes the 1-page cutoff bug) */}
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
  );
}
