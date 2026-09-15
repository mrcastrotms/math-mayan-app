"use client";
import { useEffect, useState } from "react";
import ParentReportView from "../components/ParentReportView";

// NOTE: Adjust these import paths if your folders are named differently!
import { useExamState } from "../hooks/useExamState";
import DevAdminPanel from "../components/DevAdminPanel";
import TeacherDashboard from "../components/TeacherDashboard";
import LockedScreen from "../components/LockedScreen";
import StartScreen from "../components/StartScreen";
import FinishedScreen from "../components/FinishedScreen";
import ActiveExamScreen from "../components/ActiveExamScreen";

export default function ExamApp() {
  // 1. QR CODE SCANNER LOGIC (Must be inside the main component, above the state)
  const [scannedReportId, setScannedReportId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("report")) {
        setScannedReportId(urlParams.get("report"));
      }
    }
  }, []);

  // 2. LOAD EXAM STATE
  const state = useExamState();

  // 3. IF SCANNED, ONLY SHOW THE PARENT VIEW (BYPASS LOGIN COMPLETELY)
  if (scannedReportId) {
    return <ParentReportView reportId={scannedReportId} />;
  }

  // 4. NORMAL APP LOGIC REMAINS EXACTLY THE SAME BELOW
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

  if (!state.examStarted) {
    return (
      <StartScreen
        student={state.student}
        setIsAdminMode={state.setIsAdminMode}
        selectedSection={state.selectedSection}
        setSelectedSection={state.setSelectedSection}
        sessionCodeInput={state.sessionCodeInput}
        setSessionCodeInput={state.setSessionCodeInput}
        handleVerifyAndStart={state.handleVerifyAndStart}
        isValidatingCode={state.isValidatingCode}
        handleLogin={state.handleLogin}
        availableSections={state.availableSections}
        customStudentName={state.customStudentName}
        setCustomStudentName={state.setCustomStudentName}
        isTeacher={state.isTeacher}
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
