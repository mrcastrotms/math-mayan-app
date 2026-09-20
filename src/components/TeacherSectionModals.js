// src/components/TeacherSectionModals.js
import React from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import PinModal from "./PinModal";
import { addSection, normalizeSection, removeSection } from "../utils/sectionUtils.mjs";

export default function TeacherSectionModals({
  availableSections,
  setAvailableSections,
  showAddSectionModal,
  setShowAddSectionModal,
  sectionToDelete,
  setSectionToDelete,
}) {
  const handleConfirmAddSection = async (rawInput) => {
    const newSec = normalizeSection(rawInput);
    const updated = addSection(availableSections, newSec);
    if (updated === availableSections) return;
    setAvailableSections(updated);
    await setDoc(
      doc(db, "settings", "classes"),
      { list: updated },
      { merge: true },
    );
  };

  const handleConfirmDeleteSection = async () => {
    if (!sectionToDelete) return;
    const updated = removeSection(availableSections, sectionToDelete);
    setAvailableSections(updated);
    await setDoc(
      doc(db, "settings", "classes"),
      { list: updated },
      { merge: true },
    );
    setSectionToDelete(null);
  };

  return (
    <>
      <PinModal
        isOpen={showAddSectionModal}
        onClose={() => setShowAddSectionModal(false)}
        onSubmit={handleConfirmAddSection}
        title="Add Class Section"
        placeholder="e.g. 6A"
        type="text"
        confirmText="Add"
      />

      <PinModal
        isOpen={Boolean(sectionToDelete)}
        onClose={() => setSectionToDelete(null)}
        onSubmit={handleConfirmDeleteSection}
        title={`Delete Section ${sectionToDelete}?`}
        description="Students assigned to this section will no longer be grouped under this label."
        showInput={false}
        confirmText="Delete Section"
        confirmColor="bg-red-600 hover:bg-red-700 shadow-red-200"
      />
    </>
  );
}
