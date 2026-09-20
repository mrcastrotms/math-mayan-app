import React, { useState } from "react";
import YouTubeHubView from "./YouTubeHubView";
import MayansPortalView from "./MayansPortalView";
import ZearnHubView from "./ZearnHubView";
import { useAppTheme } from "../hooks/useAppTheme";
import ThemeToggle from "./ThemeToggle";
import { useAssignedWorks } from "../hooks/useAssignedWorks";
import AssignedWorkPanel from "./AssignedWorkPanel";
import WorksheetWorkspace from "./WorksheetWorkspace";

export default function StudentHome({ studentName, section, onSelectMode, themeState }) {
  const localThemeState = useAppTheme();
  const activeThemeState = themeState || localThemeState;
  const [currentView, setCurrentView] = useState("menu");
  const [selectedWork, setSelectedWork] = useState(null);
  const { works, error: assignedWorkError } = useAssignedWorks(section);

  const handleResetSession = () => {
    if (typeof window !== "undefined") {
      const resetCount = parseInt(localStorage.getItem("session_resets") || "0", 10);
      const forceLogout = () => {
        const savedResets = localStorage.getItem("session_resets");
        localStorage.clear();
        sessionStorage.clear();
        if (savedResets) localStorage.setItem("session_resets", savedResets);
        window.location.href = "/";
      };
      if (resetCount >= 2) {
        const override = prompt("Session reset limit reached. Ask Mr. Castro to enter the override PIN:");
        if (override === "4040") {
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
        student={{ name: studentName, section, uid: typeof window !== "undefined" ? localStorage.getItem("exam_device_uuid") : "" }}
        onBack={() => setSelectedWork(null)}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--app-bg)] text-[var(--app-fg)]">
      <div className="max-w-2xl w-full p-6 sm:p-10 bg-[var(--app-surface)] rounded-xl shadow-lg border border-[var(--app-border)] text-center relative">
        <div className="absolute top-4 left-4">
          <ThemeToggle
            theme={activeThemeState.theme}
            changeTheme={activeThemeState.changeTheme}
            disabled={activeThemeState.themeLocked}
          />
        </div>
        {activeThemeState.themeLocked && (
          <p role="status" className="text-xs font-semibold text-amber-700 mb-3">
            Theme locked by teacher
          </p>
        )}
        <button
          onClick={handleResetSession}
          className="absolute top-4 right-4 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 px-3 py-1.5 rounded-md border border-red-200 dark:border-red-900/50"
        >
          Reset Session
        </button>

        <h1 className="text-3xl font-bold mb-2 text-[var(--app-fg)]">
          Welcome, {studentName}!
        </h1>
        <p className="text-[var(--app-fg)] opacity-75 mb-8">
          Section: {section}
        </p>

        <div className="mb-8 text-left">
          <AssignedWorkPanel
            works={works}
            studentId={typeof window !== "undefined" ? localStorage.getItem("exam_device_uuid") : ""}
            onOpenWork={setSelectedWork}
          />
          {assignedWorkError && <p role="alert" className="mb-4 text-sm text-red-700">{assignedWorkError}</p>}
          <h2 className="text-lg font-semibold mb-4 text-[var(--app-fg)]">
            What do you want to do today?
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => onSelectMode("classwork")}
            className="min-h-[6rem] p-6 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-lg font-medium text-emerald-700 dark:text-emerald-300 transition-all text-left flex items-center justify-between gap-4 text-lg"
          >
            <div>
              <div className="font-bold">Classwork Practice</div>
              <div className="text-sm opacity-80">Interactive guided problems and scaffolds</div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-emerald-200 dark:bg-emerald-800 rounded-full">Interactive</span>
          </button>

          <button
            onClick={() => onSelectMode("exam")}
            data-testid="start-exam-button"
            className="min-h-[6rem] p-6 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg font-medium text-blue-700 dark:text-blue-300 transition-all text-left flex items-center justify-between gap-4 text-lg"
          >
            <div>
              <div className="font-bold">Timed Exam / Assessment</div>
              <div className="text-sm opacity-80">Secured test environment with timer and tracking</div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-blue-200 dark:bg-blue-800 rounded-full">Graded</span>
          </button>

          <button
            onClick={() => onSelectMode("studyguide")}
            className="min-h-[6rem] p-6 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 rounded-lg font-medium text-amber-700 dark:text-amber-300 transition-all text-left flex items-center justify-between gap-4 text-lg"
          >
            <div>
              <div className="font-bold">Study Guide and Review</div>
              <div className="text-sm opacity-80">Self-paced practice materials and concepts</div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-amber-200 dark:bg-amber-800 rounded-full">Review</span>
          </button>

          <button
            onClick={() => setCurrentView("mayans")}
            className="min-h-[6rem] p-6 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-lg font-medium text-indigo-700 dark:text-indigo-300 transition-all text-left flex items-center justify-between gap-4 text-lg"
          >
            <div>
              <div className="font-bold">Mayans Are Learning</div>
              <div className="text-sm opacity-80">Live Moodle course viewer & week switcher</div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-indigo-200 dark:bg-indigo-800 rounded-full">Portal</span>
          </button>

          <button
            onClick={() => setCurrentView("zearn")}
            className="min-h-[6rem] p-6 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 rounded-lg font-medium text-purple-700 dark:text-purple-300 transition-all text-left flex items-center justify-between gap-4 text-lg"
          >
            <div>
              <div className="font-bold">Zearn Math</div>
              <div className="text-sm opacity-80">Digital lessons, fluency drills & curriculum sprints</div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-purple-200 dark:bg-purple-800 rounded-full">Platform</span>
          </button>

          <button
            onClick={() => setCurrentView("youtube")}
            className="min-h-[6rem] p-6 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg font-medium text-red-700 dark:text-red-300 transition-all text-left flex items-center justify-between gap-4 text-lg"
          >
            <div>
              <div className="font-bold">YouTube Video Hub</div>
              <div className="text-sm opacity-80">Search and watch educational & intermission videos</div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-red-200 dark:bg-red-800 rounded-full">Video</span>
          </button>
        </div>
      </div>
    </div>
  );
}
