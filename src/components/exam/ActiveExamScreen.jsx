"use client";

import { useState } from "react";
import ConfirmSubmitModal from "../ui/ConfirmSubmitModal";

export default function ActiveExamScreen({ state, navigateTo, adminPanel }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // This will eventually wrap your real Firebase submission logic
  const handleFinalSubmit = async () => {
    setIsModalOpen(false);

    if (typeof state?.handleFinishExam === "function") {
      await state.handleFinishExam();
    }

    // Route to the dashboard/results screen after submission
    navigateTo("dashboard");
  };

  return (
    <div className="relative flex h-screen flex-col bg-slate-50">
      {/* --- Top Navigation Bar --- */}
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Science Fair 2026
          </h1>
          <p className="text-sm text-slate-500">
            {state?.student?.name || "Student"}
          </p>
        </div>

        {/* The button that triggers our new Modal */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-green-600 px-6 py-2.5 font-bold text-white shadow hover:bg-green-700 transition-colors"
        >
          Finish Exam
        </button>
      </header>

      {/* --- Main Question Area (To be migrated next) --- */}
      <main className="mx-auto mt-8 w-full max-w-4xl flex-1 rounded-xl bg-white p-8 shadow-sm border border-slate-100">
        <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-2xl font-semibold text-slate-400">
            Question Content Will Go Here
          </h2>
          <p className="text-slate-400">
            (This is where we will mount the new Tape Diagram manipulatives!)
          </p>
        </div>
      </main>

      {/* --- Our Custom React Modal --- */}
      <ConfirmSubmitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleFinalSubmit}
      />

      {/* --- Dev/Admin Panel rendered here so it floats on top --- */}
      {adminPanel}
    </div>
  );
}
