import TeacherWhiteboardMonitor from "./TeacherWhiteboardMonitor";
import TeacherImageHub from "./TeacherImageHub";
import RosterManagerModal from "./dashboard/RosterManagerModal";
import OverviewTab from "./dashboard/OverviewTab";
import AcademicsTab from "./dashboard/AcademicsTab";
import TrackingTab from "./dashboard/TrackingTab";
import ToolsTab from "./dashboard/ToolsTab";

import { useState } from "react";
import { useTeacherSession } from "../hooks/useTeacherSession";
import { useGradebookData } from "../hooks/useGradebookData";
import { useAIQuestionGenerator } from "../hooks/useAIQuestionGenerator";
import { useLiveClassroomSync } from "../hooks/useLiveClassroomSync";
import { syncQuestionsToFirebase } from "../services/questionService";

import StudentReportModal from "./StudentReportModal";
import TeacherGradebookContainer from "./TeacherGradebookContainer";
import TeacherSectionModals from "./TeacherSectionModals";
import { useAppTheme } from "../hooks/useAppTheme";
import { broadcastSectionTheme } from "../services/liveSyncService";
import AttendanceValuesHistory from "./AttendanceValuesHistory";

export default function TeacherDashboard({
  setIsAdminMode,
  availableSections,
  setAvailableSections,
  appText,
  setAppText,
  onStudentVersion,
}) {
  const [activeTab, setActiveTab] = useState("overview");
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

  const isAnySubViewActive = selectedReport || isViewingGradebook || isViewingWhiteboard || isViewingImageHub || isViewingAttendanceHistory;

  if (isViewingWhiteboard) {
    return <TeacherWhiteboardMonitor defaultSection={activeSection || "4D"} onBack={() => setIsViewingWhiteboard(false)} />;
  }

  if (isViewingImageHub) {
    return <TeacherImageHub defaultSection={activeSection || "4D"} onBack={() => setIsViewingImageHub(false)} />;
  }

  if (isViewingAttendanceHistory) {
    return <AttendanceValuesHistory availableSections={availableSections} onBack={() => setIsViewingAttendanceHistory(false)} />;
  }

  return (
    <>
      {selectedReport && (
        <StudentReportModal
          report={selectedReport}
          onBack={() => setSelectedReport(null)}
        />
      )}

      {isViewingGradebook && !selectedReport && (
        <TeacherGradebookContainer
          gradebook={gradebook}
          availableSections={availableSections}
          onBack={() => setIsViewingGradebook(false)}
          onViewReport={(report) => setSelectedReport(report)}
        />
      )}

      {isViewingWhiteboard && (
        <TeacherWhiteboardMonitor defaultSection={activeSection || "4D"} onBack={() => setIsViewingWhiteboard(false)} />
      )}

      {isViewingImageHub && (
        <TeacherImageHub defaultSection={activeSection || "4D"} onBack={() => setIsViewingImageHub(false)} />
      )}

      {isViewingAttendanceHistory && (
        <AttendanceValuesHistory availableSections={availableSections} onBack={() => setIsViewingAttendanceHistory(false)} />
      )}

      <div className={`flex min-h-screen w-full flex-col items-center justify-start gap-6 overflow-y-auto bg-[var(--app-bg)] p-4 sm:p-8 pt-6 font-sans text-[var(--app-fg)] relative z-50 absolute top-0 left-0 ${isAnySubViewActive ? 'hidden' : ''}`}>
        
        <div className="w-full max-w-4xl flex flex-col gap-4 sticky top-0 z-40 bg-[var(--app-bg)]/95 backdrop-blur-md pb-4 pt-2 border-b border-[var(--app-border)]">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-400">
              Teacher Dashboard
            </h1>
            <button
              type="button"
              onClick={() => {
                if (onStudentVersion) {
                  onStudentVersion();
                } else {
                  setIsAdminMode(false);
                }
              }}
              className="text-xs sm:text-sm font-bold text-slate-400 hover:text-white underline cursor-pointer"
            >
              Student Version →
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === "overview" ? "bg-blue-600 text-white shadow-md" : "bg-[var(--app-surface)] text-slate-400 hover:text-white border border-[var(--app-border)]"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("academics")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === "academics" ? "bg-blue-600 text-white shadow-md" : "bg-[var(--app-surface)] text-slate-400 hover:text-white border border-[var(--app-border)]"}`}
            >
              Academics and Worksheets
            </button>
            <button
              onClick={() => setActiveTab("tracking")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === "tracking" ? "bg-blue-600 text-white shadow-md" : "bg-[var(--app-surface)] text-slate-400 hover:text-white border border-[var(--app-border)]"}`}
            >
              Attendance and Behavior
            </button>
            <button
              onClick={() => setActiveTab("tools")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === "tools" ? "bg-blue-600 text-white shadow-md" : "bg-[var(--app-surface)] text-slate-400 hover:text-white border border-[var(--app-border)]"}`}
            >
              System and CMS
            </button>
          </div>
        </div>

        {activeTab === "overview" && (
          <OverviewTab
            session={session}
            availableSections={availableSections}
            handleOpenGradebook={handleOpenGradebook}
            setIsViewingWhiteboard={setIsViewingWhiteboard}
            setIsViewingImageHub={setIsViewingImageHub}
            activeSection={activeSection}
            themeState={themeState}
            handleThemeBroadcast={handleThemeBroadcast}
            themeMessage={themeMessage}
          />
        )}

        {activeTab === "academics" && (
          <AcademicsTab
            availableSections={availableSections}
            handleGenerateAIQuestions={handleGenerateAIQuestions}
            isGeneratingQuestions={isGeneratingQuestions}
            syncQuestionsToFirebase={syncQuestionsToFirebase}
          />
        )}

        {activeTab === "tracking" && (
          <TrackingTab
            liveStudents={liveStudents}
            activeSection={activeSection}
            sendCommand={sendCommand}
            setIsViewingAttendanceHistory={setIsViewingAttendanceHistory}
          />
        )}

        {activeTab === "tools" && (
          <ToolsTab
            setShowRosterModal={setShowRosterModal}
            availableSections={availableSections}
            setShowAddSectionModal={setShowAddSectionModal}
            setSectionToDelete={setSectionToDelete}
            appText={appText}
            setAppText={setAppText}
          />
        )}

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
    </>
  );
}
