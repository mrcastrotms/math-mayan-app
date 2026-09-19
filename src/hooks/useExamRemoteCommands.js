"use client";

import { useMemo } from "react";
import { logKickedStudent, cleanStudentSession } from "../services/liveSyncService";
import { useLiveClassroomSync } from "./useLiveClassroomSync";

export function useExamRemoteCommands({ stateRef, student, currentQuestionIndex }) {
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
        const studentData = stateRef.current?.student;
        const kickReason = reason || "Behavior / Not following directions";

        if (code && studentData?.uid) {
          await logKickedStudent(code, studentData.uid, {
            name: studentData.name || "Unknown",
            section: studentData.section || "",
            reason: kickReason,
          });
        }

        if (studentData?.uid) {
          cleanStudentSession(studentData.uid);
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
    [stateRef],
  );

  useLiveClassroomSync({
    student,
    isTeacher: false,
    commandHandlers,
    currentQuestionIndex: currentQuestionIndex ?? 0,
  });

  return commandHandlers;
}
