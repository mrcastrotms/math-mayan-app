import { useState } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { recalculateRecordScore } from "../utils/regradeUtils";

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
    if (!window.confirm("Delete this specific record?")) return;
    try {
      await deleteDoc(doc(db, "exam_results", id));
      setGradebookData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete record.");
    }
  };

  const bulkDeleteRecords = async (recordsToDelete) => {
    if (!recordsToDelete || recordsToDelete.length === 0) return;

    if (
      recordsToDelete.length >= 15 &&
      window.prompt(
        `WARNING: ${recordsToDelete.length} records. Type: CONFIRM DELETE`,
      ) !== "CONFIRM DELETE"
    ) {
      return;
    }

    if (
      recordsToDelete.length < 15 &&
      !window.confirm(`Delete these ${recordsToDelete.length} records?`)
    ) {
      return;
    }

    setIsLoadingGradebook(true);
    try {
      await Promise.all(
        recordsToDelete.map((record) =>
          deleteDoc(doc(db, "exam_results", record.id)),
        ),
      );
      await fetchGradebook();
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert("Failed to delete records.");
      setIsLoadingGradebook(false);
    }
  };

  const runRetroactiveRegrade = async () => {
    if (
      !window.confirm(
        "This will scan ALL visible records, fix the missing comma bug, recalculate the scores, and update the database. Proceed?",
      )
    ) {
      return;
    }

    setIsLoadingGradebook(true);
    let updatedCount = 0;

    try {
      for (const record of gradebookData) {
        const { needsUpdate, updatedAnswers, newScore } =
          recalculateRecordScore(record);

        if (needsUpdate) {
          await updateDoc(doc(db, "exam_results", record.id), {
            answers: updatedAnswers,
            score: newScore,
          });
          updatedCount++;
        }
      }

      alert(`Successfully regraded and fixed ${updatedCount} exams!`);
      await fetchGradebook();
    } catch (error) {
      console.error("Regrade error:", error);
      alert("Failed to regrade exams. Check console.");
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
