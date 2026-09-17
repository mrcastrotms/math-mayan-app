// src/components/TeacherGradebookContainer.js
import React from "react";
import TeacherGradebookView from "./TeacherGradebookView";
import PinModal from "./PinModal";

export default function TeacherGradebookContainer({
  gradebook,
  availableSections,
  onBack,
  onViewReport,
}) {
  return (
    <div className="relative w-full h-full">
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-[100] print:hidden">
        <button
          type="button"
          onClick={gradebook.runRetroactiveRegrade}
          className="bg-yellow-400 text-yellow-900 font-bold px-6 py-2 rounded-full shadow-lg border border-yellow-500 hover:bg-yellow-500 transition active:scale-95 cursor-pointer"
        >
          Regrade
        </button>
      </div>

      <TeacherGradebookView
        gradebookData={gradebook.gradebookData}
        gradebookFilter={gradebook.gradebookFilter}
        setGradebookFilter={gradebook.setGradebookFilter}
        availableSections={availableSections}
        isLoadingGradebook={gradebook.isLoadingGradebook}
        onBack={onBack}
        onBulkSoftDelete={gradebook.bulkSoftDeleteRecords}
        onBulkHardDelete={gradebook.bulkHardDeleteRecords}
        onSoftDelete={gradebook.softDeleteRecord}
        onRestoreRecord={gradebook.restoreRecord}
        onHardDelete={gradebook.hardDeleteRecord}
        onViewReport={onViewReport}
      />

      {gradebook.deleteConfirmation && (
        <PinModal
          isOpen={gradebook.deleteConfirmation.isOpen}
          onClose={gradebook.closeDeleteModal}
          onSubmit={gradebook.deleteConfirmation.onConfirm}
          title={gradebook.deleteConfirmation.title}
          description={gradebook.deleteConfirmation.description}
          showInput={gradebook.deleteConfirmation.showInput}
          placeholder={gradebook.deleteConfirmation.placeholder}
          type={gradebook.deleteConfirmation.type}
          confirmColor={gradebook.deleteConfirmation.confirmColor}
          confirmText={gradebook.deleteConfirmation.confirmText}
        />
      )}
    </div>
  );
}
