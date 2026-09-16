"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useExamState } from "../hooks/useExamState";
import StartScreen from "../components/StartScreen";
import ActiveExamScreen from "../components/ActiveExamScreen";

const ParentReportView = dynamic(
  () => import("../components/ParentReportView"),
);
const TeacherDashboard = dynamic(
  () => import("../components/TeacherDashboard"),
);
const FinishedScreen = dynamic(() => import("../components/FinishedScreen"));
const LockedScreen = dynamic(() => import("../components/LockedScreen"));
const DevAdminPanel = dynamic(() => import("../components/DevAdminPanel"));

export default function ExamApp() {
  const [scannedReportId, setScannedReportId] = useState(null);

  // Synchronous initial check so urlBypass is true on the very first render pass
  const [urlBypass, setUrlBypass] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        new URLSearchParams(window.location.search).get("bypass") === "true"
      );
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("report")) {
        setScannedReportId(params.get("report"));
      }
    }
  }, []);

  const state = useExamState();

  if (scannedReportId) {
    return <ParentReportView reportId={scannedReportId} />;
  }

  const adminPanel = (
    <DevAdminPanel
      isDevMode={state?.isDevMode || false}
      setIsLocked={state?.setIsLocked || (() => {})}
      handleFinishExam={state?.handleFinishExam || (() => {})}
    />
  );

  if (state?.isAdminMode) {
    return (
      <TeacherDashboard
        setIsAdminMode={state.isAdminMode}
        availableSections={state?.availableSections || []}
        setAvailableSections={state?.setAvailableSections || (() => {})}
        appText={state?.appText || {}}
        setAppText={state?.setAppText || (() => {})}
      />
    );
  }

  if (state?.isLocked) {
    return (
      <LockedScreen
        overrideCode={state?.overrideCode || ""}
        setOverrideCode={state?.setOverrideCode || (() => {})}
        handleUnlock={state?.handleUnlock || (() => {})}
      >
        {adminPanel}
      </LockedScreen>
    );
  }

  if (urlBypass || state?.examStarted) {
    return (
      <ActiveExamScreen
        question={
          state?.currentQ ||
          state?.getCurrentQuestion?.() || {
            question: "Sample Test Question 1",
          }
        }
        questionIndex={state?.currentQuestionIndex || 0}
        questionsAttempted={state?.questionsAttempted || 0}
        formatTime={
          state?.formatTime ||
          ((s) => `${Math.floor(s / 60)}:${s % 60 < 10 ? "0" : ""}${s % 60}`)
        }
        timeLeft={state?.timeLeft || 300}
        showBehaviorMenu={state?.showBehaviorMenu || false}
        setShowBehaviorMenu={state?.setShowBehaviorMenu || (() => {})}
        setDemerits={state?.setDemerits || (() => {})}
        demerits={state?.demerits || 0}
        currentInput={state?.currentInput || ""}
        handlePadClick={state?.handlePadClick || (() => {})}
        handleBackspace={state?.handleBackspace || (() => {})}
        handleClear={state?.handleClear || (() => {})}
        showEndExamButton={true}
        handleFinishExam={state?.handleFinishExam || (() => {})}
        handleSubmitQuestion={state?.handleSubmitQuestion || (() => {})}
        handlePassQuestion={state?.handlePassQuestion || (() => {})}
        handleTryHarder={state?.handleTryHarder || (() => {})}
        handleSimulateCorrect={state?.handleSimulateCorrect || (() => {})}
        secondsOnCurrentQuestion={state?.secondsOnCurrentQuestion || 0}
        canTriggerHarder={state?.canTriggerHarder || false}
        isTeacherTesting={state?.isTeacher || false}
        isSaving={state?.isSaving || false}
        handleNinjaDoubleTime={state?.handleNinjaDoubleTime || (() => {})}
        handleNinjaOneMinute={state?.handleNinjaOneMinute || (() => {})}
      >
        {adminPanel}
      </ActiveExamScreen>
    );
  }

  if (state?.examFinished) {
    return (
      <FinishedScreen
        student={state?.student}
        selectedSection={state?.selectedSection}
        finalScore={
          state?.calculateFinalScore ? state.calculateFinalScore() : 70
        }
        isSaving={state?.isSaving}
        handleTryAgain={state?.handleTryAgain}
        studentAnswers={state?.studentAnswers}
        demerits={state?.demerits || 0}
      >
        {adminPanel}
      </FinishedScreen>
    );
  }

  return (
    <StartScreen
      setIsAdminMode={state?.isAdminMode}
      availableSections={
        state?.availableSections || ["4A", "4B", "4C", "4D", "4E", "5B"]
      }
      // Pass loading flag from your state hook (defaults to false if hook doesn't track it yet)
      isLoading={state?.isSectionsLoading || false}
      onJoinSuccess={(name, code, uid, section) => {
        state?.setCustomStudentName?.(name);
        state?.setSessionCodeInput?.(code);
        state?.setSelectedSection?.(section);
        if (state?.setStudent) {
          state.setStudent({ name, uid, section });
        }

        if (code === "00000") {
          window.location.href = "/?bypass=true";
        } else {
          state?.handleVerifyAndStart?.(code, section);
        }
      }}
    >
      {adminPanel}
    </StartScreen>
  );
}
