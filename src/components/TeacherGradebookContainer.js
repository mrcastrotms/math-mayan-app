// src/components/TeacherGradebookContainer.js
"use client";

import React, { useState } from "react";
import TeacherGradebookView from "./TeacherGradebookView";
import PinModal from "./PinModal";
import PurgeConfirmModal from "./ui/PurgeConfirmModal";

export default function TeacherGradebookContainer({
  gradebook,
  availableSections,
  onBack,
  onViewReport,
}) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  // Toggle record ID in Set on double click
  const handleToggleSelectRecord = (recordId) => {
    if (!recordId) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(recordId)) {
        next.delete(recordId);
      } else {
        next.add(recordId);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleConfirmPurge = async () => {
    if (selectedIds.size === 0) return;

    setIsPurging(true);
    try {
      const idsToPurge = Array.from(selectedIds);

      if (typeof gradebook.bulkHardDeleteRecords === "function") {
        await gradebook.bulkHardDeleteRecords(idsToPurge);
      } else if (typeof gradebook.hardDeleteRecord === "function") {
        await Promise.all(
          idsToPurge.map((id) => gradebook.hardDeleteRecord(id)),
        );
      }

      setSelectedIds(new Set());
      setIsPurgeModalOpen(false);

      if (typeof gradebook.fetchGradebook === "function") {
        gradebook.fetchGradebook();
      }
    } catch (err) {
      console.error("[GRADEBOOK] Batch purge failed:", err);
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Top Floating Controls */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-[100] print:hidden flex items-center gap-3">
        <button
          type="button"
          onClick={gradebook.runRetroactiveRegrade}
          className="bg-yellow-400 text-yellow-900 font-bold px-6 py-2 rounded-full shadow-lg border border-yellow-500 hover:bg-yellow-500 transition active:scale-95 cursor-pointer text-sm touch-manipulation"
        >
          Regrade
        </button>

        {/* Floating Action Pill on Selection */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 rounded-full bg-slate-900/95 border border-red-500/50 px-4 py-1.5 shadow-xl backdrop-blur-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">
              {selectedIds.size} Selected
            </span>
            <button
              type="button"
              onClick={handleClearSelection}
              className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition touch-manipulation"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setIsPurgeModalOpen(true)}
              className="rounded-full bg-red-600 px-4 py-1 text-xs font-bold text-white hover:bg-red-700 transition shadow touch-manipulation"
            >
              Purge Selected
            </button>
          </div>
        )}
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
        selectedIds={selectedIds}
        onToggleSelectRecord={handleToggleSelectRecord}
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

      <PurgeConfirmModal
        isOpen={isPurgeModalOpen}
        count={selectedIds.size}
        isProcessing={isPurging}
        onClose={() => setIsPurgeModalOpen(false)}
        onConfirm={handleConfirmPurge}
      />
    </div>
  );
}
