import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

import { useTeacherSession } from "../hooks/useTeacherSession";
import { useGradebookData } from "../hooks/useGradebookData";
import { syncQuestionsToFirebase } from "../services/questionService";

import StudentReportModal from "./StudentReportModal";
import TeacherGradebookView from "./TeacherGradebookView";
import SessionGeneratorCard from "./SessionGeneratorCard";
import ClassManagerCard from "./ClassManagerCard";
import CloudCmsCard from "./CloudCmsCard";

export default function TeacherDashboard({
  setIsAdminMode,
  availableSections,
  setAvailableSections,
  appText,
  setAppText,
}) {
  const [isViewingGradebook, setIsViewingGradebook] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // 1. Session generation hook
  const session = useTeacherSession();

  // 2. Gradebook data hook
  const gradebook = useGradebookData();

  const handleOpenGradebook = () => {
    setIsViewingGradebook(true);
    setSelectedReport(null);
    gradebook.fetchGradebook();
  };

  const handleAddSection = async () => {
    const newSec = window.prompt("Enter new section name (e.g., 6A):");
    if (!newSec || !newSec.trim()) return;
    const updated = [...availableSections, newSec.trim().toUpperCase()];
    setAvailableSections(updated);
    await setDoc(
      doc(db, "settings", "classes"),
      { list: updated },
      { merge: true },
    );
  };

  const handleDeleteSection = async (secToRemove) => {
    if (!window.confirm(`Delete section ${secToRemove}?`)) return;
    const updated = availableSections.filter((s) => s !== secToRemove);
    setAvailableSections(updated);
    await setDoc(
      doc(db, "settings", "classes"),
      { list: updated },
      { merge: true },
    );
  };

  // View: Single Student Report
  if (selectedReport) {
    return (
      <StudentReportModal
        report={selectedReport}
        onBack={() => setSelectedReport(null)}
      />
    );
  }

  // View: Full Gradebook
  if (isViewingGradebook) {
    return (
      <div className="relative w-full h-full">
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-[100] print:hidden">
          <button
            type="button"
            onClick={gradebook.runRetroactiveRegrade}
            className="bg-yellow-400 text-yellow-900 font-bold px-6 py-2 rounded-full shadow-lg border border-yellow-500 hover:bg-yellow-500 transition active:scale-95"
          >
            Regrade
          </button>
        </div>

        <TeacherGradebookView
          gradebookData={gradebook.gradebookData}
          gradebookFilter={gradebook.gradebookFilter}
          setGradebookFilter={gradebook.setGradebookFilter}
          availableSections={availableSections}
          isLoadingGradebook={gradebook.isLoadingGradebook}
          onBack={() => setIsViewingGradebook(false)}
          onBulkDelete={gradebook.bulkDeleteRecords}
          onDeleteRecord={gradebook.deleteRecord}
          onViewReport={(report) => setSelectedReport(report)}
        />
      </div>
    );
  }

  // View: Main Dashboard
  return (
    <div className="flex flex-col items-center justify-start pt-16 min-h-screen bg-slate-900 text-white p-8 relative font-sans w-full z-50 absolute top-0 left-0 overflow-y-auto">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">
        Teacher Dashboard
      </h1>

      <div className="flex gap-6 w-full max-w-4xl justify-center mb-6">
        <SessionGeneratorCard
          generatedCode={session.generatedCode}
          selectedSessionSection={session.selectedSessionSection}
          setSelectedSessionSection={session.setSelectedSessionSection}
          selectedActivityType={session.selectedActivityType}
          setSelectedActivityType={session.setSelectedActivityType}
          activityOptions={session.activityOptions}
          availableSections={availableSections}
          isGenerating={session.isGenerating}
          onGenerateCode={session.generateCode}
        />

        <div className="bg-slate-800 p-8 rounded-2xl w-80 shadow-2xl border border-slate-700 flex flex-col justify-between items-center text-center">
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-4 text-green-400">
              Gradebook
            </h2>
            <p className="text-slate-400 mb-6 text-sm">
              View completed assessments and track student progress.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenGradebook}
            className="bg-green-600 text-white px-8 py-4 w-full rounded-xl text-xl font-bold hover:bg-green-700 transition shadow-lg active:scale-95"
          >
            Open Gradebook
          </button>
        </div>
      </div>

      <ClassManagerCard
        availableSections={availableSections}
        onAddSection={handleAddSection}
        onDeleteSection={handleDeleteSection}
      />

      <CloudCmsCard appText={appText} setAppText={setAppText} />

      <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-700 mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-indigo-400">
            Question Bank CMS
          </h2>
          <p className="text-slate-400 text-sm">
            Sync your math question bank to Firebase Firestore.
          </p>
        </div>
        <button
          type="button"
          onClick={syncQuestionsToFirebase}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg active:scale-95 whitespace-nowrap"
        >
          Sync Questions to Cloud
        </button>
      </div>

      <button
        type="button"
        onClick={() => setIsAdminMode(false)}
        className="text-slate-400 hover:text-white underline text-lg font-bold"
      >
        Test Student Version -&gt;
      </button>
    </div>
  );
}
