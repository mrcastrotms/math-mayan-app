import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { question, instruction = "", observation = "" } = body;

    if (!question) {
      return NextResponse.json({ error: "Question text is required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an encouraging 4th and 5th grade math coach. Provide a concise, conceptual hint (1 to 2 sentences maximum) that helps the student reason through this problem on their own. NEVER reveal the final answer or do the final arithmetic for them.

Question: "${question}"
Instruction: "${instruction}"
Concept Focus: "${observation}"

Respond with ONLY the hint text, no formatting, quotes, emojis, or conversational filler.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const rawText = typeof response.text === "function" ? response.text() : response.text;
      const hint = rawText?.trim();
      if (hint) {
        return NextResponse.json({ hint });
      }
    }

    let fallback = "Think about the relationship between the numbers and the operations needed.";
    const qLower = question.toLowerCase();
    if (qLower.includes("times as much") || qLower.includes("times greater")) {
      fallback = "Remember that each step to the left on the place value chart is 10 times greater. What happens when you divide by 10?";
    } else if (qLower.includes("round") || qLower.includes("nearest")) {
      fallback = "Identify the digit in the rounding place, then look at the neighbor to its right to decide whether to round up or stay the same.";
    } else if (qLower.includes("sum") || qLower.includes("+") || qLower.includes("add")) {
      fallback = "Line up your numbers by place value and add column by column, remembering to regroup if a column reaches 10 or more.";
    } else if (qLower.includes("difference") || qLower.includes("-") || qLower.includes("subtract")) {
      fallback = "Align place values starting from the ones column, and remember to unbundle or borrow from the next column if needed.";
    } else if (observation) {
      fallback = `Focus on this core concept: ${observation}. How does that apply here?`;
    }

    return NextResponse.json({ hint: fallback });
  } catch (error) {
    console.error("[API/HINT] Error generating hint:", error);
    return NextResponse.json(
      { hint: "Break the problem down step by step: examine what the question is asking and test a reasonable estimate." },
      { status: 200 }
    );
  }
}
