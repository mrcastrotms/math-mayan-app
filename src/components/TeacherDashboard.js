import { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  updateDoc, // NEW: Added to allow retroactive updating
} from "firebase/firestore";
import { db } from "../firebase";
import StudentReportModal from "./StudentReportModal";
import TeacherGradebookView from "./TeacherGradebookView";
import ClassManagerCard from "./ClassManagerCard";
import CloudCmsCard from "./CloudCmsCard";
import { syncQuestionsToFirebase } from "../services/questionService";

export default function TeacherDashboard({
  setIsAdminMode,
  availableSections,
  setAvailableSections,
  appText,
  setAppText,
}) {
  const [generatedCode, setGeneratedCode] = useState("");
  const [selectedSessionSection, setSelectedSessionSection] = useState("");
  const [selectedActivityType, setSelectedActivityType] =
    useState("Assessment / Exam");
  const [isGenerating, setIsGenerating] = useState(false);

  const [isViewingGradebook, setIsViewingGradebook] = useState(false);
  const [gradebookData, setGradebookData] = useState([]);
  const [isLoadingGradebook, setIsLoadingGradebook] = useState(false);
  const [gradebookFilter, setGradebookFilter] = useState("All");
  const [selectedReport, setSelectedReport] = useState(null);

  const activityOptions = ["Classwork", "Quiz", "Assessment", "Test", "Exam"];

  const handleGenerateCode = async () => {
    if (!selectedSessionSection) return;
    setIsGenerating(true);

    const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const durationSeconds =
      selectedActivityType === "Classwork" || selectedActivityType === "Quiz"
        ? 600
        : 2400;

    try {
      await addDoc(collection(db, "exam_sessions"), {
        code,
        section: selectedSessionSection,
        activityType: selectedActivityType,
        duration: durationSeconds,
        createdAt: serverTimestamp(),
        active: true,
      });

      setGeneratedCode(code);
    } catch (e) {
      console.error("Failed to start session:", e);
      alert("Database error. Try generating again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchGradebook = async () => {
    setIsViewingGradebook(true);
    setIsLoadingGradebook(true);
    setSelectedReport(null);
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
      data.sort((a, b) => a.studentName.localeCompare(b.studentName));
      setGradebookData(data);
    } catch (error) {
      console.error(error);
    }
    setIsLoadingGradebook(false);
  };

  // =========================================================================
  // RETROACTIVE REGRADE SCRIPT
  // Strips commas from old answers, regrades them, and recalculates the score
  // =========================================================================
  const handleRetroactiveRegrade = async () => {
    if (
      !window.confirm(
        "This will scan ALL visible records, fix the missing comma bug, recalculate the scores, and update the database. Proceed?",
      )
    )
      return;

    setIsLoadingGradebook(true);
    let updatedCount = 0;

    try {
      for (const record of gradebookData) {
        let needsUpdate = false;
        let newCorrectCount = 0;

        // 1. Regrade each individual answer
        const updatedAnswers = (record.answers || []).map((ans) => {
          if (!ans.studentInput || !ans.correctAnswer) return ans;

          // Strip commas and spaces from both the student input and the correct answer
          const cleanInput = String(ans.studentInput).replace(/,/g, "").trim();
          const cleanCorrect = String(ans.correctAnswer)
            .replace(/,/g, "")
            .trim();

          const newIsCorrect = cleanInput === cleanCorrect;

          if (newIsCorrect !== ans.isCorrect) {
            needsUpdate = true; // We found a bugged comma answer!
          }

          if (newIsCorrect) newCorrectCount++;

          return { ...ans, isCorrect: newIsCorrect };
        });

        // 2. Only recalculate and hit the database if we actually found a mistake
        if (needsUpdate) {
          // Re-apply your floor logic based on 10 min vs 40 min exams
          const minRequired =
            record.activityType === "Classwork" ||
            record.activityType === "Quiz"
              ? 8
              : 20;
          const gradedOutOf = Math.max(updatedAnswers.length, minRequired);
          const accuracy = newCorrectCount / gradedOutOf;

          // Re-apply the 40-50-60-100 mathematical scale
          let newScore = 60 + accuracy * 40;
          newScore -= (record.demerits || 0) * 5;
          newScore = Math.max(50, Math.min(100, Math.round(newScore)));

          if (updatedAnswers.length === 0) newScore = 40; // Blank test floor

          // 3. Save the corrected score and answers permanently to Firebase
          await updateDoc(doc(db, "exam_results", record.id), {
            answers: updatedAnswers,
            score: newScore,
          });

          updatedCount++;
        }
      }

      alert(`Successfully regraded and fixed ${updatedCount} exams!`);
      fetchGradebook(); // Refresh the Gradebook UI to show the new scores
    } catch (error) {
      console.error("Regrade error:", error);
      alert("Failed to regrade exams. Check console.");
    }
    setIsLoadingGradebook(false);
  };
  // =========================================================================

  const handleDeleteRecord = async (id) => {
    if (!window.confirm("Delete this specific record?")) return;
    try {
      await deleteDoc(doc(db, "exam_results", id));
      setGradebookData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      alert("Failed to delete record.");
    }
  };

  const handleBulkDelete = async (dataToDelete) => {
    if (dataToDelete.length === 0) return;
    if (
      dataToDelete.length >= 15 &&
      window.prompt(
        `WARNING: ${dataToDelete.length} records. Type: CONFIRM DELETE`,
      ) !== "CONFIRM DELETE"
    )
      return;
    if (
      dataToDelete.length < 15 &&
      !window.confirm(`Delete these ${dataToDelete.length} records?`)
    )
      return;

    setIsLoadingGradebook(true);
    try {
      await Promise.all(
        dataToDelete.map((record) =>
          deleteDoc(doc(db, "exam_results", record.id)),
        ),
      );
      fetchGradebook();
    } catch (error) {
      alert("Failed to delete.");
      setIsLoadingGradebook(false);
    }
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

  if (selectedReport)
    return (
      <StudentReportModal
        report={selectedReport}
        onBack={() => setSelectedReport(null)}
      />
    );

  if (isViewingGradebook) {
    return (
      <div className="relative w-full h-full">
        {/* NEW: Injected the Regrade button directly above the Gradebook view */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-[100] print:hidden">
          <button
            onClick={handleRetroactiveRegrade}
            className="bg-yellow-400 text-yellow-900 font-bold px-6 py-2 rounded-full shadow-lg border border-yellow-500 hover:bg-yellow-500 transition active:scale-95"
          >
            Retroactive Regrade (Fix Commas)
          </button>
        </div>

        <TeacherGradebookView
          gradebookData={gradebookData}
          gradebookFilter={gradebookFilter}
          setGradebookFilter={setGradebookFilter}
          availableSections={availableSections}
          isLoadingGradebook={isLoadingGradebook}
          onBack={() => setIsViewingGradebook(false)}
          onBulkDelete={handleBulkDelete}
          onDeleteRecord={handleDeleteRecord}
          onViewReport={(report) => setSelectedReport(report)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start pt-16 min-h-screen bg-slate-900 text-white p-8 relative font-sans w-full z-50 absolute top-0 left-0 overflow-y-auto">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">
        Teacher Dashboard
      </h1>

      <div className="flex gap-6 w-full max-w-4xl justify-center mb-6">
        <div className="bg-slate-800 p-8 rounded-2xl flex-1 shadow-2xl border border-slate-700 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Start a Session</h2>
            <p className="text-slate-400 mb-4 text-sm">
              Select activity type, section, and generate a secure code.
            </p>
          </div>

          {generatedCode ? (
            <div className="bg-slate-900 p-6 rounded-xl border-2 border-blue-500 shadow-inner flex flex-col justify-center items-center my-4">
              <p className="text-xs text-yellow-400 mb-1 uppercase tracking-widest font-bold">
                {selectedActivityType}
              </p>
              <p className="text-sm text-slate-400 mb-1 uppercase tracking-widest font-bold">
                Section {selectedSessionSection}
              </p>
              <p className="text-6xl font-mono tracking-widest text-green-400 text-center">
                {generatedCode}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 my-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  1. Select Activity Type:
                </label>
                <select
                  value={selectedActivityType}
                  onChange={(e) => setSelectedActivityType(e.target.value)}
                  className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-700 font-bold focus:outline-none focus:border-blue-500"
                >
                  {activityOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  2. Select Class Section:
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSections.map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setSelectedSessionSection(sec)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition ${selectedSessionSection === sec ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateCode}
                disabled={!selectedSessionSection || isGenerating}
                className={`mt-2 px-8 py-3 rounded-xl text-xl font-bold transition shadow-lg ${
                  isGenerating
                    ? "bg-slate-500 text-slate-300 cursor-not-allowed"
                    : selectedSessionSection
                      ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                      : "bg-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                {isGenerating ? "Connecting..." : "Generate Code"}
              </button>
            </div>
          )}
        </div>

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
            onClick={fetchGradebook}
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
          onClick={syncQuestionsToFirebase}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg active:scale-95 whitespace-nowrap"
        >
          Sync Questions to Cloud
        </button>
      </div>

      <button
        onClick={() => setIsAdminMode(false)}
        className="text-slate-400 hover:text-white underline text-lg font-bold"
      >
        Test Student Version -{">"}
      </button>
    </div>
  );
}
