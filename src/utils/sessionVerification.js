// src/utils/sessionVerification.js
import {
  requestFullscreenSafely,
  validateAndParseSessionCode,
} from "./examSessionUtils";

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
  const result = await validateAndParseSessionCode(code, section);

  if (result.error === "wrong_section") {
    alert("Wrong class section selected. Please check the board.");
    return false;
  }
  if (result.error === "invalid_code") {
    alert("Invalid or expired Session Code.");
    return false;
  }
  if (result) {
    if (result.duration) {
      setExamDuration(result.duration);
      onTimeSync?.(result.duration);
    }
    if (result.activityType) setActiveActivityType(result.activityType);
    if (!isTeacher) await requestFullscreenSafely();
    setStartTime(new Date().toLocaleTimeString());
    setExamStarted(true);
    return true;
  }
  return false;
}
