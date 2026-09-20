import {
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { dateKeyFromDate } from "../utils/attendanceBehavior.mjs";

function behaviorRecordId(uid, sessionStartedAt) {
  return `${uid}_${sessionStartedAt || "presence"}`.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export async function recordBehaviorChange({
  uid,
  studentName,
  section,
  sessionCode = "",
  sessionStartedAt = "",
  field,
}) {
  if (!db || !uid || !["merits", "demerits"].includes(field)) return;
  const id = behaviorRecordId(uid, sessionStartedAt);
  await setDoc(
    doc(db, "behavior_records", id),
    {
      uid,
      studentName,
      section,
      sessionCode,
      dateKey: dateKeyFromDate(),
      sessionStartedAt,
      lastUpdatedAt: serverTimestamp(),
      [field]: increment(1),
    },
    { merge: true },
  );
}

export async function loadBehaviorRecords(dateKey = dateKeyFromDate()) {
  const snapshot = await getDocs(collection(db, "behavior_records"));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((item) => !dateKey || item.dateKey === dateKey);
}

export function subscribeToBehavior(onUpdate, onError) {
  return onSnapshot(
    collection(db, "behavior_records"),
    (snapshot) => onUpdate(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function deleteBehaviorRecords(records = []) {
  if (!db) return;
  await Promise.all(records.filter((record) => record?.id).map((record) => deleteDoc(doc(db, "behavior_records", record.id))));
}
