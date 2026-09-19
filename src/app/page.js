"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useExamState } from "../hooks/useExamState";
import { useViewPersistence } from "../hooks/useViewPersistence";
import { useCachedSections } from "../hooks/useCachedSections";
import { useLiveClassroomSync } from "../hooks/useLiveClassroomSync";
import { useExamBypass } from "../hooks/useExamBypass";
import {
  logKickedStudent,
  cleanStudentSession,
} from "../services/liveSyncService";
import { handleStudentJoin } from "../utils/studentSessionManager";
import ExamAppRouter from "../components/ExamAppRouter";
import StudentLockOverlay from "../components/StudentLockOverlay";
import PinModal from "../components/PinModal";

const DevAdminPanel = dynamic(() => import("../components/DevAdminPanel"), {
  ssr: false,
});

const ExamGate = dynamic(() => import("../components/ExamGate"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-slate-900" />,
});

export default function ExamApp() {
  const router = useRouter();
  const state = useExamState();
  const { view, navigateTo } = useViewPersistence("start");
  const { displaySections, isLoading } = useCachedSections(
    state?.availableSections,
  );
  const [mounted, setMounted] = useState(false);
  const [isTeacherPinOpen, setIsTeacherPinOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mounted || view !== "exam") return;

    if (state?.isTesterMode) return;

    const enforceLock = () => {
      if (!document.fullscreenElement || document.hidden) {
        if (!stateRef.current?.isLocked) {
          stateRef.current?.setIsLocked?.(true);
          stateRef.current?.handleAddDemerit?.();
        }
      }
    };

    document.addEventListener("fullscreenchange", enforceLock);
    document.addEventListener("webkitfullscreenchange", enforceLock);
    document.addEventListener("visibilitychange", enforceLock);

    return () => {
      document.removeEventListener("fullscreenchange", enforceLock);
      document.removeEventListener("webkitfullscreenchange", enforceLock);
      document.removeEventListener("visibilitychange", enforceLock);
    };
  }, [mounted, view, state?.isTesterMode]);

  const commandHandlers = useMemo(
    () => ({
      LOCK: () => {
        stateRef.current?.setIsLocked?.(true);
      },
      UNLOCK: () => {
        stateRef.current?.setIsLocked?.(false);
      },
      ADD_DEMERIT: () => {
        const curr = stateRef.current;
        if (typeof curr?.handleAddDemerit === "function") {
          curr.handleAddDemerit();
        } else if (typeof curr?.setDemerits === "function") {
          curr.setDemerits((prev) => (prev || 0) + 1);
        }
      },
      FORCE_FINISH: () => {
        stateRef.current?.handleFinishExam?.();
      },
      FORCE_FULLSCREEN: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
        }
      },
      AWARD_FREEBIE: ({ points = 1, note = "Teacher Bonus" } = {}) => {
        alert(`Freebie Awarded (+${points}): ${note}`);
        stateRef.current?.setBonusPoints?.((prev) => (prev || 0) + points);
      },
      JUMP_QUESTION: ({ targetIndex } = {}) => {
        if (typeof targetIndex === "number") {
          stateRef.current?.setCurrentQuestionIndex?.(targetIndex);
        }
      },
      SWAP_QUESTION: ({ difficulty = "hard" } = {}) => {
        stateRef.current?.loadAlternativeQuestion?.(difficulty);
      },
      FLASH_MESSAGE: ({ text = "" } = {}) => {
        alert(`Teacher Notice: ${text}`);
      },
      KICK: async ({ reason, code } = {}) => {
        const student = stateRef.current?.student;
        const kickReason = reason || "Behavior / Not following directions";

        if (code && student?.uid) {
          await logKickedStudent(code, student.uid, {
            name: student.name || "Unknown",
            section: student.section || "",
            reason: kickReason,
          });
        }

        if (student?.uid) {
          cleanStudentSession(student.uid);
        }

        alert(
          `Session Terminated: You were removed from the exam by the teacher (${kickReason}).`,
        );

        try {
          sessionStorage.clear();
          localStorage.removeItem("activeExamSession");
        } catch (_) {}

        window.location.href = "/";
      },
    }),
    [],
  );

  useLiveClassroomSync({
    student: state?.student,
    isTeacher: false,
    commandHandlers,
    currentQuestionIndex: state?.currentQuestionIndex ?? 0,
  });

  const [scannedReportId] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("report") || null;
    }
    return null;
  });

  useEffect(() => {
    if (view === "dashboard" && !state?.isAdminMode) {
      state?.setIsAdminMode?.(true);
    }
  }, [view, state]);

  const handleGateStart = async ({
    studentName,
    section,
    isTester,
    deviceUuid,
    mdnsCandidate,
    code,
  }) => {
    // Prevent tester intake from gaining admin mode
    state?.setIsAdminMode?.(false);

    if (isTester) {
      state?.setIsDevMode?.(true);
      state?.setIsTesterMode?.(true);
    } else {
      state?.setIsDevMode?.(false);
      state?.setIsTesterMode?.(false);
    }

    if (typeof state?.setExamDuration === "function") {
      state.setExamDuration(45 * 60);
    }
    if (typeof state?.setTimeLeft === "function") {
      state.setTimeLeft(45 * 60);
    }
    if (typeof state?.setExamStarted === "function") {
      state.setExamStarted(true);
    }

    await handleStudentJoin({
      name: studentName,
      code: code || "00000",
      uid: deviceUuid,
      section,
      state,
      router,
      telemetry: {
        deviceUuid,
        mdnsCandidate,
      },
    });

    navigateTo("exam");
  };

  // Wire bypass for automated tests & local development
  const bypassRanRef = useRef(false);
  useExamBypass((name, code, uid, section) => {
    if (bypassRanRef.current) return;
    bypassRanRef.current = true;

    handleGateStart({
      studentName: name,
      section: section,
      isTester: true,
      deviceUuid: uid,
      code: code,
    });
  });

  if (!mounted) {
    return <div className="min-h-screen bg-slate-900" />;
  }

  const adminPanel = (
    <DevAdminPanel
      isDevMode={state?.isDevMode || false}
      setIsLocked={state?.setIsLocked || (() => {})}
      handleFinishExam={state?.handleFinishExam || (() => {})}
    />
  );

  return (
    <>
      <StudentLockOverlay
        isLocked={state?.isLocked}
        studentName={state?.student?.name}
        timeLeft={state?.timeLeft}
        onUnlock={() => stateRef.current?.setIsLocked?.(false)}
      />

      {view === "start" && !state?.examStarted && !state?.isBypassActive ? (
        <ExamGate
          availableSections={displaySections}
          isLoading={isLoading}
          onExamStart={handleGateStart}
          onOpenDashboard={() => setIsTeacherPinOpen(true)}
        />
      ) : (
        <ExamAppRouter
          state={state}
          view={view}
          navigateTo={navigateTo}
          displaySections={displaySections}
          isLoading={isLoading}
          scannedReportId={scannedReportId}
          adminPanel={adminPanel}
          onJoin={(name, code, uid, section) =>
            handleStudentJoin({ name, code, uid, section, state, router })
          }
        />
      )}

      <PinModal
        isOpen={isTeacherPinOpen}
        onClose={() => setIsTeacherPinOpen(false)}
        title="Teacher Verification"
        description="Enter the 4-digit PIN to access the dashboard"
        placeholder="••••"
        onSubmit={(pin) => {
          if (pin === "0801") {
            state?.setIsAdminMode?.(true);
            navigateTo("dashboard");
          } else {
            alert("Unauthorized: Invalid Teacher PIN.");
          }
        }}
      />
    </>
  );
}
