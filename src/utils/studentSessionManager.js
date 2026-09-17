// src/utils/studentSessionManager.js
import { saveExamResult, verifySessionCode } from "../services/examService";
import { computeEnhancedScore } from "./scoringUtils";

/* =========================================================================
   1. FULLSCREEN UTILITIES
   ========================================================================= */

export async function requestFullscreenSafely() {
  if (
    typeof document !== "undefined" &&
    document.documentElement?.requestFullscreen
  ) {
    try {
      await document.documentElement.requestFullscreen();
    } catch {}
  }
}

export async function exitFullscreenSafely() {
  if (typeof document !== "undefined" && document.fullscreenElement) {
    try {
      await document.exitFullscreen();
    } catch {}
  }
}

/* =========================================================================
   2. SESSION VERIFICATION & STUDENT JOIN
   ========================================================================= */

export function handleStudentJoin({ name, code, uid, section, state, router }) {
  state?.setCustomStudentName?.(name);
  state?.setSessionCodeInput?.(code);
  state?.setSelectedSection?.(section);
  state?.setStudent?.({ name, uid, section });

  if (code === "00000") {
    if (
      typeof window !== "undefined" &&
      !window.location.search.includes("bypass=true")
    ) {
      router.push("/?bypass=true");
    } else {
      state?.setExamStarted?.(true);
    }
  } else {
    state?.handleVerifyAndStart?.(code, section);
  }
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
      setExamDuration(result.duration);
      onTimeSync?.(result.duration);
    }
    if (result.activityType) {
      setActiveActivityType(result.activityType);
    }
    if (!isTeacher) {
      await requestFullscreenSafely();
    }
    setStartTime(new Date().toLocaleTimeString());
    setExamStarted(true);
    return true;
  }

  return false;
}

/* =========================================================================
   3. EXAM PERSISTENCE
   ========================================================================= */

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
