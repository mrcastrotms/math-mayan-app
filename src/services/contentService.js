import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { appText as defaultCopy } from "../data/content";

export async function fetchLiveContent() {
  try {
    const docRef = doc(db, "settings", "content");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...defaultCopy, ...docSnap.data() };
    }
  } catch (e) {
    console.warn("Using local content fallback:", e);
  }
  return defaultCopy;
}

export async function initializeFirebaseContent() {
  try {
    const docRef = doc(db, "settings", "content");
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, defaultCopy);
    }
  } catch (e) {
    console.error("Failed to initialize Firebase content:", e);
  }
}

export async function syncContentToFirebase() {
  try {
    const docRef = doc(db, "settings", "content");
    await setDoc(docRef, defaultCopy, { merge: true });
    alert("App copy successfully synced to Firebase Cloud!");
  } catch (e) {
    console.error("Failed to sync content:", e);
    alert("Sync failed. Check permissions.");
  }
}

export async function updateLiveContent(newContentJson) {
  try {
    const parsed =
      typeof newContentJson === "string"
        ? JSON.parse(newContentJson)
        : newContentJson;
    const docRef = doc(db, "settings", "content");
    await setDoc(docRef, parsed, { merge: true });
    alert("Live copy updated successfully in Firestore!");
    return parsed;
  } catch (e) {
    console.error("Failed to update content:", e);
    alert("Invalid JSON format or permission error.");
    throw e;
  }
}
