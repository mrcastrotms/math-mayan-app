// src/hooks/useExamLifecycle.js
import { useState } from "react";
import { computeEnhancedScore } from "../utils/scoringUtils";
import {
  exitFullscreenSafely,
  persistExamCompletion,
} from "../utils/examSessionUtils";
import { processSessionCodeVerification } from "../utils/sessionVerification";

export function useExamLifecycle({
  isTeacher,
  isBypassMode,
  isBypassActive,
  defaultDuration,
  student,
  customStudentName,
  selectedSection,
  sessionCodeInput,
  activeActivityType,
  setActiveActivityType,
  navigation,
  hintsUsed,
}) {
  const [examStarted, setExamStarted] = useState(() => isBypassActive);
  const [examFinished, setExamFinished] = useState(false);
  const [examDuration, setExamDuration] = useState(() =>
    isBypassActive ? 60 : defaultDuration,
  );
  const [attemptHistory, setAttemptHistory] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [loginTime] = useState(() => new Date().toLocaleTimeString());
  const [startTime, setStartTime] = useState(null);

  const handleFinishExam = async () => {
    setExamFinished(true);
    if (!isTeacher) await exitFullscreenSafely();
    if (isBypassMode) return;

    setIsSaving(true);
    await persistExamCompletion({
      student,
      customStudentName,
      selectedSection,
      sessionCodeInput,
      activeActivityType,
      isTeacher,
      navigation,
      examDuration,
      loginTime,
      startTime,
      hintsUsed,
    });
    setIsSaving(false);
  };

  const handleVerifyAndStart = async (
    passedCode,
    passedSection,
    onTimeSync,
  ) => {
    setIsValidatingCode(true);
    try {
      await processSessionCodeVerification({
        code: passedCode || sessionCodeInput,
        section: passedSection || selectedSection,
        isTeacher,
        setExamDuration,
        setActiveActivityType,
        setStartTime,
        setExamStarted,
        onTimeSync,
      });
    } catch {
      alert("Error verifying code.");
    } finally {
      setIsValidatingCode(false);
    }
  };

  const recordAttemptAndReset = (onTimerReset) => {
    const score = computeEnhancedScore(
      navigation.studentAnswers,
      navigation.demerits,
      examDuration,
    );
    setAttemptHistory((prev) => [
      ...prev,
      {
        attemptNumber: prev.length + 1,
        score,
        demerits: navigation.demerits,
        answers: navigation.studentAnswers,
      },
    ]);
    navigation.resetExamFlow();
    onTimerReset?.(examDuration);
    setExamFinished(false);
    setExamStarted(false);
  };

  return {
    examStarted,
    setExamStarted,
    examFinished,
    setExamFinished,
    examDuration,
    setExamDuration,
    attemptHistory,
    isSaving,
    isValidatingCode,
    handleFinishExam,
    handleVerifyAndStart,
    recordAttemptAndReset,
  };
}
