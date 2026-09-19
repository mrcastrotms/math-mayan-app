import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, writeBatch } from "firebase/firestore";

// Read roster JSON directly to bypass ESM import syntax differences
const rosterData = JSON.parse(
  fs.readFileSync(new URL("../src/data/classRoster.json", import.meta.url), "utf-8")
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

function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseStudentName(rawEntry = "") {
  if (!rawEntry.includes(",")) {
    const trimmed = rawEntry.trim();
    return {
      rawName: trimmed,
      displayName: trimmed,
      firstName: trimmed,
      lastName: "",
    };
  }

  const [lastNames, firstNames] = rawEntry.split(",").map((s) => s.trim());
  return {
    rawName: rawEntry.trim(),
    displayName: `${firstNames} ${lastNames}`.trim(),
    firstName: firstNames,
    lastName: lastNames,
  };
}

async function seed() {
  console.log("Starting roster upload to Firestore (Project: " + firebaseConfig.projectId + ")...");
  const batch = writeBatch(db);
  const sections = Object.keys(rosterData);

  for (const section of sections) {
    const rawList = rosterData[section] || [];
    const students = rawList.map((rawName, index) => {
      const parsed = parseStudentName(rawName);
      const studentSlug = slugify(parsed.displayName);

      return {
        id: studentSlug || `student-${index + 1}`,
        rawName: parsed.rawName,
        displayName: parsed.displayName,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        section,
        email: "",
        studentId: "",
        accommodations: {
          extraTimeMultiplier: 1.0,
        },
        metadata: {},
      };
    });

    const docRef = doc(db, "class_rosters", section);
    batch.set(docRef, {
      section,
      updatedAt: new Date().toISOString(),
      studentCount: students.length,
      students,
    });
    console.log("Prepared section " + section + " (" + students.length + " students)");
  }

  await batch.commit();
  console.log("Successfully ingested all class rosters into Firestore collection: class_rosters");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Failed to seed rosters:", err);
  process.exit(1);
});
