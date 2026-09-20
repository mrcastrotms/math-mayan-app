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
    const resultRef = await addDoc(collection(db, "exam_results"), {
      // Safely pull the typed name, fallback to "Unknown" if missing
      studentName:
        customStudentName?.trim() || student.name || "Unknown Student",

      // Provide string fallbacks so Firestore doesn't crash on 'undefined'
      googleAccountName: student.displayName || "Anonymous",
      studentEmail: student.email || "No Email (Anonymous)",
      uid: student.uid || "anonymous",

      section: selectedSection,
      sessionCode: sessionCodeInput,
      activityType: activeActivityType,
      isTestRun,
      score: finalScore,
      demerits,
      questionsAttempted,
      answers: studentAnswers,
      loginTime: loginTime || null,
      startTime: startTime || null,
      timestamp: serverTimestamp(),
    });
    return resultRef.id;
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
