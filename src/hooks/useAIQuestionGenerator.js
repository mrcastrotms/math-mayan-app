// src/hooks/useAIQuestionGenerator.js
import { useState } from "react";
import { saveGeneratedQuestion } from "../services/cloudQuestionService";

export function useAIQuestionGenerator() {
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  const handleGenerateAIQuestions = async () => {
    setIsGeneratingQuestions(true);
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeLevel: "4th and 5th Grade",
          topic: "Multi-digit Operations and Fractions",
          count: 5,
          tier: "standard",
        }),
      });
      const data = await res.json();
      if (data.questions?.length) {
        await Promise.all(data.questions.map((q) => saveGeneratedQuestion(q)));
        alert(
          `Successfully generated & saved ${data.questions.length} adaptive questions to Firestore!`,
        );
      } else {
        alert(
          "No questions returned. Check your GEMINI_API_KEY environment variable.",
        );
      }
    } catch (err) {
      console.error("AI Generation error:", err);
      alert("Failed to generate questions. Check console logs.");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  return { isGeneratingQuestions, handleGenerateAIQuestions };
}
