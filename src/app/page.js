"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useExamState } from "../hooks/useExamState";
import StartScreen from "../components/StartScreen";

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

  // RESTORED: All your original DevAdminPanel props with safety fallbacks
  const adminPanel = (
    <DevAdminPanel
      isDevMode={state.isDevMode}
      setIsLocked={state.setIsLocked}
      handleFinishExam={state.handleFinishExam}
      handleSimulateCorrect={() => {
        if (state.handleSimulateCorrect) {
          state.handleSimulateCorrect(() =>
            state.resetQuestionTimer ? state.resetQuestionTimer() : null,
          );
        }
      }}
      handleTryHarder={() => {
        if (state.handleTryHarder) {
          state.handleTryHarder(() =>
            state.resetQuestionTimer ? state.resetQuestionTimer() : null,
          );
        }
      }}
      canTriggerHarder={state.canTriggerHarder || false}
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

  if (!state.examStarted) {
    return (
      <StartScreen
        setIsAdminMode={state.setIsAdminMode}
        availableSections={state.availableSections}
        onJoinSuccess={(name, code, uid, section) => {
          state.setCustomStudentName(name);
          state.setSessionCodeInput(code);
          state.setSelectedSection(section);
          if (state.setStudent) {
            state.setStudent({ name, uid, section });
          }
          state.handleVerifyAndStart(code, section);
        }}
      >
        {adminPanel}
      </StartScreen>
    );
  }

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
        studentAnswers={state.studentAnswers}
        demerits={state.demerits}
      >
        {adminPanel}
      </FinishedScreen>
    );
  }

  // ==========================================================
  // THE FATAL CRASH FIX
  // All 20+ original props are back and safely mapped.
  // ==========================================================
  return (
    <ActiveExamScreen
      currentQ={state.currentQ || state.getCurrentQuestion?.() || null}
      questionsAttempted={state.questionsAttempted || 0}
      formatTime={state.formatTime}
      timeLeft={state.timeLeft}
      showBehaviorMenu={state.showBehaviorMenu}
      setShowBehaviorMenu={state.setShowBehaviorMenu}
      setDemerits={state.setDemerits}
      demerits={state.demerits}
      currentInput={state.currentInput}
      handlePadClick={state.handlePadClick}
      handleBackspace={state.handleBackspace}
      handleClear={state.handleClear}
      // RESTORED: Your original timer-based calculation for the end button
      showEndExamButton={
        state.EXAM_DURATION - state.timeLeft >= state.SHOW_END_BUTTON_AFTER
      }
      handleFinishExam={state.handleFinishExam}
      handleSubmitQuestion={() => {
        state.handleSubmitQuestion();
        if (state.resetQuestionTimer) state.resetQuestionTimer();
      }}
      handlePassQuestion={() => {
        state.handlePassQuestion();
        if (state.resetQuestionTimer) state.resetQuestionTimer();
      }}
      // RESTORED: Missing dev/teacher props that caused the crash
      handleTryHarder={() => {
        if (state.handleTryHarder) state.handleTryHarder();
      }}
      handleSimulateCorrect={() => {
        if (state.handleSimulateCorrect) state.handleSimulateCorrect();
      }}
      secondsOnCurrentQuestion={state.secondsOnCurrentQuestion || 0}
      canTriggerHarder={state.canTriggerHarder || false}
      isTeacherTesting={state.isTeacher}
      isSaving={state.isSaving}
      handleNinjaDoubleTime={state.handleNinjaDoubleTime}
      handleNinjaOneMinute={state.handleNinjaOneMinute}
    >
      {adminPanel}
    </ActiveExamScreen>
  );
}
