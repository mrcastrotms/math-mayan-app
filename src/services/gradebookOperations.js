// src/services/gradebookOperations.js
import { deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { recalculateRecordScore } from "../utils/regradeUtils";

/**
 * Soft Delete: Marks record hidden in the UI.
 * Keeps the document intact so QR code (?report=ID) remains live.
 */
export async function executeSoftDeleteRecord(id) {
  if (
    !window.confirm(
      "Hide this record from the gradebook? The QR code and report URL will still work.",
    )
  ) {
    return false;
  }

  try {
    await updateDoc(doc(db, "exam_results", id), {
      isDeleted: true,
      deletedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Soft delete error:", error);
    alert("Failed to hide record.");
    return false;
  }
}

/**
 * Restore / Unhide: Clears deleted flag so record returns to Active Roster.
 */
export async function executeRestoreRecord(id) {
  try {
    await updateDoc(doc(db, "exam_results", id), {
      isDeleted: false,
      deleted: false,
    });
    return true;
  } catch (error) {
    console.error("Restore error:", error);
    alert("Failed to restore record.");
    return false;
  }
}

/**
 * Hard Delete: Permanently purges document from Firestore.
 * Invalids QR code and public report link.
 */
export async function executeHardDeleteRecord(id) {
  if (
    !window.confirm(
      "PERMANENT DELETE: This will delete the document completely. The QR code and report link will no longer work. Proceed?",
    )
  ) {
    return false;
  }

  try {
    await deleteDoc(doc(db, "exam_results", id));
    return true;
  } catch (error) {
    console.error("Hard delete error:", error);
    alert("Failed to delete record.");
    return false;
  }
}

/**
 * Bulk Soft Delete: Marks all visible records as hidden.
 */
export async function executeBulkSoftDelete(recordsToHide) {
  if (!recordsToHide || recordsToHide.length === 0) return false;

  if (
    !window.confirm(
      `Hide ${recordsToHide.length} visible records from the gradebook? Public report links will remain accessible.`,
    )
  ) {
    return false;
  }

  try {
    await Promise.all(
      recordsToHide.map((record) =>
        updateDoc(doc(db, "exam_results", record.id), {
          isDeleted: true,
          deletedAt: serverTimestamp(),
        }),
      ),
    );
    return true;
  } catch (error) {
    console.error("Bulk soft delete error:", error);
    alert("Failed to hide records.");
    return false;
  }
}

/**
 * Bulk Hard Delete: Completely deletes all records from Firestore.
 */
export async function executeBulkHardDelete(recordsToDelete) {
  if (!recordsToDelete || recordsToDelete.length === 0) return false;

  if (
    recordsToDelete.length >= 15 &&
    window.prompt(
      `DANGER: Permanent delete of ${recordsToDelete.length} records. Type: CONFIRM DELETE`,
    ) !== "CONFIRM DELETE"
  ) {
    return false;
  }

  if (
    recordsToDelete.length < 15 &&
    !window.confirm(
      `Permanently delete these ${recordsToDelete.length} records? This cannot be undone.`,
    )
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
    console.error("Bulk hard delete error:", error);
    alert("Failed to permanently delete records.");
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
