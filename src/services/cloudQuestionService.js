// src/services/cloudQuestionService.js
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION_NAME = "question_bank";

/**
 * Fetches active questions for a given topic/tier from Firestore
 */
export async function fetchQuestionsByTier(tier = "all", count = 30) {
  try {
    const qCol = collection(db, COLLECTION_NAME);
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
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
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
