import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import StartScreen from "./StartScreen";
import StudentHome from "./StudentHome";
import ActiveExamScreen from "./exam/ActiveExamScreen";

const ParentReportView = dynamic(() => import("./ParentReportView"));
const TeacherDashboard = dynamic(() => import("./TeacherDashboard"));
const FinishedScreen = dynamic(() => import("./FinishedScreen"));
const LockedScreen = dynamic(() => import("./LockedScreen"));

export default function ExamAppRouter({
  state, view, navigateTo, displaySections, isLoading, scannedReportId, onJoin, adminPanel
}) {
  const [isTeacherAuth, setIsTeacherAuth] = useState(false);

  useEffect(() => {
    if (view === "dashboard" && !isTeacherAuth) {
      const auth = window.sessionStorage.getItem("teacher_authorized");
      if (auth === "true") {
        setIsTeacherAuth(true);
      } else {
        setTimeout(() => {
          const pin = window.prompt("Enter Teacher PIN (0801):");
          if (pin === "0801") {
            window.sessionStorage.setItem("teacher_authorized", "true");
            setIsTeacherAuth(true);
          } else {
            navigateTo("start");
          }
        }, 100);
      }
    }
  }, [view, isTeacherAuth, navigateTo]);

  if (scannedReportId) return <ParentReportView reportId={scannedReportId} />;

  if (view === "dashboard") {
    if (!isTeacherAuth) return null;
    return (
      <TeacherDashboard
        setIsAdminMode={(val) => {
          state?.setIsAdminMode?.(val);
          if (!val) {
            window.sessionStorage.removeItem("teacher_authorized");
            setIsTeacherAuth(false);
            navigateTo("start");
          }
        }}
        availableSections={state?.availableSections || []}
        setAvailableSections={state?.setAvailableSections || (() => {})}
        appText={state?.appText || {}}
        setAppText={state?.setAppText || (() => {})}
      />
    );
  }

  if (state?.examFinished) {
    return (
      <FinishedScreen
        student={state?.student}
        selectedSection={state?.selectedSection || state?.student?.section}
        finalScore={state?.calculateFinalScore ? state.calculateFinalScore() : 70}
        isSaving={state?.isSaving}
        handleReturnHome={() => {
          state?.setExamFinished?.(false);
          state?.setExamStarted?.(false);
          state?.setCurrentQuestionIndex?.(0);
          state?.setStudentAnswers?.([]);
          navigateTo("student-home");
        }}
        studentAnswers={state?.studentAnswers}
        demerits={state?.demerits || 0}
      >
        {adminPanel}
      </FinishedScreen>
    );
  }

  if (view === "student-home" || (!state?.examStarted && state?.student?.name)) {
    return (
      <StudentHome
        studentName={state?.student?.name || "Student"}
        section={state?.selectedSection || state?.student?.section || "4A"}
        onSelectMode={(mode) => {
          if (mode === "exam") {
            state?.setExamDuration?.(45 * 60);
            state?.setTimeLeft?.(45 * 60);
            state?.setExamStarted?.(true);
            navigateTo("exam");
          } else if (mode === "classwork") navigateTo("classwork");
        }}
      />
    );
  }

  if (state?.examStarted || state?.isBypassActive || view === "exam") {
    return <ActiveExamScreen state={state} adminPanel={adminPanel} navigateTo={navigateTo} />;
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
