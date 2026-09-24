import StudentWhiteboard from "./student/StudentWhiteboard";
import React, { useState } from "react";
import YouTubeHubView from "./YouTubeHubView";
import MayansPortalView from "./MayansPortalView";
import ZearnHubView from "./ZearnHubView";
import { useAppTheme } from "../hooks/useAppTheme";
import ThemeToggle from "./ThemeToggle";
import { useAssignedWorks } from "../hooks/useAssignedWorks";
import AssignedWorkPanel from "./AssignedWorkPanel";
import WorksheetWorkspace from "./WorksheetWorkspace";
import PinModal from "./PinModal";
import { useStudentAttendance } from "../hooks/useStudentAttendance";

export default function StudentHome({
  studentName,
  section,
  onSelectMode,
  onStartExam,
  themeState,
}) {
  const localThemeState = useAppTheme();
  const activeThemeState = themeState || localThemeState;
  const [currentView, setCurrentView] = useState("menu");
  const [selectedWork, setSelectedWork] = useState(null);
  const [showExamCode, setShowExamCode] = useState(false);
  const { works, error: assignedWorkError } = useAssignedWorks(section);
  useStudentAttendance({
    studentName,
    section,
    uid:
      typeof window !== "undefined"
        ? localStorage.getItem("exam_device_uuid")
        : "",
  });

  const handleResetSession = () => {
    if (typeof window !== "undefined") {
      const resetCount = parseInt(
        localStorage.getItem("session_resets") || "0",
        10,
      );
      const forceLogout = () => {
        const savedResets = localStorage.getItem("session_resets");
        localStorage.clear();
        sessionStorage.clear();
        if (savedResets) localStorage.setItem("session_resets", savedResets);
        window.location.href = "/";
      };
      if (resetCount >= 2) {
        const override = prompt(
          "Session reset limit reached. Ask Mr. Castro to enter the override PIN:",
        );
        if (["4040", "0801", "2026"].includes(override)) {
          forceLogout();
        } else if (override !== null) {
          alert("Incorrect PIN.");
        }
        return;
      }
      localStorage.setItem("session_resets", (resetCount + 1).toString());
      forceLogout();
    }
  };

  if (currentView === "whiteboard") {
    const deviceUid = typeof window !== "undefined" ? localStorage.getItem("exam_device_uuid") || "anonymous" : "anonymous";
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <StudentWhiteboard 
          studentId={deviceUid} 
          sectionId={section} 
          studentName={studentName} 
          onBack={() => setCurrentView("menu")} 
        />
      </div>
    );
  }

  if (currentView === "youtube") {
    return <YouTubeHubView onBack={() => setCurrentView("menu")} />;
  }

  if (currentView === "mayans") {
    return (
      <MayansPortalView
        onBack={() => setCurrentView("menu")}
        studentName={studentName}
        section={section}
      />
    );
  }

  if (currentView === "zearn") {
    return <ZearnHubView onBack={() => setCurrentView("menu")} />;
  }

  if (selectedWork) {
    return (
      <WorksheetWorkspace
        worksheet={selectedWork}
        student={{
          name: studentName,
          section,
          uid:
            typeof window !== "undefined"
              ? localStorage.getItem("exam_device_uuid")
              : "",
        }}
        onBack={() => setSelectedWork(null)}
      />
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[var(--app-bg)] pb-24 text-[var(--app-fg)] sm:flex sm:items-center sm:justify-center sm:p-8 sm:pb-8">
      <div className="w-full min-w-0 max-w-4xl p-4 sm:p-0">
        <div className="mb-4 hidden flex-col gap-3 sm:flex sm:flex-row sm:items-center sm:justify-between">
          <ThemeToggle
            theme={activeThemeState.theme}
            changeTheme={activeThemeState.changeTheme}
            disabled={activeThemeState.themeLocked}
          />
          <div className="flex flex-col items-start gap-2 sm:items-end">
            {activeThemeState.themeLocked && (
              <p role="status" className="text-xs font-semibold text-amber-700">
                Theme locked by teacher
              </p>
            )}
            <button
              onClick={handleResetSession}
              className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 px-3 py-2 rounded-md border border-red-200 dark:border-red-900/50"
            >
              Reset Session
            </button>
          </div>
        </div>

        <div
          data-testid="student-welcome-card"
          className="min-h-[42rem] w-full min-w-0 overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 text-center shadow-lg sm:p-12"
        >
          <h1 className="text-3xl font-bold mb-2 text-[var(--app-fg)]">
            Welcome, {studentName}
          </h1>
          <p className="text-[var(--app-fg)] opacity-75 mb-8">
            Grade: {section}
          </p>

          <div className="mb-8 text-left">
            <AssignedWorkPanel
              works={works}
              studentId={
                typeof window !== "undefined"
                  ? localStorage.getItem("exam_device_uuid")
                  : ""
              }
              onOpenWork={setSelectedWork}
            />
            {assignedWorkError && (
              <p role="alert" className="mb-4 text-sm text-red-700">
                {assignedWorkError}
              </p>
            )}
            <h2 className="text-lg font-semibold mb-4 text-[var(--app-fg)]">
              What do you want to do today?
            </h2>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4">
            <button
              onClick={() => onSelectMode("classwork")}
              className="flex min-h-[6rem] min-w-0 items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-left text-lg font-medium text-emerald-700 transition-all hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50 sm:p-6"
            >
              <div className="min-w-0 break-words">
                <div className="font-bold">Classwork Practice</div>
                <div className="text-sm opacity-80">
                  Interactive guided problems and scaffolds
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-200 px-2.5 py-1 text-xs dark:bg-emerald-800">
                Interactive
              </span>
            </button>

            <button
              onClick={() => {
                const isBypass =
                  typeof window !== "undefined" &&
                  window.location.search.includes("bypass=true");
                if (isBypass) {
                  onSelectMode?.("exam");
                } else {
                  setShowExamCode(true);
                }
              }}
              data-testid="start-exam-button"
              className="flex min-h-[6rem] min-w-0 items-center justify-between gap-4 rounded-lg border border-blue-200 bg-blue-50 p-5 text-left text-lg font-medium text-blue-700 transition-all hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-900/50 sm:p-6"
            >
              <div className="min-w-0 break-words">
                <div className="font-bold">Exam</div>
                <div className="text-sm opacity-80">
                  Secured test environment with timer and tracking
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-blue-200 px-2.5 py-1 text-xs dark:bg-blue-800">
                Graded
              </span>
            </button>

            <button
              onClick={() => onSelectMode("studyguide")}
              className="flex min-h-[6rem] min-w-0 items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 p-5 text-left text-lg font-medium text-amber-700 transition-all hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-900/50 sm:p-6"
            >
              <div className="min-w-0 break-words">
                <div className="font-bold">Study Guide and Review</div>
                <div className="text-sm opacity-80">
                  Self-paced practice materials and concepts
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-amber-200 px-2.5 py-1 text-xs dark:bg-amber-800">
                Review
              </span>
            </button>

            <button
              onClick={() => setCurrentView("mayans")}
              className="flex min-h-[6rem] min-w-0 items-center justify-between gap-4 rounded-lg border border-indigo-200 bg-indigo-50 p-5 text-left text-lg font-medium text-indigo-700 transition-all hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 sm:p-6"
            >
              <div className="min-w-0 break-words">
                <div className="font-bold">Mayans Are Learning</div>
                <div className="text-sm opacity-80">
                  Live Moodle course viewer & week switcher
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-indigo-200 px-2.5 py-1 text-xs dark:bg-indigo-800">
                Portal
              </span>
            </button>

            <button
              onClick={() => setCurrentView("zearn")}
              className="flex min-h-[6rem] min-w-0 items-center justify-between gap-4 rounded-lg border border-purple-200 bg-purple-50 p-5 text-left text-lg font-medium text-purple-700 transition-all hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-300 dark:hover:bg-purple-900/50 sm:p-6"
            >
              <div className="min-w-0 break-words">
                <div className="font-bold">Zearn Math</div>
                <div className="text-sm opacity-80">
                  Digital lessons, fluency drills & curriculum sprints
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-purple-200 px-2.5 py-1 text-xs dark:bg-purple-800">
                Platform
              </span>
            </button>

            <button
              onClick={() => setCurrentView("youtube")}
              className="flex min-h-[6rem] min-w-0 items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-5 text-left text-lg font-medium text-red-700 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/50 sm:p-6"
            >
              <div className="min-w-0 break-words">
                <div className="font-bold">YouTube Video Hub</div>
                <div className="text-sm opacity-80">
                  Search and watch educational & intermission videos
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-red-200 px-2.5 py-1 text-xs dark:bg-red-800">
                Video
              </span>
            </button>

            <button
              onClick={() => setCurrentView("whiteboard")}
              className="flex min-h-[6rem] min-w-0 items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-left text-lg font-medium text-emerald-700 transition-all hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50 sm:p-6"
            >
              <div className="min-w-0 break-words">
                <div className="font-bold">Live Math Scratchpad</div>
                <div className="text-sm opacity-80">
                  Interactive grid canvas for sketching models and work
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-200 px-2.5 py-1 text-xs dark:bg-emerald-800">
                Whiteboard
              </span>
            </button>
          </div>
          <nav
            aria-label="Mobile student controls"
            className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 gap-1 border-t border-[var(--app-border)] bg-[var(--app-surface)]/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.15)] backdrop-blur sm:hidden"
          >
            {[
              ["default", "Standard"],
              ["dark", "Dark"],
              ["sepia", "Sepia"],
              ["contrast", "Contrast"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                disabled={activeThemeState.themeLocked}
                aria-label={label}
                aria-pressed={activeThemeState.theme === value}
                onClick={() => activeThemeState.changeTheme(value)}
                className="min-w-0 rounded-lg px-1 py-2 text-[10px] font-bold text-[var(--app-fg)] disabled:opacity-50"
              >
                <span className="block truncate">{label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={handleResetSession}
              className="min-w-0 rounded-lg px-1 py-2 text-[10px] font-bold text-red-600"
            >
              <span className="block truncate">Reset</span>
            </button>
          </nav>
          <PinModal
            isOpen={showExamCode}
            onClose={() => setShowExamCode(false)}
            title="Enter Session Code"
            description="Enter the five-character code your teacher generated for this exam."
            placeholder="ABCDE"
            onSubmit={async (code) => onStartExam?.(code)}
          />
        </div>
      </div>
    </div>
  );
}
