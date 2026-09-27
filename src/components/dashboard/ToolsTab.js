import React from "react";
import ClassManagerCard from "../ClassManagerCard";
import CloudCmsCard from "../CloudCmsCard";

export default function ToolsTab({
  setShowRosterModal,
  availableSections,
  setShowAddSectionModal,
  setSectionToDelete,
  appText,
  setAppText,
}) {
  return (
    <div className="w-full max-w-4xl flex flex-col gap-6 animate-in fade-in duration-200">
      <section className="w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold">Student Directory & Family Contacts</h2>
            <span className="text-[10px] bg-emerald-500/25 text-emerald-400 font-mono px-2 py-0.5 rounded-full font-semibold">
              Firestore Roster
            </span>
          </div>
          <p className="text-sm opacity-75">
            View enrolled students across sections 4A–5B, search records, and manage parent emails & phone numbers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowRosterModal(true)}
          className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-orange-500 transition cursor-pointer whitespace-nowrap"
        >
          Open Roster Directory
        </button>
      </section>

      <ClassManagerCard
        availableSections={availableSections}
        onAddSection={() => setShowAddSectionModal(true)}
        onDeleteSection={(sec) => setSectionToDelete(sec)}
      />

      <CloudCmsCard appText={appText} setAppText={setAppText} />
    </div>
  );
}
