"use client";

import { useExamState } from "../hooks/useExamState";
import TeacherDashboard from "../components/TeacherDashboard";
import DevAdminPanel from "../components/DevAdminPanel";
import LockedScreen from "../components/LockedScreen";
import StartScreen from "../components/StartScreen";
import FinishedScreen from "../components/FinishedScreen";
import ActiveExamScreen from "../components/ActiveExamScreen";

export default function ExamApp() {
  const state = useExamState();

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
