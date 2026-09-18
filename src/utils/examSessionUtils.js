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
