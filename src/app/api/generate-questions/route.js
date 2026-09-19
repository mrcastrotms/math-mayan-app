import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { enforceRateLimit } from "../../../lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    if (!enforceRateLimit(request, "generate-questions", 10)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prompt, tier = "classwork", difficulty = "medium" } = body;
    if (
      typeof prompt !== "string" ||
      prompt.length > 500 ||
      !["classwork", "assessment", "review"].includes(tier) ||
      !["easy", "medium", "hard"].includes(difficulty)
    ) {
      return NextResponse.json({ error: "Invalid generation request." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 5 math problems for 4th and 5th grade students covering place value, rounding, or multi-digit operations. Topic/Prompt: ${prompt || "General math practice"}. Tier: ${tier}, Difficulty: ${difficulty}. Return valid JSON array of objects with keys: id, tier, difficulty, question, instruction, correctAnswer, observation.`,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text();
    const questions = JSON.parse(text);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("[API/GENERATE] Error generating questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions via Gemini AI." },
      { status: 500 }
    );
  }
}
