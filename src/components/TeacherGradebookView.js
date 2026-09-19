"use client";

import React, { useState, useMemo } from "react";
import STYLES from "../styles/gradebookStyles.json";
import { useBatchPrint } from "../hooks/useBatchPrint";
import {
  mergeRosterWithSubmissions,
  getHiddenSubmissions,
} from "../utils/rosterUtils";
import GradebookTable from "./GradebookTable";
import PurgeConfirmModal from "./ui/PurgeConfirmModal";
import GradebookHeader from "./gradebook/GradebookHeader";
import GradebookToolbar from "./gradebook/GradebookToolbar";
import GradebookBatchPrint from "./gradebook/GradebookBatchPrint";

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
  const [viewMode, setViewMode] = useState("active");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  const { isPreparingPrint, triggerBatchPrint, currentOrigin } = useBatchPrint(800);

  const displayData = useMemo(() => {
    if (viewMode === "hidden") {
      return getHiddenSubmissions(gradebookFilter, gradebookData || []);
    }
    return mergeRosterWithSubmissions(gradebookFilter, gradebookData || []);
  }, [viewMode, gradebookFilter, gradebookData]);

  const printableSubmissions = useMemo(() => {
    return displayData.filter(
      (record) => record.status !== "NO_ATTEMPT" && record.score !== null,
    );
  }, [displayData]);

  const hiddenCount = useMemo(() => {
    return (gradebookData || []).filter(
      (s) =>
        (s.isDeleted || s.deleted) &&
        (gradebookFilter === "All" || s.section === gradebookFilter),
    ).length;
  }, [gradebookData, gradebookFilter]);

  const handleToggleSelect = (recordId) => {
    if (!recordId) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(recordId)) next.delete(recordId);
      else next.add(recordId);
      return next;
    });
  };

  const handleClearSelection = () => setSelectedIds(new Set());

  const handleExecutePurge = async () => {
    if (selectedIds.size === 0) return;
    setIsPurging(true);
    try {
      const targetRecords = displayData.filter((r) => selectedIds.has(r.id));
      if (typeof onBulkHardDelete === "function") {
        await onBulkHardDelete(targetRecords);
      } else if (typeof onHardDelete === "function") {
        await Promise.all(targetRecords.map((r) => onHardDelete(r.id)));
      }
      setSelectedIds(new Set());
      setIsPurgeModalOpen(false);
    } catch (err) {
      console.error("[PURGE] Batch deletion failed:", err);
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className={`${STYLES.container} relative`}>
      <div className={`${STYLES.innerWrapper} print:hidden`}>
        <GradebookHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          hiddenCount={hiddenCount}
          printableCount={printableSubmissions.length}
          isPreparingPrint={isPreparingPrint}
          onBatchPrint={triggerBatchPrint}
          onBack={onBack}
        />

        <GradebookToolbar
          gradebookFilter={gradebookFilter}
          setGradebookFilter={setGradebookFilter}
          availableSections={availableSections}
          viewMode={viewMode}
          selectedCount={selectedIds.size}
          onClearSelection={handleClearSelection}
          onOpenPurgeModal={() => setIsPurgeModalOpen(true)}
          onBulkSoftDelete={onBulkSoftDelete}
          onBulkHardDelete={onBulkHardDelete}
          printableSubmissions={printableSubmissions}
        />

        <GradebookTable
          records={displayData}
          isLoading={isLoadingGradebook}
          onViewReport={onViewReport}
          onSoftDelete={onSoftDelete}
          onRestoreRecord={onRestoreRecord}
          onHardDelete={onHardDelete}
          viewMode={viewMode}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
        />
      </div>

      <GradebookBatchPrint
        isPreparingPrint={isPreparingPrint}
        printableSubmissions={printableSubmissions}
        currentOrigin={currentOrigin}
      />

      <PurgeConfirmModal
        isOpen={isPurgeModalOpen}
        count={selectedIds.size}
        isProcessing={isPurging}
        onClose={() => setIsPurgeModalOpen(false)}
        onConfirm={handleExecutePurge}
      />
    </div>
  );
}
