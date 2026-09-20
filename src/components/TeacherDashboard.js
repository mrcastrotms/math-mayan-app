// src/components/TeacherDashboard.js
import { useState } from "react";
import { useTeacherSession } from "../hooks/useTeacherSession";
import { useGradebookData } from "../hooks/useGradebookData";
import { useAIQuestionGenerator } from "../hooks/useAIQuestionGenerator";
import { useLiveClassroomSync } from "../hooks/useLiveClassroomSync";
import { syncQuestionsToFirebase } from "../services/questionService";

import StudentReportModal from "./StudentReportModal";
import TeacherGradebookContainer from "./TeacherGradebookContainer";
import SessionGeneratorCard from "./SessionGeneratorCard";
import GradebookSummaryCard from "./GradebookSummaryCard";
import TeacherJailMonitor from "./TeacherJailMonitor";
import ClassManagerCard from "./ClassManagerCard";
import CloudCmsCard from "./CloudCmsCard";
import QuestionCmsCard from "./QuestionCmsCard";
import TeacherSectionModals from "./TeacherSectionModals";
import ThemeToggle from "./ThemeToggle";
import { useAppTheme } from "../hooks/useAppTheme";
import { broadcastSectionTheme } from "../services/liveSyncService";
import WorksheetBuilderCard from "./WorksheetBuilderCard";
import WorksheetManagerCard from "./WorksheetManagerCard";

export default function TeacherDashboard({
  setIsAdminMode,
  availableSections,
  setAvailableSections,
  appText,
  setAppText,
}) {
  const [isViewingGradebook, setIsViewingGradebook] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [themeMessage, setThemeMessage] = useState("");
  const themeState = useAppTheme();

  const session = useTeacherSession();
  const gradebook = useGradebookData();
  const { isGeneratingQuestions, handleGenerateAIQuestions } =
    useAIQuestionGenerator();

  const { liveStudents, sendCommand } = useLiveClassroomSync({
    isTeacher: true,
    activeSection:
      session.selectedSessionSection || availableSections?.[0] || "",
  });
  const activeSection =
    session.selectedSessionSection || availableSections?.[0] || "";

  const handleThemeBroadcast = async (locked) => {
    try {
      const count = await broadcastSectionTheme(
        activeSection,
        themeState.theme,
        locked,
      );
      setThemeMessage(
        locked
          ? `${themeState.theme} theme locked for ${count} active student${count === 1 ? "" : "s"}.`
          : "Student theme choices restored.",
      );
    } catch (error) {
      console.error("Unable to broadcast theme override:", error);
      setThemeMessage("Unable to update the theme lock.");
    }
  };

  const handleOpenGradebook = () => {
    setIsViewingGradebook(true);
    setSelectedReport(null);
    gradebook.fetchGradebook();
  };

  if (selectedReport) {
    return (
      <StudentReportModal
        report={selectedReport}
        onBack={() => setSelectedReport(null)}
      />
    );
  }

  if (isViewingGradebook) {
    return (
      <TeacherGradebookContainer
        gradebook={gradebook}
        availableSections={availableSections}
        onBack={() => setIsViewingGradebook(false)}
        onViewReport={(report) => setSelectedReport(report)}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-start pt-16 min-h-screen bg-[var(--app-bg)] text-[var(--app-fg)] p-8 relative font-sans w-full z-50 absolute top-0 left-0 overflow-y-auto">
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
          onResetSession={session.resetSession}
        />
        <GradebookSummaryCard onOpenGradebook={handleOpenGradebook} />
      </div>

      <TeacherJailMonitor
        liveStudents={liveStudents}
        activeSection={activeSection}
        onSendCommand={sendCommand}
      />

      <WorksheetBuilderCard availableSections={availableSections} />
      <WorksheetManagerCard availableSections={availableSections} />

      <section className="w-full max-w-4xl bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-6 shadow-xl mb-6" aria-labelledby="theme-controls-title">
        <h2 id="theme-controls-title" className="text-lg font-bold mb-3">
          Theme Enforcement
        </h2>
        <p className="text-sm opacity-75 mb-4">
          Broadcast the selected theme to active students in Section {activeSection || "All"}.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <ThemeToggle theme={themeState.theme} changeTheme={themeState.changeTheme} />
          <button type="button" onClick={() => handleThemeBroadcast(true)} className="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-500">
            Lock Theme
          </button>
          <button type="button" onClick={() => handleThemeBroadcast(false)} className="rounded-lg bg-slate-600 px-4 py-2 font-bold text-white hover:bg-slate-500">
            Release Lock
          </button>
        </div>
        {themeMessage && <p role="status" className="mt-3 text-sm text-emerald-300">{themeMessage}</p>}
      </section>

      <ClassManagerCard
        availableSections={availableSections}
        onAddSection={() => setShowAddSectionModal(true)}
        onDeleteSection={(sec) => setSectionToDelete(sec)}
      />

      <CloudCmsCard appText={appText} setAppText={setAppText} />

      <QuestionCmsCard
        onGenerateAI={handleGenerateAIQuestions}
        isGenerating={isGeneratingQuestions}
        onSyncCloud={syncQuestionsToFirebase}
      />

      <button
        type="button"
        onClick={() => setIsAdminMode(false)}
        className="text-slate-400 hover:text-white underline text-lg font-bold cursor-pointer"
      >
        Student Version
      </button>

      <TeacherSectionModals
        availableSections={availableSections}
        setAvailableSections={setAvailableSections}
        showAddSectionModal={showAddSectionModal}
        setShowAddSectionModal={setShowAddSectionModal}
        sectionToDelete={sectionToDelete}
        setSectionToDelete={setSectionToDelete}
      />
    </div>
  );
}
