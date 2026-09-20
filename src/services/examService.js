import {
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  buildExamDocId,
  isPriorSubmissionActive,
} from "../utils/submissionGateUtils.mjs";

export async function checkExistingExamSubmission(
  sessionCode,
  selectedSection,
  studentIdentifier,
  studentName,
) {
  if (!sessionCode || sessionCode === "00000") {
    return { alreadySubmitted: false };
  }

  try {
    const docId = buildExamDocId({
      sessionCode,
      section: selectedSection,
      studentIdentifier: studentIdentifier || studentName,
    });

    if (docId) {
      const snap = await getDoc(doc(db, "exam_results", docId));
      if (snap.exists() && isPriorSubmissionActive(snap.data())) {
        return {
          alreadySubmitted: true,
          score: snap.data().score,
          record: snap.data(),
        };
      }
    }

    const q = query(
      collection(db, "exam_results"),
      where("sessionCode", "==", sessionCode),
      where("section", "==", selectedSection),
    );
    const querySnap = await getDocs(q);

    for (const docSnap of querySnap.docs) {
      const rec = docSnap.data();
      if (!isPriorSubmissionActive(rec)) continue;

      const matchesName =
        studentName &&
        rec.studentName?.trim().toLowerCase() === studentName.trim().toLowerCase();
      const matchesUid =
        studentIdentifier &&
        studentIdentifier !== "anonymous" &&
        rec.uid === studentIdentifier;

      if (matchesName || matchesUid) {
        return {
          alreadySubmitted: true,
          score: rec.score,
          record: rec,
        };
      }
    }

    return { alreadySubmitted: false };
  } catch (e) {
    console.error("Error checking existing exam submission:", e);
    return { alreadySubmitted: false };
  }
}

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
    const studentName =
      customStudentName?.trim() || student.name || "Unknown Student";
    const uid = student.uid || "anonymous";

    const docId = buildExamDocId({
      sessionCode: sessionCodeInput,
      section: selectedSection,
      studentIdentifier: uid !== "anonymous" ? uid : studentName,
      isTestRun,
    });

    const payload = {
      studentName,
      googleAccountName: student.displayName || "Anonymous",
      studentEmail: student.email || "No Email (Anonymous)",
      uid,
      section: selectedSection,
      sessionCode: sessionCodeInput,
      activityType: activeActivityType,
      isTestRun: Boolean(isTestRun),
      score: finalScore,
      demerits,
      questionsAttempted,
      answers: studentAnswers,
      loginTime: loginTime || null,
      startTime: startTime || null,
      timestamp: serverTimestamp(),
    };

    if (docId) {
      await setDoc(doc(db, "exam_results", docId), payload, { merge: false });
      return docId;
    }

    const resultRef = await addDoc(collection(db, "exam_results"), payload);
    return resultRef.id;
  } catch (e) {
    console.error("Failed to save exam result:", e);
  }
}

export async function verifySessionCode(sessionCodeInput, selectedSection) {
  if (sessionCodeInput === "00000") {
    return {
      code: "00000",
      section: selectedSection,
      duration: 45 * 60,
      active: true,
      activityType: "exam",
    };
  }
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
