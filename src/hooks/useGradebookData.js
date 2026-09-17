// src/hooks/useGradebookData.js
import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  executeSoftDeleteRecord,
  executeRestoreRecord,
  executeHardDeleteRecord,
  executeBulkSoftDelete,
  executeBulkHardDelete,
  executeBatchRegrade,
} from "../services/gradebookOperations";

export function useGradebookData() {
  const [gradebookData, setGradebookData] = useState([]);
  const [isLoadingGradebook, setIsLoadingGradebook] = useState(true);
  const [gradebookFilter, setGradebookFilter] = useState("All");

  // Real-time Firestore stream: automatically catches student submissions the moment they finish
  useEffect(() => {
    setIsLoadingGradebook(true);

    const q = query(
      collection(db, "exam_results"),
      orderBy("timestamp", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        data.sort((a, b) =>
          (a.studentName || "").localeCompare(b.studentName || ""),
        );

        setGradebookData(data);
        setIsLoadingGradebook(false);
      },
      (error) => {
        console.error("Failed to load real-time gradebook:", error);
        setIsLoadingGradebook(false);
      },
    );

    // Clean up websocket listener on unmount
    return () => unsubscribe();
  }, []);

  // Preserved manual refresh method for full backwards compatibility
  const fetchGradebook = useCallback(async () => {
    setIsLoadingGradebook(true);
    try {
      const q = query(
        collection(db, "exam_results"),
        orderBy("timestamp", "desc"),
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      data.sort((a, b) =>
        (a.studentName || "").localeCompare(b.studentName || ""),
      );
      setGradebookData(data);
    } catch (error) {
      console.error("Failed to load gradebook:", error);
    } finally {
      setIsLoadingGradebook(false);
    }
  }, []);

  // Soft Delete: sets isDeleted = true (QR code stays alive)
  const softDeleteRecord = async (id) => {
    const success = await executeSoftDeleteRecord(id);
    if (success) {
      setGradebookData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isDeleted: true } : item,
        ),
      );
    }
  };

  // Restore / Unhide: removes deleted flag, returning it to Active Roster
  const restoreRecord = async (id) => {
    const success = await executeRestoreRecord(id);
    if (success) {
      setGradebookData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isDeleted: false, deleted: false } : item,
        ),
      );
    }
  };

  // Hard Delete: permanently deletes doc from Firestore (breaks QR code)
  const hardDeleteRecord = async (id) => {
    const success = await executeHardDeleteRecord(id);
    if (success) {
      setGradebookData((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Bulk Soft Delete: hides all visible submissions
  const bulkSoftDeleteRecords = async (recordsToHide) => {
    setIsLoadingGradebook(true);
    const success = await executeBulkSoftDelete(recordsToHide);
    if (success) {
      await fetchGradebook();
    } else {
      setIsLoadingGradebook(false);
    }
  };

  // Bulk Hard Delete: permanently purges visible submissions
  const bulkHardDeleteRecords = async (recordsToDelete) => {
    setIsLoadingGradebook(true);
    const success = await executeBulkHardDelete(recordsToDelete);
    if (success) {
      await fetchGradebook();
    } else {
      setIsLoadingGradebook(false);
    }
  };

  const runRetroactiveRegrade = async () => {
    setIsLoadingGradebook(true);
    const count = await executeBatchRegrade(gradebookData);
    if (count !== null) {
      alert(`Successfully regraded and fixed ${count} exams!`);
      await fetchGradebook();
    } else {
      setIsLoadingGradebook(false);
    }
  };

  return {
    gradebookData,
    isLoadingGradebook,
    gradebookFilter,
    setGradebookFilter,
    fetchGradebook,
    softDeleteRecord,
    restoreRecord,
    hardDeleteRecord,
    bulkSoftDeleteRecords,
    bulkHardDeleteRecords,
    // Aliases for backwards compatibility
    deleteRecord: hardDeleteRecord,
    bulkDeleteRecords: bulkHardDeleteRecords,
    runRetroactiveRegrade,
  };
}
