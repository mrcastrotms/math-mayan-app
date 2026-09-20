import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { question, scratchwork = "", previousHints = [], hintsUsed = 0 } = await request.json();
    if (Number(hintsUsed) >= 4) {
      return NextResponse.json({ error: "Hint limit reached." }, { status: 429 });
    }
    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "A question is required." }, { status: 400 });
    }
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Gemini is not configured." }, { status: 503 });
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Give one short Socratic math hint. Never state the final answer. Question: ${question}. Student work: ${scratchwork}. Earlier hints: ${previousHints.join(" | ")}`,
    });
    return NextResponse.json({ hint: response.text() });
  } catch (error) {
    console.error("Worksheet hint generation failed:", error);
    return NextResponse.json({ error: "Unable to generate a hint." }, { status: 500 });
  }
}
