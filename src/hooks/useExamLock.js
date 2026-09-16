"use client";
import { useState, useEffect } from "react";

export function useExamLock({
  examStarted,
  examFinished,
  isTeacher,
  CORRECT_PIN,
}) {
  const [isLocked, setIsLocked] = useState(false);
  const [overrideCode, setOverrideCode] = useState("");

  useEffect(() => {
    const triggerLock = () => {
      if (examStarted && !examFinished && !isTeacher) {
        setIsLocked(true);
      }
    };

    const handleVis = () => {
      if (document.hidden) triggerLock();
    };
    const handleBlur = () => {
      triggerLock();
    };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) triggerLock();
    };

    document.addEventListener("visibilitychange", handleVis);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVis);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [examStarted, examFinished, isTeacher]);

  const handleUnlock = () => {
    if (overrideCode === CORRECT_PIN) {
      setIsLocked(false);
      setOverrideCode("");
      if (!isTeacher && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      alert("Incorrect PIN");
    }
  };

  return { isLocked, setIsLocked, overrideCode, setOverrideCode, handleUnlock };
}
