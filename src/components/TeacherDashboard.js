import TeacherWhiteboardMonitor from "./TeacherWhiteboardMonitor";
import TeacherImageHub from "./TeacherImageHub";
import RosterManagerModal from "./dashboard/RosterManagerModal";
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
import AttendanceBook from "./AttendanceBook";
import BehaviorBook from "./BehaviorBook";
import AttendanceValuesHistory from "./AttendanceValuesHistory";

export default function TeacherDashboard({
  setIsAdminMode,
  availableSections,
  setAvailableSections,
  appText,
  setAppText,
  onStudentVersion,
}) {
  const [isViewingGradebook, setIsViewingGradebook] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [isViewingAttendanceHistory, setIsViewingAttendanceHistory] = useState(false);
  const [isViewingWhiteboard, setIsViewingWhiteboard] = useState(false);
  const [isViewingImageHub, setIsViewingImageHub] = useState(false);
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

  const handleOpenGradebook = async () => {
    setIsViewingGradebook(true);
    setSelectedReport(null);
    await gradebook.fetchGradebook();
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

  if (isViewingWhiteboard) {
    return <TeacherWhiteboardMonitor defaultSection={activeSection || "4D"} onBack={() => setIsViewingWhiteboard(false)} />;
  }

  if (isViewingAttendanceHistory) {
    return <AttendanceValuesHistory availableSections={availableSections} onBack={() => setIsViewingAttendanceHistory(false)} />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-start gap-6 overflow-y-auto bg-[var(--app-bg)] p-8 pt-16 font-sans text-[var(--app-fg)] relative z-50 absolute top-0 left-0">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">
        Teacher Dashboard
      </h1>

      <div className="flex w-full max-w-4xl flex-wrap justify-center gap-6">
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
        <div className="flex flex-col justify-between bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-6 shadow-xl flex-1 min-w-[280px]">
          <div>
            <h3 className="text-lg font-bold text-emerald-400 mb-1">Live Whiteboard</h3>
            <p className="text-sm opacity-75 mb-4">Monitor and inspect active student scratchpads in real time.</p>
          </div>

        <div className="flex flex-col justify-between bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-6 shadow-xl flex-1 min-w-[280px]">
          <div>
            <h3 className="text-lg font-bold text-purple-400 mb-1">Class Visuals Hub</h3>
            <p className="text-sm opacity-75 mb-4">Paste anchor charts, problem screenshots, or reference diagrams for students.</p>
          </div>
          <button
            onClick={() => setIsViewingImageHub(true)}
            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-md"
          >
            Open Visuals Hub
          </button>
        </div>
          <button
            onClick={() => setIsViewingWhiteboard(true)}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md"
          >
            Open Live Monitor →
          </button>
        </div>
      </div>

      <TeacherJailMonitor
        liveStudents={liveStudents}
        activeSection={activeSection}
        onSendCommand={sendCommand}
      />

      <WorksheetBuilderCard availableSections={availableSections} />
      <WorksheetManagerCard availableSections={availableSections} />
      <AttendanceBook availableSections={availableSections} onOpenHistory={() => setIsViewingAttendanceHistory(true)} />
      <BehaviorBook onOpenHistory={() => setIsViewingAttendanceHistory(true)} />

      <section className="w-full max-w-4xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-xl" aria-labelledby="theme-controls-title">
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

      
      {/* Student Directory & Roster Card */}
      <section className="w-full max-w-4xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold">Student Directory & Family Contacts</h2>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono px-2 py-0.5 rounded-full font-semibold">
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

      <QuestionCmsCard
        onGenerateAI={handleGenerateAIQuestions}
        isGenerating={isGeneratingQuestions}
        onSyncCloud={syncQuestionsToFirebase}
      />

      <button
        type="button"
        onClick={() => {
          if (onStudentVersion) {
            onStudentVersion();
          } else {
            setIsAdminMode(false);
          }
        }}
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

      <RosterManagerModal isOpen={showRosterModal} onClose={() => setShowRosterModal(false)} currentTheme={themeState} />
    </div>
  );
}
