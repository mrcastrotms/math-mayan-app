import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get("tier");

    const qRef = collection(db, "question_bank");
    const snapshot = await getDocs(qRef);

    const questions = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!tier || data.tier === tier) {
        // Redact correctAnswer so students cannot inspect answers in devtools
        const { correctAnswer, ...safeQuestion } = data;
        questions.push(safeQuestion);
      }
    });

    // Sort by ID to maintain order
    questions.sort((a, b) => a.id - b.id);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("[API/QUESTIONS] Error loading questions:", error);
    return NextResponse.json({ error: "Failed to load questions." }, { status: 500 });
  }
}
