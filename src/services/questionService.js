// src/services/questionService.js
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  limit,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { examQuestions as defaultQuestions } from "../data/questionBank";

const QUESTION_BANK_COLLECTION = "question_bank";

/* =========================================================================
   1. GLOBAL / DEFAULT QUESTION BANK SYNC
   ========================================================================= */

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

/* =========================================================================
   2. TIERED & AI QUESTION GENERATION SERVICE
   ========================================================================= */

/**
 * Fetches active questions for a given topic/tier from Firestore
 */
export async function fetchQuestionsByTier(tier = "all", count = 30) {
  try {
    const qCol = collection(db, QUESTION_BANK_COLLECTION);
    let qRef = query(qCol, limit(count));

    if (tier !== "all") {
      qRef = query(qCol, where("tier", "==", tier), limit(count));
    }

    const snapshot = await getDocs(qRef);
    if (snapshot.empty) return [];

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (err) {
    console.error("Firestore question fetch error:", err);
    return [];
  }
}

/**
 * Saves generated questions to Firestore
 */
export async function saveGeneratedQuestion(questionObj) {
  try {
    const docRef = await addDoc(collection(db, QUESTION_BANK_COLLECTION), {
      ...questionObj,
      createdAt: serverTimestamp(),
      active: true,
    });
    return docRef.id;
  } catch (err) {
    console.error("Error saving generated question:", err);
    return null;
  }
}
