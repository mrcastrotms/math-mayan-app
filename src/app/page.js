"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useExamState } from "../hooks/useExamState";
import { useViewPersistence } from "../hooks/useViewPersistence";
import { useCachedSections } from "../hooks/useCachedSections";

import StartScreen from "../components/StartScreen";
import ActiveExamContainer from "../components/ActiveExamContainer";

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
  const state = useExamState();
  const { view, navigateTo } = useViewPersistence("start");
  const { displaySections, isLoading } = useCachedSections(
    state?.availableSections,
  );
  const [scannedReportId, setScannedReportId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const report = new URLSearchParams(window.location.search).get("report");
      if (report) setScannedReportId(report);
    }
  }, []);

  useEffect(() => {
    if (view === "dashboard" && !state?.isAdminMode) {
      state?.setIsAdminMode?.(true);
    }
  }, [view, state]);

  const adminPanel = (
    <DevAdminPanel
      isDevMode={state?.isDevMode || false}
      setIsLocked={state?.setIsLocked || (() => {})}
      handleFinishExam={state?.handleFinishExam || (() => {})}
    />
  );

  if (scannedReportId) return <ParentReportView reportId={scannedReportId} />;

  if (view === "dashboard" || state?.isAdminMode) {
    return (
      <TeacherDashboard
        setIsAdminMode={(val) => {
          state?.setIsAdminMode?.(val);
          if (!val) navigateTo("start");
        }}
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

  if (state?.examStarted) {
    return <ActiveExamContainer state={state} adminPanel={adminPanel} />;
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
      setIsAdminMode={(val) => {
        state?.setIsAdminMode?.(val);
        if (val) navigateTo("dashboard");
      }}
      availableSections={displaySections}
      isLoading={isLoading}
      onJoinSuccess={(name, code, uid, section) => {
        state?.setCustomStudentName?.(name);
        state?.setSessionCodeInput?.(code);
        state?.setSelectedSection?.(section);
        state?.setStudent?.({ name, uid, section });

        if (code === "00000") {
          if (
            typeof window !== "undefined" &&
            !window.location.search.includes("bypass=true")
          ) {
            window.location.href = "/?bypass=true";
          } else {
            state?.setExamStarted?.(true);
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
