// src/hooks/useExamState.js
import { useTimer } from "./useTimer";
import { useExamNavigation } from "./useExamNavigation";
import { useAppConfig } from "./useAppConfig";
import { useAdminState } from "./useAdminState";
import { useExamLock } from "./useExamLock";
import { useExamLifecycle } from "./useExamLifecycle";
import { useStudentSessionForm } from "./useStudentSessionForm";
import { filterActiveQuestions } from "../utils/questionFilterUtils";
import { computeEnhancedScore } from "../utils/scoringUtils";

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

  const lifecycle = useExamLifecycle({
    isTeacher,
    isBypassMode: isBypassActive,
    isBypassActive,
    defaultDuration: DEFAULT_DURATION,
    student: form.student,
    customStudentName: form.customStudentName,
    selectedSection: form.selectedSection,
    sessionCodeInput: form.sessionCodeInput,
    activeActivityType: form.activeActivityType,
    setActiveActivityType: form.setActiveActivityType,
    navigation,
    hintsUsed: form.hintsUsed,
  });

  const SHOW_END_BUTTON_AFTER = isBypassActive
    ? 0
    : lifecycle.examDuration > 600
      ? 1500
      : 300;

  const { isLocked, setIsLocked, overrideCode, setOverrideCode, handleUnlock } =
    useExamLock({
      examStarted: lifecycle.examStarted,
      examFinished: lifecycle.examFinished,
      isTeacher,
      CORRECT_PIN,
      student: form.student,
    });

  const timer = useTimer(
    lifecycle.examStarted,
    lifecycle.examFinished,
    isLocked,
    lifecycle.examDuration,
    lifecycle.handleFinishExam,
  );

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
    handleVerifyAndStart: (code, sec) =>
      lifecycle.handleVerifyAndStart(code, sec, (dur) =>
        timer.setTimeLeft(dur),
      ),
    handleTryAgain: () =>
      lifecycle.recordAttemptAndReset((dur) => {
        timer.resetQuestionTimer();
        timer.setTimeLeft(dur);
      }),
    isDevMode,
    SHOW_END_BUTTON_AFTER,
    EXAM_DURATION: lifecycle.examDuration,
    handleNinjaDoubleTime: () => timer.setTimeLeft((prev) => prev * 2),
    handleNinjaOneMinute: () => timer.setTimeLeft(60),
    calculateFinalScore: () =>
      computeEnhancedScore(
        navigation.studentAnswers,
        navigation.demerits,
        lifecycle.examDuration,
      ),
    ...lifecycle,
    ...timer,
    ...navigation,
  };
}
