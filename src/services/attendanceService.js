import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where
} from "firebase/firestore";
import { db } from "../firebase";
import { dateKeyFromDate } from "../utils/attendanceBehavior.mjs";

export function attendanceRecordId(dateKey, section, uid) {
  return `${dateKey}_${section}_${uid}`.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export async function markAttendancePresence({
  uid,
  studentName,
  section,
  sessionCode = "",
  now = Date.now(),
}) {
  if (!db || !uid || !section) return "";
  const dateKey = dateKeyFromDate(new Date(now));
  const id = attendanceRecordId(dateKey, section, uid);
  await setDoc(
    doc(db, "attendance_records", id),
    {
      uid,
      studentName,
      section,
      sessionCode,
      dateKey,
      joinedAtMs: now,
      lastSeenAtMs: now,
      joinedAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
    },
    { merge: true },
  );
  return id;
}

export async function heartbeatAttendance(id, now = Date.now()) {
  if (!db || !id) return;
  await updateDoc(doc(db, "attendance_records", id), {
    lastSeenAtMs: now,
    lastSeenAt: serverTimestamp(),
  });
}

export async function qualifyAttendance(id, now = Date.now()) {
  if (!db || !id) return;
  await updateDoc(doc(db, "attendance_records", id), {
    qualifiedAtMs: now,
    status: "present",
  });
}

export async function loadAttendanceRecords(dateKey = dateKeyFromDate()) {
  const q = dateKey 
    ? query(collection(db, "attendance_records"), where("dateKey", "==", dateKey))
    : collection(db, "attendance_records");
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export function subscribeToAttendance(onUpdate, onError) {
  const today = dateKeyFromDate();
  const q = query(collection(db, "attendance_records"), where("dateKey", "==", today));
  return onSnapshot(
    q,
    (snapshot) => onUpdate(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function deleteAttendanceRecords(records = []) {
  if (!db) return;
  await Promise.all(records.filter((record) => record?.id).map((record) => deleteDoc(doc(db, "attendance_records", record.id))));
}
