// src/app/page.js
"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useExamState } from "../hooks/useExamState";
import { useViewPersistence } from "../hooks/useViewPersistence";
import { useCachedSections } from "../hooks/useCachedSections";
import { useLiveClassroomSync } from "../hooks/useLiveClassroomSync";
import {
  logKickedStudent,
  cleanStudentSession,
} from "../services/liveSyncService";
import { handleStudentJoin } from "../utils/joinHandler";
import ExamAppRouter from "../components/ExamAppRouter";
import StudentLockOverlay from "../components/StudentLockOverlay";

const DevAdminPanel = dynamic(() => import("../components/DevAdminPanel"), {
  ssr: false,
});

export default function ExamApp() {
  const router = useRouter();
  const state = useExamState();
  const { view, navigateTo } = useViewPersistence("start");
  const { displaySections, isLoading } = useCachedSections(
    state?.availableSections,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep state ref fresh to prevent handler closures from getting stale
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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
      />
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
    </>
  );
}
