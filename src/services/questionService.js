import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { examQuestions as defaultQuestions } from "../data/questionBank";

export async function fetchLiveQuestions() {
  try {
    const docRef = doc(db, "settings", "question_bank");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().questions) {
      return docSnap.data().questions;
    }
  } catch (e) {
    console.warn("Using local question bank fallback:", e);
  }
  return defaultQuestions;
}

export async function syncQuestionsToFirebase() {
  try {
    const docRef = doc(db, "settings", "question_bank");
    await setDoc(docRef, { questions: defaultQuestions }, { merge: true });
    alert("Question bank successfully synced to Firebase Cloud!");
  } catch (e) {
    console.error("Failed to sync question bank:", e);
    alert("Sync failed. Check permissions.");
  }
}
