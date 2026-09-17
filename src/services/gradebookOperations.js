// src/services/gradebookOperations.js
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { recalculateRecordScore } from "../utils/regradeUtils";

export async function executeDeleteRecord(id) {
  if (!window.confirm("Delete this specific record?")) return false;
  try {
    await deleteDoc(doc(db, "exam_results", id));
    return true;
  } catch (error) {
    console.error("Delete error:", error);
    alert("Failed to delete record.");
    return false;
  }
}

export async function executeBulkDelete(recordsToDelete) {
  if (!recordsToDelete || recordsToDelete.length === 0) return false;

  if (
    recordsToDelete.length >= 15 &&
    window.prompt(
      `WARNING: ${recordsToDelete.length} records. Type: CONFIRM DELETE`,
    ) !== "CONFIRM DELETE"
  ) {
    return false;
  }

  if (
    recordsToDelete.length < 15 &&
    !window.confirm(`Delete these ${recordsToDelete.length} records?`)
  ) {
    return false;
  }

  try {
    await Promise.all(
      recordsToDelete.map((record) =>
        deleteDoc(doc(db, "exam_results", record.id)),
      ),
    );
    return true;
  } catch (error) {
    console.error("Bulk delete error:", error);
    alert("Failed to delete records.");
    return false;
  }
}

export async function executeBatchRegrade(records) {
  if (
    !window.confirm(
      "This will scan ALL visible records, fix the missing comma bug, recalculate the scores, and update the database. Proceed?",
    )
  ) {
    return null;
  }

  let updatedCount = 0;
  try {
    for (const record of records) {
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
    return updatedCount;
  } catch (error) {
    console.error("Regrade error:", error);
    alert("Failed to regrade exams. Check console.");
    return null;
  }
}
