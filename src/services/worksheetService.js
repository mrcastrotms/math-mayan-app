import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export async function createWorksheet({ title, instructions, section, dueDate, questions, createdBy = "teacher_admin" }) {
  const reference = await addDoc(collection(db, "worksheets"), {
    title: title.trim(),
    instructions: instructions.trim(),
    section,
    dueDate,
    questions,
    createdBy,
    createdAt: serverTimestamp(),
    active: true,
  });
  return reference.id;
}

export function subscribeToAssignedWorks(section, onUpdate, onError) {
  if (!db || !section) return () => {};
  const worksQuery = query(
    collection(db, "worksheets"),
    where("section", "==", section),
    where("active", "==", true),
  );
  return onSnapshot(
    worksQuery,
    (snapshot) => onUpdate(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function loadWorksheetAttempt(worksheetId, studentId) {
  const attempt = await getDoc(doc(db, "worksheet_attempts", `${worksheetId}_${studentId}`));
  return attempt.exists() ? { id: attempt.id, ...attempt.data() } : null;
}

export async function saveWorksheetAttempt(worksheetId, studentId, data) {
  await setDoc(
    doc(db, "worksheet_attempts", `${worksheetId}_${studentId}`),
    { worksheetId, studentId, ...data, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function saveWorksheetGrade({
  student,
  worksheet,
  answers,
  result,
  submittedAt = serverTimestamp(),
}) {
  return addDoc(collection(db, "exam_results"), {
    studentName: student?.name || "Unknown Student",
    googleAccountName: student?.displayName || "Anonymous",
    studentEmail: student?.email || "No Email (Anonymous)",
    uid: student?.uid || "anonymous",
    section: student?.section || worksheet.section,
    sessionCode: "",
    activityType: "Classwork",
    activity: "Classwork",
    assignmentId: worksheet.id,
    assignmentTitle: worksheet.title,
    score: result.score,
    answers,
    questionsAttempted: result.answered,
    totalQuestions: result.total,
    correctAnswers: result.correct,
    status: "submitted",
    submittedAt,
    timestamp: serverTimestamp(),
  });
}

export async function loadAssignedWorks(section) {
  if (!db || !section) return [];
  const snapshot = await getDocs(query(
    collection(db, "worksheets"),
    where("section", "==", section),
    where("active", "==", true),
  ));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}
