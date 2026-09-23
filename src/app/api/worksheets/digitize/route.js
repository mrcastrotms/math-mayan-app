import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Gemini is not configured." }, { status: 503 });
    const { image, mimeType = "image/jpeg" } = await request.json();
    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "An image is required." }, { status: 400 });
    }
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType, data: image } },
          { text: "Read this math worksheet and return only a JSON array. Each item must have id, type, prompt, correctAnswer, acceptedAnswers. Use semantic HTML such as 4<sup>4</sup> for exponents, and use × or · for multiplication. Do not invent unreadable answers." },
        ],
      }],
      config: { responseMimeType: "application/json" },
    });
    return NextResponse.json({ questions: JSON.parse(response.text()) });
  } catch (error) {
    console.error("Worksheet digitization failed:", error);
    return NextResponse.json({ error: "Unable to digitize worksheet image." }, { status: 500 });
  }
}
