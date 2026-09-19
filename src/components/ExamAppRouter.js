// src/components/ExamAppRouter.js
import React from "react";
import dynamic from "next/dynamic";
import StartScreen from "./StartScreen";
import ActiveExamContainer from "./ActiveExamContainer";

const ParentReportView = dynamic(() => import("./ParentReportView"));
const TeacherDashboard = dynamic(() => import("./TeacherDashboard"));
const FinishedScreen = dynamic(() => import("./FinishedScreen"));
const LockedScreen = dynamic(() => import("./LockedScreen"));

export default function ExamAppRouter({
  state,
  view,
  navigateTo,
  displaySections,
  isLoading,
  scannedReportId,
  onJoin,
  adminPanel,
}) {
  if (scannedReportId) {
    return <ParentReportView reportId={scannedReportId} />;
  }

  if (view === "dashboard") {
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

  /* Locked screen handled globally by StudentLockOverlay */

  if (state?.examStarted || state?.isBypassActive || view === "exam") {
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
      onJoinSuccess={onJoin}
    >
      {adminPanel}
    </StartScreen>
  );
}
