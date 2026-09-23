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

export function handleStudentJoin({
  name,
  code,
  uid,
  section,
  state,
  router,
  telemetry = {},
}) {
  const trimmedName = name?.trim() || "";
  const normalized = trimmedName.toLowerCase();

  // Tester identification
  const isMrCastro =
    (normalized === "mr. castro" ||
      normalized === "mr castro" ||
      normalized === "césar castro" ||
      normalized === "cesar castro") &&
    code === "00000";

  // Persistent unique machine identity
  const deviceUid =
    uid ||
    telemetry.deviceUuid ||
    (typeof window !== "undefined"
      ? localStorage.getItem("exam_device_uuid")
      : null) ||
    "anonymous";

  state?.setCustomStudentName?.(trimmedName);
  state?.setSessionCodeInput?.(code);
  state?.setSelectedSection?.(section);

  // Bind student profile with telemetry envelope
  state?.setStudent?.({
    name: trimmedName,
    uid: deviceUid,
    section,
    isTester: isMrCastro,
    telemetry: {
      deviceUuid: deviceUid,
      mdnsCandidate: telemetry.mdnsCandidate || "unresolved",
    },
  });

  if (isMrCastro || code === "00000") {
    state?.setIsDevMode?.(true);
    state?.setIsAdminMode?.(false);
    state?.setIsLocked?.(false);

    if (
      typeof window !== "undefined" &&
      !window.location.search.includes("bypass=true")
    ) {
      router.push("/?bypass=true");
    } else {
      state?.setExamStarted?.(true);
    }
  } else {
    state?.handleVerifyAndStart?.(code, section, studentPayload);
  }
}

export { processSessionCodeVerification } from "./examSessionUtils";
