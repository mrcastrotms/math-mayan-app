import { useState, useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { saveExamResult, verifySessionCode } from "../services/examService";
import { useTimer } from "./useTimer";
import { useExamNavigation } from "./useExamNavigation";
import { useAppConfig } from "./useAppConfig";
import { calculateFinalScore } from "../utils/scoreUtils";

export function useExamState() {
  const [student, setStudent] = useState(null);
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

  const isTeacher = student?.email === "cesar015.2016@gmail.com";

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
    await saveExamResult(
      student,
      customStudentName,
      selectedSection,
      sessionCodeInput,
      activeActivityType,
      isTestRun,
      calculateFinalScore(navigation.studentAnswers, navigation.demerits),
      navigation.demerits,
      navigation.questionsAttempted,
      navigation.studentAnswers,
      loginTime,
      startTime,
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

  const handleLogin = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      setStudent(res.user);
      setLoginTime(new Date().toLocaleTimeString());
    } catch (e) {
      alert("Failed to log in.");
    }
  };

  const handleVerifyAndStart = async () => {
    setIsValidatingCode(true);
    try {
      const result = await verifySessionCode(sessionCodeInput, selectedSection);
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
        score: calculateFinalScore(
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
    handleLogin,
    handleVerifyAndStart,
    handleUnlock,
    handleTryAgain,
    handleFinishExam,
    formatTime,
    isDevMode,
    SHOW_END_BUTTON_AFTER,
    EXAM_DURATION: examDuration,
    calculateFinalScore: () =>
      calculateFinalScore(navigation.studentAnswers, navigation.demerits),
    ...navigation,
  };
}
