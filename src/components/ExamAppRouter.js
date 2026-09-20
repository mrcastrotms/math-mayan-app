"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import StartScreen from "./StartScreen";
import StudentHome from "./StudentHome";
import ActiveExamScreen from "./exam/ActiveExamScreen";
import PinModal from "./PinModal";

const ParentReportView = dynamic(() => import("./ParentReportView"));
const TeacherDashboard = dynamic(() => import("./TeacherDashboard"));
const FinishedScreen = dynamic(() => import("./FinishedScreen"));
const LockedScreen = dynamic(() => import("./LockedScreen"));

export default function ExamAppRouter({
  state, view, navigateTo, displaySections, isLoading, scannedReportId, onJoin, adminPanel, themeState
}) {
  const [isTeacherAuth, setIsTeacherAuth] = useState(false);
  const [showTeacherLogin, setShowTeacherLogin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsTeacherAuth(window.sessionStorage.getItem("teacher_authorized") === "true");
    }
  }, [view]);

  if (scannedReportId) return <ParentReportView reportId={scannedReportId} />;

  if (view === "dashboard") {
    if (!isTeacherAuth) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-sm w-full text-center">
            <h2 className="text-2xl font-bold mb-6">Teacher Access</h2>
            <button
              onClick={() => setShowTeacherLogin(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mb-4 transition-colors"
            >
              Unlock Dashboard
            </button>
            <PinModal
              isOpen={showTeacherLogin}
              onClose={() => setShowTeacherLogin(false)}
              title="Teacher Login"
              description="Enter the teacher access code to open the dashboard."
              placeholder="Teacher code"
              onSubmit={(pin) => {
                if (!["0801", "2026"].includes(pin.trim())) return false;
                window.sessionStorage.setItem("teacher_authorized", "true");
                setIsTeacherAuth(true);
                return true;
              }}
            />
            <button 
              onClick={() => navigateTo("start")}
              className="text-gray-400 hover:text-white underline"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }
    
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
        themeState={themeState}
        onStudentVersion={() => {
          window.sessionStorage.removeItem("teacher_authorized");
          window.sessionStorage.removeItem("exam_active_view");
          setIsTeacherAuth(false);
          state?.setIsAdminMode?.(false);
          state?.setExamStarted?.(false);
          state?.setExamFinished?.(false);
          navigateTo("start");
        }}
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
        themeState={themeState}
      />
    );
  }

  if (state?.examStarted || state?.isBypassActive || view === "exam") {
    return <ActiveExamScreen state={state} adminPanel={adminPanel} navigateTo={navigateTo} themeState={themeState} />;
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
      themeState={themeState}
    >
      {adminPanel}
    </StartScreen>
  );
}
