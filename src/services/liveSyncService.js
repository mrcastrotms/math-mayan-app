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
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

export function initStudentSession(student, currentQuestionIndex = 0) {
  if (!db || !student?.uid) return null;
  const ref = doc(db, "activeSessions", student.uid);
  setDoc(
    ref,
    {
      uid: student.uid,
      name: student.name,
      section: student.section,
      isLocked: false,
      demerits: student.demerits || 0,
      currentQuestionIndex: Number(currentQuestionIndex) || 0,
      lastHeartbeat: serverTimestamp(),
      sessionStartedAt: Date.now(), // timestamp to reject stale commands
    },
    { merge: true },
  ).catch((err) => console.error("Error initializing student session:", err));

  // Purge any stale leftover commands from previous runs
  const commandsRef = collection(db, "activeSessions", student.uid, "commands");
  getDocs(commandsRef)
    .then((snap) => {
      snap.forEach((d) => deleteDoc(d.ref).catch(() => {}));
    })
    .catch(() => {});

  return ref;
}

export function pingHeartbeat(studentUid) {
  if (!db || !studentUid) return;
  updateDoc(doc(db, "activeSessions", studentUid), {
    lastHeartbeat: serverTimestamp(),
  }).catch(() => {});
}

export function updateStudentQuestion(studentUid, currentQuestionIndex) {
  if (!db || !studentUid) return;
  updateDoc(doc(db, "activeSessions", studentUid), {
    currentQuestionIndex: Number(currentQuestionIndex) || 0,
    lastHeartbeat: serverTimestamp(),
  }).catch((err) => console.error("Error updating question index:", err));
}

export function subscribeToLiveStudents(activeSection, onUpdate) {
  if (!db || !activeSection) return () => {};
  const q = query(
    collection(db, "activeSessions"),
    where("section", "==", activeSection),
  );
  return onSnapshot(q, (snapshot) => {
    const list = [];
    const now = Date.now();
    const STALE_THRESHOLD_MS = 45000; // 45 seconds without heartbeat = disconnected

    snapshot.forEach((snap) => {
      const data = snap.data();
      const lastBeat = data.lastHeartbeat?.toMillis
        ? data.lastHeartbeat.toMillis()
        : typeof data.lastHeartbeat === "number"
          ? data.lastHeartbeat
          : null;

      // Filter out stale ghost sessions whose tabs/browsers closed
      if (!lastBeat || now - lastBeat < STALE_THRESHOLD_MS) {
        list.push({ id: snap.id, ...data });
      }

    });

    onUpdate(list);
  });
}

export function subscribeToStudentTheme(studentUid, onUpdate) {
  if (!db || !studentUid) return () => {};
  return onSnapshot(
    doc(db, "activeSessions", studentUid),
    (snapshot) => {
      const data = snapshot.data() || {};
      onUpdate({
        theme: data.themeLocked ? data.enforcedTheme || "default" : null,
        locked: Boolean(data.themeLocked),
      });
    },
    (error) => console.error("Error subscribing to student theme:", error),
  );
}

export async function broadcastSectionTheme(activeSection, theme, locked) {
  if (!db || !activeSection) return 0;
  const snapshot = await getDocs(
    query(
      collection(db, "activeSessions"),
      where("section", "==", activeSection),
    ),
  );
  const batch = writeBatch(db);
  snapshot.forEach((session) => {
    batch.update(session.ref, {
      enforcedTheme: locked ? theme : null,
      themeLocked: Boolean(locked),
    });
  });
  await batch.commit();
  return snapshot.size;
}

export async function sendStudentCommand(studentUid, type, payload = {}) {
  if (!db || !studentUid) return;
  await addDoc(collection(db, "activeSessions", studentUid, "commands"), {
    type,
    payload,
    status: "pending",
    createdAt: Date.now(),
  });
}

// Student listener: ignores commands created before the student joined, deletes command immediately
export function subscribeToStudentCommands(studentUid, handlersRef) {
  if (!db || !studentUid) return () => {};

  const sessionStartTime = Date.now();
  const q = query(
    collection(db, "activeSessions", studentUid, "commands"),
    where("status", "==", "pending"),
  );

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === "added") {
        const cmdDoc = change.doc;
        const { type, payload, createdAt } = cmdDoc.data();

        // Convert either Date.now() number or Firestore Timestamp object to milliseconds
        const cmdTime =
          typeof createdAt === "number"
            ? createdAt
            : createdAt?.toMillis
              ? createdAt.toMillis()
              : 0;

        // Discard stale commands generated before this student session mounted (with 2s skew tolerance)
        if (cmdTime && cmdTime < sessionStartTime - 2000) {
          await deleteDoc(cmdDoc.ref).catch(() => {});
          return;
        }

        // Delete immediately from DB so rapid redirects/reloads cannot process it twice
        await deleteDoc(cmdDoc.ref).catch(() => {});

        const handler = handlersRef.current?.[type];
        if (typeof handler === "function") {
          try {
            await handler(payload || {});
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
