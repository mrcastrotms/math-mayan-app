import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, writeBatch } from "firebase/firestore";

const questionsData = JSON.parse(
  fs.readFileSync(new URL("../src/data/examQuestions.json", import.meta.url), "utf-8")
);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mayan-school-exams.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mayan-school-exams",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mayan-school-exams.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log("Starting question bank upload to Firestore...");
  const batch = writeBatch(db);

  for (const q of questionsData) {
    const docRef = doc(db, "question_bank", String(q.id));
    batch.set(docRef, q);
  }

  await batch.commit();
  console.log("Successfully ingested all " + questionsData.length + " questions into Firestore collection: question_bank");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Failed to seed questions:", err);
  process.exit(1);
});
