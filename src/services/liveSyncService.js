// src/services/liveSyncService.js
import {
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export function initStudentSession(student) {
  if (!db || !student?.uid) return null;
  const ref = doc(db, "activeSessions", student.uid);
  setDoc(
    ref,
    {
      uid: student.uid,
      name: student.name,
      section: student.section,
      isLocked: false,
      demerits: 0,
      currentQuestionIndex: 0,
      lastHeartbeat: serverTimestamp(),
    },
    { merge: true },
  );
  return ref;
}

export function pingHeartbeat(studentUid) {
  if (!db || !studentUid) return;
  updateDoc(doc(db, "activeSessions", studentUid), {
    lastHeartbeat: serverTimestamp(),
  }).catch(() => {});
}

export function subscribeToLiveStudents(activeSection, onUpdate) {
  if (!db || !activeSection) return () => {};
  const q = query(
    collection(db, "activeSessions"),
    where("section", "==", activeSection),
  );
  return onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach((snap) => {
      list.push(snap.data());
    });
    onUpdate(list);
  });
}

// Universal command sender: writes action payload into student's command subcollection
export async function sendStudentCommand(studentUid, type, payload = {}) {
  if (!db || !studentUid) return;
  await addDoc(collection(db, "activeSessions", studentUid, "commands"), {
    type,
    payload,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

// Student listener: watches for pending commands, runs matching handler, marks executed
export function subscribeToStudentCommands(studentUid, handlersRef) {
  if (!db || !studentUid) return () => {};

  const q = query(
    collection(db, "activeSessions", studentUid, "commands"),
    where("status", "==", "pending"),
  );

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === "added") {
        const cmdDoc = change.doc;
        const { type, payload } = cmdDoc.data();
        const handler = handlersRef.current?.[type];

        if (typeof handler === "function") {
          try {
            await handler(payload || {});
            await updateDoc(cmdDoc.ref, {
              status: "executed",
              executedAt: serverTimestamp(),
            });
          } catch (err) {
            console.error(`Error executing command ${type}:`, err);
          }
        }
      }
    });
  });
}

export async function logKickedStudent(code, studentUid, details) {
  if (!db || !code || !studentUid) return;
  await setDoc(
    doc(db, "exams", code, "kickedStudents", studentUid),
    {
      ...details,
      kickedAt: serverTimestamp(),
    },
    { merge: true },
  ).catch(() => {});
}

export function cleanStudentSession(studentUid) {
  if (!db || !studentUid) return;
  deleteDoc(doc(db, "activeSessions", studentUid)).catch(() => {});
}
