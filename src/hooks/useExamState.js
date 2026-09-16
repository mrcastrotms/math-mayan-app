import { useState, useEffect } from "react";
import { saveExamResult, verifySessionCode } from "../services/examService";
import { useTimer } from "./useTimer";
import { useExamNavigation } from "./useExamNavigation";
import { useAppConfig } from "./useAppConfig";

export function useExamState() {
  const [student, setStudent] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [sessionCodeInput, setSessionCodeInput] = useState("");
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const [examStarted, setExamStarted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [overrideCode, setOverrideCode] = useState("");
  const [customStudentName, setCustomStudentName] = useState("");
  const [examFinished, setExamFinished] = useState(false);
  const [attemptHistory, setAttemptHistory] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showBehaviorMenu, setShowBehaviorMenu] = useState(false);
  const [activeActivityType, setActiveActivityType] =
    useState("Assessment / Exam");

  const [loginTime, setLoginTime] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const {
    appText,
    setAppText,
    examQuestions,
    availableSections,
    setAvailableSections,
  } = useAppConfig();

  const CORRECT_PIN = "2026";
  const isDevMode = process.env.NODE_ENV === "development";
  const DEFAULT_DURATION = 2400;
  const [examDuration, setExamDuration] = useState(DEFAULT_DURATION);

  // SAFE FALLBACK: Prevents crash if customStudentName is ever undefined
  const isTeacher =
    isAdminMode || (customStudentName || "").toLowerCase().includes("castro");

  const SHOW_END_BUTTON_AFTER = examDuration > 600 ? 1500 : 300;

  const computeEnhancedScore = (answers, demerits) => {
    if (!answers || answers.length === 0) {
      return 40;
    }
    const minRequired = examDuration <= 600 ? 8 : 20;
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const gradedOutOf = Math.max(answers.length, minRequired);
    const accuracy = correctCount / gradedOutOf;

    let finalScore = 60 + accuracy * 40;
    finalScore -= (demerits || 0) * 5;
    return Math.max(50, Math.min(100, Math.round(finalScore)));
  };

  const handleFinishExam = async () => {
    setExamFinished(true);
    if (!isTeacher && document.exitFullscreen) {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch (e) {
        console.warn("Fullscreen exit handled safely:", e);
      }
    }

    setIsSaving(true);
    const isTestRun = isTeacher || activeActivityType.includes("10-Min");

    const safeStudentPayload = {
      uid: student?.uid || "anonymous",
      name: customStudentName,
      section: selectedSection,
    };

    await saveExamResult(
      safeStudentPayload,
      customStudentName,
      selectedSection,
      sessionCodeInput,
      activeActivityType,
      isTestRun,
      computeEnhancedScore(navigation.studentAnswers, navigation.demerits),
      navigation.demerits,
      navigation.questionsAttempted,
      navigation.studentAnswers,
      loginTime || new Date().toLocaleTimeString(),
      startTime || new Date().toLocaleTimeString(),
      hintsUsed,
    );
    setIsSaving(false);
  };

  const {
    timeLeft,
    setTimeLeft,
    secondsOnCurrentQuestion,
    resetQuestionTimer,
    formatTime,
  } = useTimer(
    examStarted,
    examFinished,
    isLocked,
    examDuration,
    handleFinishExam,
  );

  const handleNinjaDoubleTime = () => {
    setTimeLeft((prev) => prev * 2);
  };

  const handleNinjaOneMinute = () => {
    const pin = window.prompt("Teacher Override PIN:");
    if (pin === CORRECT_PIN) {
      setTimeLeft(60);
    }
  };

  const filteredQuestions = examQuestions.filter((q) => {
    if (
      activeActivityType.includes("Classwork") ||
      activeActivityType.includes("Quiz")
    ) {
      return q.tier === "classwork" || !q.tier;
    }
    return true;
  });

  const navigation = useExamNavigation(
    filteredQuestions.length > 0 ? filteredQuestions : examQuestions,
    appText,
    student,
  );

  const handleVerifyAndStart = async (passedCode, passedSection) => {
    setIsValidatingCode(true);

    const codeToTest = passedCode || sessionCodeInput;
    const sectionToTest = passedSection || selectedSection;

    try {
      const result = await verifySessionCode(codeToTest, sectionToTest);

      if (result.error === "wrong_section") {
        alert("Wrong class section selected. Please check the board.");
      } else if (result.error === "invalid_code") {
        alert("Invalid or expired Session Code.");
      } else if (result) {
        if (result.duration) {
          setExamDuration(result.duration);
          setTimeLeft(result.duration);
        }
        if (result.activityType) {
          setActiveActivityType(result.activityType);
        }
        if (!isTeacher && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        setStartTime(new Date().toLocaleTimeString());
        setExamStarted(true);
      }
    } catch (e) {
      alert("Error verifying code.");
    }
    setIsValidatingCode(false);
  };

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
    } else alert("Incorrect PIN");
  };

  const handleTryAgain = () => {
    setAttemptHistory([
      ...attemptHistory,
      {
        attemptNumber: attemptHistory.length + 1,
        score: computeEnhancedScore(
          navigation.studentAnswers,
          navigation.demerits,
        ),
        demerits: navigation.demerits,
        answers: navigation.studentAnswers,
      },
    ]);
    navigation.resetExamFlow();
    resetQuestionTimer();
    setTimeLeft(examDuration);
    setExamFinished(false);
    setExamStarted(false);
  };

  return {
    student,
    setStudent,
    hintsUsed,
    setHintsUsed,
    isAdminMode,
    setIsAdminMode,
    sessionCodeInput,
    setSessionCodeInput,
    isValidatingCode,
    selectedSection,
    setSelectedSection,
    examStarted,
    isLocked,
    setIsLocked,
    overrideCode,
    setOverrideCode,
    availableSections,
    setAvailableSections,
    customStudentName,
    setCustomStudentName,
    examFinished,
    timeLeft,
    isSaving,
    showBehaviorMenu,
    setShowBehaviorMenu,
    secondsOnCurrentQuestion,
    isTeacher: isTeacher,
    appText,
    setAppText,
    examQuestions,
    activeActivityType,
    handleVerifyAndStart,
    handleUnlock,
    handleTryAgain,
    handleFinishExam,
    formatTime,
    handleNinjaDoubleTime,
    handleNinjaOneMinute,
    isDevMode,
    SHOW_END_BUTTON_AFTER,
    EXAM_DURATION: examDuration,
    calculateFinalScore: () =>
      computeEnhancedScore(navigation.studentAnswers, navigation.demerits),
    ...navigation,
  };
}
