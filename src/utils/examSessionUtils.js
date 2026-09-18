// src/utils/examSessionUtils.js
import { saveExamResult, verifySessionCode } from "../services/examService";
import { computeEnhancedScore } from "./scoringUtils";

export async function exitFullscreenSafely() {
  if (typeof document !== "undefined" && document.fullscreenElement) {
    try {
      await document.exitFullscreen();
    } catch (e) {}
  }
}

export async function requestFullscreenSafely() {
  if (
    typeof document !== "undefined" &&
    document.documentElement?.requestFullscreen
  ) {
    try {
      await document.documentElement.requestFullscreen();
    } catch (e) {}
  }
}

export async function persistExamCompletion({
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
}) {
  const score = computeEnhancedScore(
    navigation.studentAnswers,
    navigation.demerits,
    examDuration,
  );

  return saveExamResult(
    {
      uid: student?.uid || "anonymous",
      name: customStudentName,
      section: selectedSection,
    },
    customStudentName,
    selectedSection,
    sessionCodeInput,
    activeActivityType,
    isTeacher || activeActivityType.includes("10-Min"),
    score,
    navigation.demerits,
    navigation.questionsAttempted,
    navigation.studentAnswers,
    loginTime,
    startTime || new Date().toLocaleTimeString(),
    hintsUsed,
  );
}

export async function validateAndParseSessionCode(passedCode, passedSection) {
  return verifySessionCode(passedCode, passedSection);
}

export async function processSessionCodeVerification({
  code,
  section,
  isTeacher,
  setExamDuration,
  setActiveActivityType,
  setStartTime,
  setExamStarted,
  onTimeSync,
}) {
  const result = await verifySessionCode(code, section);

  if (result?.error === "wrong_section") {
    alert("Wrong class section selected. Please check the board.");
    return false;
  }
  if (result?.error === "invalid_code") {
    alert("Invalid or expired Session Code.");
    return false;
  }

  if (result) {
    if (result.duration) {
      setExamDuration?.(result.duration);
      onTimeSync?.(result.duration);
    }
    if (result.activityType) {
      setActiveActivityType?.(result.activityType);
    }
    if (!isTeacher) {
      await requestFullscreenSafely();
    }
    setStartTime?.(new Date());
    setExamStarted?.(true);
    return true;
  }
  return false;
}
