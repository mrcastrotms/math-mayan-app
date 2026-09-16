"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useExamState } from "../hooks/useExamState";
import StartScreen from "../components/StartScreen";

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

export default function ExamApp() {
  const [scannedReportId, setScannedReportId] = useState(null);
  const [urlBypass, setUrlBypass] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("report")) {
        setScannedReportId(urlParams.get("report"));
      }
      if (urlParams.get("bypass") === "true") {
        setUrlBypass(true);
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
        setIsAdminMode={state.isAdminMode}
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

  if (!state.examStarted && !urlBypass) {
    return (
      <StartScreen
        setIsAdminMode={state.isAdminMode}
        availableSections={state.availableSections}
        onJoinSuccess={(name, code, uid, section) => {
          state.setCustomStudentName(name);
          state.setSessionCodeInput(code);
          state.setSelectedSection(section);
          if (state.setStudent) {
            state.setStudent({ name, uid, section });
          }

          if (code === "00000") {
            window.location.href = "/?bypass=true";
          } else {
            state.handleVerifyAndStart(code, section);
          }
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

  return (
    <ActiveExamScreen
      question={
        state.currentQ ||
        state.getCurrentQuestion?.() || { question: "Sample Test Question 1" }
      }
      questionIndex={state.currentQuestionIndex || 0}
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
      showEndExamButton={
        (state.EXAM_DURATION || 300) - (state.timeLeft || 300) >=
        (state.SHOW_END_BUTTON_AFTER || 60)
      }
      handleFinishExam={state.handleFinishExam}
      handleSubmitQuestion={() => {
        if (state.handleSubmitQuestion) state.handleSubmitQuestion();
        if (state.resetQuestionTimer) state.resetQuestionTimer();
      }}
      handlePassQuestion={() => {
        if (state.handlePassQuestion) state.handlePassQuestion();
        if (state.resetQuestionTimer) state.resetQuestionTimer();
      }}
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
