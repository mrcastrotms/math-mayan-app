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

  // LIFECYCLE TIMESTAMPS
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

  const SHOW_END_BUTTON_AFTER = 1500;

  const isTeacher =
    isAdminMode || customStudentName.toLowerCase().includes("castro");

  // --- REVISED GRADING SCALE (40-50-60-100) ---
  const computeEnhancedScore = (answers, demerits) => {
    // 1. If they submitted a completely blank test, hard 40.
    if (!answers || answers.length === 0) {
      return 40;
    }

    // 2. Calculate their true accuracy (safely avoids NaN)
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const accuracy = correctCount / answers.length;

    // 3. Map 0% to 100% accuracy onto a 60 to 100 score scale
    // (If they get 0 right, they get a 60. If they get 100% right, they get 100)
    let finalScore = 60 + accuracy * 40;

    // 4. Subtract 5 points per behavior demerit
    finalScore -= (demerits || 0) * 5;

    // 5. Cap the max score at 100.
    // The hard floor is now 50 (if a kid got a 60 but caught 2 demerits)
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
  );

  const handleVerifyAndStart = async (passedCode, passedSection) => {
    setIsValidatingCode(true);

    const codeToTest = passedCode || sessionCodeInput;
    const sectionToTest = passedSection || selectedSection;

    try {
      const result = await verifySessionCode(codeToTest, sectionToTest);

      if (result.error === "wrong_section") {
        alert(appText.start.wrongSection);
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
    const handleVis = () => {
      if (document.hidden && examStarted && !examFinished && !isTeacher) {
        setIsLocked(true);
      }
    };
    document.addEventListener("visibilitychange", handleVis);
    return () => document.removeEventListener("visibilitychange", handleVis);
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
    isDevMode,
    SHOW_END_BUTTON_AFTER,
    EXAM_DURATION: examDuration,
    calculateFinalScore: () =>
      computeEnhancedScore(navigation.studentAnswers, navigation.demerits),
    ...navigation,
  };
}
