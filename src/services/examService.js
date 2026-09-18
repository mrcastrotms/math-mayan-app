// src/services/examService.js
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

export async function saveExamResult(
  student,
  customStudentName,
  selectedSection,
  sessionCodeInput,
  activeActivityType,
  isTestRun,
  finalScore,
  demerits,
  questionsAttempted,
  studentAnswers,
  loginTime,
  startTime,
) {
  if (!student) return;
  try {
    const rawTelemetry = student?.telemetry || {};

    await addDoc(collection(db, "exam_results"), {
      // Safely pull typed name, fallback to "Unknown" if missing
      studentName:
        customStudentName?.trim() || student.name || "Unknown Student",

      // Fallbacks to ensure Firestore doesn't crash on undefined values
      googleAccountName: student.displayName || "Anonymous",
      studentEmail: student.email || "No Email (Anonymous)",
      uid: student.uid || "anonymous",

      section: selectedSection || "Unknown",
      sessionCode: sessionCodeInput || "00000",
      activityType: activeActivityType || "Standard",
      isTestRun: Boolean(isTestRun),
      score: finalScore ?? 0,
      demerits: demerits ?? 0,
      questionsAttempted: questionsAttempted ?? 0,
      answers: studentAnswers || {},
      loginTime: loginTime || null,
      startTime: startTime || null,
      timestamp: serverTimestamp(),

      // Telemetry & Hardware envelope
      telemetry: {
        deviceUuid: rawTelemetry.deviceUuid || student.uid || "anonymous",
        mdnsCandidate: rawTelemetry.mdnsCandidate || "unresolved",
      },
    });
  } catch (e) {
    console.error("Failed to save exam result:", e);
  }
}

export async function verifySessionCode(sessionCodeInput, selectedSection) {
  try {
    const q = query(
      collection(db, "exam_sessions"),
      where("code", "==", sessionCodeInput),
      where("active", "==", true),
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const sessionData = querySnapshot.docs[0].data();
      if (sessionData.section === selectedSection) {
        return sessionData;
      }
      return { error: "wrong_section" };
    }
    return { error: "invalid_code" };
  } catch (e) {
    console.error("Error verifying session code:", e);
    return { error: "error" };
  }
}
