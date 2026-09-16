"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useExamState } from "../hooks/useExamState";
import StudentLogin from "../components/StudentLogin"; // <-- Swapped StartScreen for this

// =====================================================================
// DYNAMIC IMPORTS (LAZY LOADING)
// =====================================================================
const ParentReportView = dynamic(
  () => import("../components/ParentReportView"),
  {
    loading: () => (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-xl font-bold animate-pulse text-slate-400">
          Loading Report...
        </p>
      </div>
    ),
  },
);

const TeacherDashboard = dynamic(
  () => import("../components/TeacherDashboard"),
  {
    loading: () => (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-xl font-bold animate-pulse text-blue-400">
          Loading Teacher Tools...
        </p>
      </div>
    ),
  },
);

const ActiveExamScreen = dynamic(
  () => import("../components/ActiveExamScreen"),
  {
    loading: () => (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-xl font-bold animate-pulse text-blue-600">
          Preparing Assessment...
        </p>
      </div>
    ),
  },
);

const FinishedScreen = dynamic(() => import("../components/FinishedScreen"));
const LockedScreen = dynamic(() => import("../components/LockedScreen"));
const DevAdminPanel = dynamic(() => import("../components/DevAdminPanel"));
// =====================================================================

export default function ExamApp() {
  const [scannedReportId, setScannedReportId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("report")) {
        setScannedReportId(urlParams.get("report"));
      }
    }
  }, []);

  const state = useExamState();

  if (scannedReportId) {
    return <ParentReportView reportId={scannedReportId} />;
  }

  const adminPanel = (
    <DevAdminPanel
      isDevMode={state.isDevMode}
      setIsLocked={state.setIsLocked}
      handleFinishExam={state.handleFinishExam}
      handleSimulateCorrect={() =>
        state.handleSimulateCorrect(() =>
          state.resetQuestionTimer ? state.resetQuestionTimer() : null,
        )
      }
      handleTryHarder={() =>
        state.handleTryHarder(() =>
          state.resetQuestionTimer ? state.resetQuestionTimer() : null,
        )
      }
      canTriggerHarder={state.canTriggerHarder}
    />
  );

  if (state.isAdminMode) {
    return (
      <TeacherDashboard
        setIsAdminMode={state.setIsAdminMode}
        availableSections={state.availableSections}
        setAvailableSections={state.setAvailableSections}
        appText={state.appText}
        setAppText={state.setAppText}
      />
    );
  }

  if (state.isLocked) {
    return (
      <LockedScreen
        overrideCode={state.overrideCode}
        setOverrideCode={state.setOverrideCode}
        handleUnlock={state.handleUnlock}
      >
        {adminPanel}
      </LockedScreen>
    );
  }

  // =====================================================================
  // NEW LOGIN FLOW (Bypasses Google, mounts instantly)
  // =====================================================================
  if (!state.examStarted) {
    return (
      <StudentLogin
        setIsAdminMode={state.setIsAdminMode}
        onJoinSuccess={(name, code, uid) => {
          // Pipe the entered info back into your hook state
          state.setCustomStudentName(name);
          state.setSessionCodeInput(code);
          // If you have a specific student ID tracking in state, set it here
          if (state.setStudent) {
            state.setStudent({ name, uid });
          }
          // Fire your existing hook logic to officially mount the exam view
          state.handleVerifyAndStart();
        }}
      />
    );
  }
  // =====================================================================

  if (state.examFinished) {
    return (
      <FinishedScreen
        student={state.student}
        selectedSection={state.selectedSection}
        finalScore={
          state.calculateFinalScore ? state.calculateFinalScore() : 70
        }
        isSaving={state.isSaving}
        handleTryAgain={state.handleTryAgain}
      >
        {adminPanel}
      </FinishedScreen>
    );
  }

  return (
    <ActiveExamScreen
      currentQ={state.getCurrentQuestion()}
      questionsAttempted={state.questionsAttempted}
      formatTime={state.formatTime}
      timeLeft={state.timeLeft}
      showBehaviorMenu={state.showBehaviorMenu}
      setShowBehaviorMenu={state.setShowBehaviorMenu}
      setDemerits={state.setDemerits}
      demerits={state.demerits}
      currentInput={state.currentInput}
      handlePadClick={(v) => state.setCurrentInput((p) => p + v)}
      handleBackspace={() => state.setCurrentInput((p) => p.slice(0, -1))}
      handleClear={() => state.setCurrentInput("")}
      showEndExamButton={
        state.EXAM_DURATION - state.timeLeft >= state.SHOW_END_BUTTON_AFTER
      }
      handleFinishExam={state.handleFinishExam}
      handleSubmitQuestion={() =>
        state.handleSubmitQuestion(() =>
          state.resetQuestionTimer ? state.resetQuestionTimer() : null,
        )
      }
      handlePassQuestion={() =>
        state.handlePassQuestion(() =>
          state.resetQuestionTimer ? state.resetQuestionTimer() : null,
        )
      }
      handleTryHarder={() =>
        state.handleTryHarder(() =>
          state.resetQuestionTimer ? state.resetQuestionTimer() : null,
        )
      }
      handleSimulateCorrect={() =>
        state.handleSimulateCorrect(() =>
          state.resetQuestionTimer ? state.resetQuestionTimer() : null,
        )
      }
      secondsOnCurrentQuestion={state.secondsOnCurrentQuestion}
      canTriggerHarder={state.canTriggerHarder}
      isTeacherTesting={state.isTeacherTesting}
    >
      {adminPanel}
    </ActiveExamScreen>
  );
}
