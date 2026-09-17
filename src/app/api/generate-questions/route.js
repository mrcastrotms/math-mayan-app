// src/app/api/generate-questions/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const {
      gradeLevel = "4th Grade",
      topic = "Multi-digit Multiplication",
      count = 5,
      tier = "standard",
    } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY" },
        { status: 500 },
      );
    }

    const prompt = `
Generate ${count} math assessment questions for ${gradeLevel} students on the topic of "${topic}".
Tier/Difficulty: ${tier}.

Respond ONLY with a valid JSON array matching this exact schema:
[
  {
    "question": "Clear problem prompt without ambiguity",
    "answer": "Exact numerical or text answer",
    "tier": "${tier}",
    "topic": "${topic}",
    "options": ["optional multiple choice distractor 1", "distractor 2", "etc"]
  }
]
No markdown formatting, no commentary, just the JSON string.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" },
        }),
      },
    );

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const questions = JSON.parse(rawText || "[]");

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error("Gemini question generation error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
