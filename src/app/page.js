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

  const [cachedSections, setCachedSections] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("math_app_sections");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
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

  useEffect(() => {
    if (state?.availableSections && state.availableSections.length > 0) {
      localStorage.setItem(
        "math_app_sections",
        JSON.stringify(state.availableSections),
      );
      if (!cachedSections) {
        setCachedSections(state.availableSections);
      }
    }
  }, [state?.availableSections, cachedSections]);

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
        setIsAdminMode={state?.setIsAdminMode} // ✅ Pass setter so you can exit back to start
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

  // Relying entirely on state.examStarted instead of a fragile url check
  if (state?.examStarted) {
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

  const displaySections = cachedSections ||
    state?.availableSections || ["4A", "4B", "4C", "4D", "4E", "5B"];
  const isActuallyLoading =
    !cachedSections &&
    (!state?.availableSections || state.availableSections.length === 0);

  return (
    <StartScreen
      setIsAdminMode={state?.setIsAdminMode} // ✅ Passing the actual function
      availableSections={displaySections}
      isLoading={isActuallyLoading}
      onJoinSuccess={(name, code, uid, section) => {
        state?.setCustomStudentName?.(name);
        state?.setSessionCodeInput?.(code);
        state?.setSelectedSection?.(section);
        if (state?.setStudent) {
          state.setStudent({ name, uid, section });
        }

        if (code === "00000") {
          // INFINITE LOOP FIX: Don't redirect if we are already in bypass mode!
          if (
            typeof window !== "undefined" &&
            !window.location.search.includes("bypass=true")
          ) {
            window.location.href = "/?bypass=true";
          } else {
            if (state?.setExamStarted) state.setExamStarted(true);
          }
        } else {
          state?.handleVerifyAndStart?.(code, section);
        }
      }}
    >
      {adminPanel}
    </StartScreen>
  );
}
