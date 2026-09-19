"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  const [rosterDirectory, setRosterDirectory] = useState({});

  const [selectedActivity, setSelectedActivity] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    async function loadDirectory() {
      try {
        const res = await fetch("/api/roster", {
          headers: { "x-teacher-pin": "0801" },
        });
        if (res.ok) {
          const data = await res.json();
          setRosterDirectory(data);
        }
      } catch (err) {
        console.error("Failed to load roster directory:", err);
      }
    }
    loadDirectory();
  }, []);

  const { isPreparingPrint, triggerBatchPrint, currentOrigin } =
    useBatchPrint(800);

  const displayData = useMemo(() => {
    if (viewMode === "hidden") {
      return getHiddenSubmissions(gradebookFilter, gradebookData || []);
    }
    return mergeRosterWithSubmissions(
      gradebookFilter,
      gradebookData || [],
      rosterDirectory,
      selectedActivity,
      selectedDate,
    );
  }, [viewMode, gradebookFilter, gradebookData, rosterDirectory, selectedActivity, selectedDate]);

  const printableSubmissions = useMemo(() => {
    return displayData.filter(
      (record) => record.status !== "NO_ATTEMPT" && record.score !== null,
    );
  }, [displayData]);

  const hiddenCount = useMemo(() => {
    return (gradebookData || []).filter(
      (s) =>
        (s.isDeleted || s.deleted) &&
        (gradebookFilter === "All" || (s.section && s.section.toLowerCase() === gradebookFilter.toLowerCase())),
    ).length;
  }, [gradebookData, gradebookFilter]);

  const availableActivities = useMemo(() => {
    const defaults = ["Classwork", "Quiz", "Assessment", "Test", "Exam", "Assessment / Exam"];
    const activities = new Set(defaults);
    (gradebookData || []).forEach((r) => {
      const act = r.activityType || r.activity;
      if (act && act !== "—" && typeof act === "string") {
        activities.add(act.trim());
      }
    });
    const list = Array.from(activities);
    if (!list.includes("Other")) list.push("Other");
    return list;
  }, [gradebookData]);

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

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-bold text-slate-600">Date & Activity Filter</span>
            
            <select 
              value={selectedActivity} 
              onChange={(e) => setSelectedActivity(e.target.value)}
              className="bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-lg text-sm border-0 cursor-pointer"
            >
              <option value="All">All Activities</option>
              {availableActivities.map((act) => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>

            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-lg text-sm border-0 cursor-pointer"
            />
          </div>
          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate("")}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Clear Date Filter
            </button>
          )}
        </div>

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
