import TeacherSubmissionsViewer from "../TeacherSubmissionsViewer";
import InlineQuestionEditor from "./InlineQuestionEditor";
import React from "react";
import SessionGeneratorCard from "../SessionGeneratorCard";
import GradebookSummaryCard from "../GradebookSummaryCard";
import ThemeToggle from "../ThemeToggle";

export default function OverviewTab({
  session,
  availableSections,
  handleOpenGradebook,
  setIsViewingWhiteboard,
  setIsViewingImageHub,
  activeSection,
  themeState,
  handleThemeBroadcast,
  themeMessage,
}) {
  return (
    <div className="w-full max-w-4xl flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Student Submissions Hub */}
      <div className="mb-6">
        <TeacherSubmissionsViewer />
      </div>
    
      <div className="flex w-full flex-wrap justify-center gap-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="flex flex-col justify-between bg-[var(--app-surface)] border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-emerald-400 outline-dark-text">Live Whiteboard</h3>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">Live Stream</span>
            </div>
            <p className="text-sm opacity-75 mb-6">Monitor student work in real time, compare scratchpads side-by-side, or project to class.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsViewingWhiteboard(true)}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            Open Whiteboard Monitor →
          </button>
        </div>

        <div className="flex flex-col justify-between bg-[var(--app-surface)] border border-purple-500/30 rounded-2xl p-6 shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-purple-400 outline-dark-text">Class Visuals Hub</h3>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/60">Paste & Share</span>
            </div>
            <p className="text-sm opacity-75 mb-6">Paste anchor charts (Cmd+V), diagrams, or textbook screenshots to broadcast to student devices.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsViewingImageHub(true)}
            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            Open Visuals Hub →
          </button>
        </div>
      </div>

      <section className="w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-xl" aria-labelledby="theme-controls-title">
        <h2 id="theme-controls-title" className="text-lg font-bold mb-3">
          Theme Enforcement
        </h2>
        <p className="text-sm opacity-75 mb-4">
          Broadcast the selected theme to active students in Section {activeSection || "All"}.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <ThemeToggle theme={themeState.theme} changeTheme={themeState.changeTheme} />
          <button type="button" onClick={() => handleThemeBroadcast(true)} className="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-500 cursor-pointer">
            Lock Theme
          </button>
          <button type="button" onClick={() => handleThemeBroadcast(false)} className="rounded-lg bg-slate-600 px-4 py-2 font-bold text-white hover:bg-slate-500 cursor-pointer">
            Release Lock
          </button>
        </div>
        {themeMessage && <p role="status" className="mt-3 text-sm text-emerald-300">{themeMessage}</p>}
      </section>
    </div>
  );
}
