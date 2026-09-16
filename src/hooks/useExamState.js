import { useState, useEffect } from "react";
import { saveExamResult, verifySessionCode } from "../services/examService";
import { useTimer } from "./useTimer";
import { useExamNavigation } from "./useExamNavigation";
import { useAppConfig } from "./useAppConfig";
import { useAdminState } from "./useAdminState";
import { useExamLock } from "./useExamLock";
import { computeEnhancedScore } from "../utils/scoringUtils";

const CORRECT_PIN = "2026";
const DEFAULT_DURATION = 2400;

export function useExamState() {
  const isDevMode = process.env.NODE_ENV === "development";

  const [student, setStudent] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [sessionCodeInput, setSessionCodeInput] = useState("");
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");

  // Clean bypass handling using effects
  const [isBypassMode, setIsBypassMode] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examDuration, setExamDuration] = useState(DEFAULT_DURATION);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.search.includes("bypass=true")
    ) {
      setIsBypassMode(true);
      setExamStarted(true);
      setExamDuration(60); // 60s for testing
    }
  }, []);

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
  const { isAdminMode, setIsAdminMode } = useAdminState();

  const isTeacher =
    isAdminMode ||
    (customStudentName || "").toLowerCase().includes("castro") ||
    isBypassMode;
  const SHOW_END_BUTTON_AFTER = isBypassMode
    ? 0
    : examDuration > 600
      ? 1500
      : 300;

  const { isLocked, setIsLocked, overrideCode, setOverrideCode, handleUnlock } =
    useExamLock({
      examStarted,
      examFinished,
      isTeacher,
      CORRECT_PIN,
    });

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

  const handleFinishExam = async () => {
    setExamFinished(true);
    if (!isTeacher && document.exitFullscreen) {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
      } catch (e) {}
    }

    setIsSaving(true);
    if (isBypassMode) {
      setIsSaving(false);
      return;
    }

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
      computeEnhancedScore(
        navigation.studentAnswers,
        navigation.demerits,
        examDuration,
      ),
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

  const handleNinjaDoubleTime = () => setTimeLeft((prev) => prev * 2);
  const handleNinjaOneMinute = () => {
    if (window.prompt("Teacher Override PIN:") === CORRECT_PIN) setTimeLeft(60);
  };

  const handleVerifyAndStart = async (passedCode, passedSection) => {
    setIsValidatingCode(true);
    const codeToTest = passedCode || sessionCodeInput;
    const sectionToTest = passedSection || selectedSection;

    try {
      const result = await verifySessionCode(codeToTest, sectionToTest);
      if (result.error === "wrong_section")
        alert("Wrong class section selected. Please check the board.");
      else if (result.error === "invalid_code")
        alert("Invalid or expired Session Code.");
      else if (result) {
        if (result.duration) {
          setExamDuration(result.duration);
          setTimeLeft(result.duration);
        }
        if (result.activityType) setActiveActivityType(result.activityType);
        if (!isTeacher && document.documentElement.requestFullscreen)
          document.documentElement.requestFullscreen().catch(() => {});
        setStartTime(new Date().toLocaleTimeString());
        setExamStarted(true);
      }
    } catch (e) {
      alert("Error verifying code.");
    }
    setIsValidatingCode(false);
  };

  const handleTryAgain = () => {
    setAttemptHistory([
      ...attemptHistory,
      {
        attemptNumber: attemptHistory.length + 1,
        score: computeEnhancedScore(
          navigation.studentAnswers,
          navigation.demerits,
          examDuration,
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
    setExamStarted,
    isLocked,
    setIsLocked,
    overrideCode,
    setOverrideCode, // <--- EXPOSED
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
    isTeacher,
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
      computeEnhancedScore(
        navigation.studentAnswers,
        navigation.demerits,
        examDuration,
      ),
    ...navigation,
  };
}
