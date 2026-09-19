import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebaseAdmin";
import { enforceRateLimit } from "../../../lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    if (!enforceRateLimit(request, "questions", 30)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get("tier");
    if (tier && !["classwork", "assessment", "review"].includes(tier)) {
      return NextResponse.json({ error: "Invalid tier." }, { status: 400 });
    }

    const qRef = adminDb.collection("question_bank");
    const snapshot = await qRef.get();

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
