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
  const [gradebookError, setGradebookError] = useState("");
  const [gradebookFilter, setGradebookFilter] = useState("All");

  const readGradebook = useCallback(async () => {
    try {
      const orderedQuery = query(
        collection(db, "exam_results"),
        orderBy("timestamp", "desc"),
      );
      return await getDocs(orderedQuery);
    } catch (error) {
      console.error("Ordered gradebook query failed; retrying without ordering:", error);
      return getDocs(collection(db, "exam_results"));
    }
  }, []);

  // Real-time Firestore stream: automatically catches student submissions the moment they finish
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const q = query(
        collection(db, "exam_results"),
        orderBy("timestamp", "desc"),
      );

      unsubscribe = onSnapshot(
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
          setGradebookError("");
          setIsLoadingGradebook(false);
        },
        (error) => {
          console.error("Failed to load real-time gradebook:", error);
          if (typeof unsubscribe === "function") unsubscribe();
          unsubscribe = onSnapshot(
            collection(db, "exam_results"),
            (snapshot) => {
              const data = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
              }));
              data.sort((a, b) =>
                (a.studentName || "").localeCompare(b.studentName || ""),
              );
              setGradebookData(data);
              setGradebookError("");
              setIsLoadingGradebook(false);
            },
            (fallbackError) => {
              console.error("Failed to load real-time gradebook fallback:", fallbackError);
              setGradebookError("Gradebook could not be loaded. Check Firestore access.");
              setIsLoadingGradebook(false);
            },
          );
        },
      );
    } catch (error) {
      console.error("Failed to start real-time gradebook:", error);
      // This branch only handles synchronous subscription setup failures.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGradebookError("Gradebook could not be loaded. Check Firestore access.");
      setIsLoadingGradebook(false);
    }

    // Clean up websocket listener on unmount
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [readGradebook]);

  // Preserved manual refresh method for full backwards compatibility
  const fetchGradebook = useCallback(async () => {
    setIsLoadingGradebook(true);
    try {
      const snapshot = await readGradebook();
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      data.sort((a, b) =>
        (a.studentName || "").localeCompare(b.studentName || ""),
      );
      setGradebookData(data);
      setGradebookError("");
    } catch (error) {
      console.error("Failed to load gradebook:", error);
      setGradebookError("Gradebook could not be loaded. Check Firestore access.");
    } finally {
      setIsLoadingGradebook(false);
    }
  }, [readGradebook]);

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
    gradebookError,
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
