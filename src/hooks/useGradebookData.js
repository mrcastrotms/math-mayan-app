// src/hooks/useGradebookData.js
import { useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import {
  executeDeleteRecord,
  executeBulkDelete,
  executeBatchRegrade,
} from "../services/gradebookOperations";

export function useGradebookData() {
  const [gradebookData, setGradebookData] = useState([]);
  const [isLoadingGradebook, setIsLoadingGradebook] = useState(false);
  const [gradebookFilter, setGradebookFilter] = useState("All");

  const fetchGradebook = async () => {
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
  };

  const deleteRecord = async (id) => {
    const success = await executeDeleteRecord(id);
    if (success) {
      setGradebookData((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const bulkDeleteRecords = async (recordsToDelete) => {
    setIsLoadingGradebook(true);
    const success = await executeBulkDelete(recordsToDelete);
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
    deleteRecord,
    bulkDeleteRecords,
    runRetroactiveRegrade,
  };
}
