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
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { isWorksheetAnswerCorrect } from "../utils/worksheetUtils.mjs";

export async function createWorksheet({ title, instructions, section, dueDate, questions, createdBy = "teacher_admin" }) {
  const reference = await addDoc(collection(db, "worksheets"), {
    title: title.trim(),
    instructions: instructions.trim(),
    section,
    dueDate,
    questions,
    createdBy,
    createdAt: serverTimestamp(),
    active: false,
    status: "draft",
  });
  return reference.id;
}

export async function publishWorksheet(worksheetId) {
  await setDoc(doc(db, "worksheets", worksheetId), {
    active: true,
    status: "published",
    publishedAt: serverTimestamp(),
  }, { merge: true });
}

export async function updateWorksheet(worksheetId, changes) {
  await updateDoc(doc(db, "worksheets", worksheetId), changes);
}

export async function unassignWorksheet(worksheetId) {
  await updateDoc(doc(db, "worksheets", worksheetId), {
    active: false,
    status: "revoked",
    revokedAt: serverTimestamp(),
  });
}

export async function deleteWorksheet(worksheetId) {
  await deleteDoc(doc(db, "worksheets", worksheetId));
}

export async function cloneWorksheet(worksheet, section, dueDate) {
  return createWorksheet({
    title: `${worksheet.title} (Copy)`,
    instructions: worksheet.instructions || "",
    section,
    dueDate: dueDate || worksheet.dueDate,
    questions: worksheet.questions || [],
  });
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
  hintsUsed = 0,
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
    answers: worksheet.questions.map((question) => ({
      question: question.prompt,
      studentInput: answers[question.id] ?? "—",
      correctAnswer: question.correctAnswer,
      isCorrect: isWorksheetAnswerCorrect(answers[question.id], question),
    })),
    questionsAttempted: result.answered,
    totalQuestions: result.total,
    correctAnswers: result.correct,
    hintsUsed,
    maxHints: 4,
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

export async function loadAllWorksheets() {
  const snapshot = await getDocs(collection(db, "worksheets"));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}
