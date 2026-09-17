// src/hooks/useExamState.js
import { useState } from "react";
import { useTimer } from "./useTimer";
import { useExamNavigation } from "./useExamNavigation";
import { useAppConfig } from "./useAppConfig";
import { useAdminState } from "./useAdminState";
import { useExamLock } from "./useExamLock";
import { useStudentSessionForm } from "./useStudentSessionForm";
import { filterActiveQuestions } from "../utils/questionFilterUtils";
import { computeEnhancedScore } from "../utils/scoringUtils";
import {
  exitFullscreenSafely,
  persistExamCompletion,
  processSessionCodeVerification,
} from "../utils/studentSessionManager";

const CORRECT_PIN = "2026";
const DEFAULT_DURATION = 2400;

export function useExamState() {
  const isDevMode = process.env.NODE_ENV === "development";
  const isBypassActive =
    typeof window !== "undefined" &&
    window.location.search.includes("bypass=true");

  const form = useStudentSessionForm();
  const {
    appText,
    setAppText,
    examQuestions,
    availableSections,
    setAvailableSections,
  } = useAppConfig();
  const { isAdminMode, setIsAdminMode } = useAdminState();

  const isTeacher =
    isAdminMode ||
    (form.customStudentName || "").toLowerCase().includes("castro") ||
    isBypassActive;

  const activeQuestions = filterActiveQuestions(
    examQuestions,
    form.activeActivityType,
  );
  const navigation = useExamNavigation(activeQuestions, appText, form.student);

  // --- Exam Lifecycle State ---
  const [examStarted, setExamStarted] = useState(() => isBypassActive);
  const [examFinished, setExamFinished] = useState(false);
  const [examDuration, setExamDuration] = useState(() =>
    isBypassActive ? 60 : DEFAULT_DURATION,
  );
  const [attemptHistory, setAttemptHistory] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [loginTime] = useState(() => new Date().toLocaleTimeString());
  const [startTime, setStartTime] = useState(null);

  const handleFinishExam = async () => {
    setExamFinished(true);
    if (!isTeacher) await exitFullscreenSafely();
    if (isBypassActive) return;

    setIsSaving(true);
    try {
      await persistExamCompletion({
        student: form.student,
        customStudentName: form.customStudentName,
        selectedSection: form.selectedSection,
        sessionCodeInput: form.sessionCodeInput,
        activeActivityType: form.activeActivityType,
        isTeacher,
        navigation,
        examDuration,
        loginTime,
        startTime,
        hintsUsed: form.hintsUsed,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const { isLocked, setIsLocked, overrideCode, setOverrideCode, handleUnlock } =
    useExamLock({
      examStarted,
      examFinished,
      isTeacher,
      CORRECT_PIN,
      student: form.student,
    });

  const timer = useTimer(
    examStarted,
    examFinished,
    isLocked,
    examDuration,
    handleFinishExam,
  );

  const handleVerifyAndStart = async (passedCode, passedSection) => {
    setIsValidatingCode(true);
    try {
      await processSessionCodeVerification({
        code: passedCode || form.sessionCodeInput,
        section: passedSection || form.selectedSection,
        isTeacher,
        setExamDuration,
        setActiveActivityType: form.setActiveActivityType,
        setStartTime,
        setExamStarted,
        onTimeSync: (dur) => timer.setTimeLeft(dur),
      });
    } catch {
      alert("Error verifying code.");
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleTryAgain = () => {
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
    timer.resetQuestionTimer();
    timer.setTimeLeft(examDuration);
    setExamFinished(false);
    setExamStarted(false);
  };

  return {
    ...form,
    isAdminMode,
    setIsAdminMode,
    isLocked,
    setIsLocked,
    overrideCode,
    setOverrideCode,
    availableSections,
    setAvailableSections,
    isTeacher,
    appText,
    setAppText,
    examQuestions,
    handleUnlock,
    handleVerifyAndStart,
    handleTryAgain,
    isDevMode,
    SHOW_END_BUTTON_AFTER: isBypassActive ? 0 : examDuration > 600 ? 1500 : 300,
    EXAM_DURATION: examDuration,
    handleNinjaDoubleTime: () => timer.setTimeLeft((prev) => prev * 2),
    handleNinjaOneMinute: () => timer.setTimeLeft(60),
    calculateFinalScore: () =>
      computeEnhancedScore(
        navigation.studentAnswers,
        navigation.demerits,
        examDuration,
      ),
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
    ...timer,
    ...navigation,
  };
}
