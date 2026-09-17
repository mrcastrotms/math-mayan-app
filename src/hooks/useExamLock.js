// src/hooks/useExamLock.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export function useExamLock({
  examStarted,
  examFinished,
  isTeacher,
  CORRECT_PIN,
  student,
}) {
  const [isLocked, setIsLocked] = useState(false);
  const [overrideCode, setOverrideCode] = useState("");
  const studentUid = student?.uid;

  const triggerLock = useCallback(
    (reason = "left_tab") => {
      if (!examStarted || examFinished || isTeacher) return;
      setIsLocked(true);

      if (studentUid && db) {
        updateDoc(doc(db, "activeSessions", studentUid), {
          isLocked: true,
          lockReason: reason,
        }).catch(() => {});
      }
    },
    [examStarted, examFinished, isTeacher, studentUid],
  );

  // Tab switch, blur, and fullscreen detection
  useEffect(() => {
    const handleVis = () => {
      if (document.hidden) triggerLock("left_tab");
    };
    const handleBlur = () => triggerLock("lost_focus");
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) triggerLock("exited_fullscreen");
    };

    document.addEventListener("visibilitychange", handleVis);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVis);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [triggerLock]);

  // Listen for remote unlocks/locks from Teacher Dashboard
  useEffect(() => {
    if (!studentUid || !db || isTeacher) return;

    const unsub = onSnapshot(doc(db, "activeSessions", studentUid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setIsLocked(Boolean(data.isLocked));
      }
    });

    return () => unsub();
  }, [studentUid, isTeacher]);

  const handleUnlock = () => {
    if (overrideCode === CORRECT_PIN) {
      setIsLocked(false);
      setOverrideCode("");

      if (studentUid && db) {
        updateDoc(doc(db, "activeSessions", studentUid), {
          isLocked: false,
          lockReason: null,
        }).catch(() => {});
      }

      if (!isTeacher && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      alert("Incorrect PIN");
    }
  };

  return { isLocked, setIsLocked, overrideCode, setOverrideCode, handleUnlock };
}
