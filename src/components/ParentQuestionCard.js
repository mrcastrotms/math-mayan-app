// src/components/ParentQuestionCard.js
import React from "react";
import { formatReadableAnswer } from "../utils/reportFormattingUtils";

export default function ParentQuestionCard({ ans, index }) {
  if (!ans) return null;

  // 1. Sanitize Question Text
  const rawQuestion =
    typeof ans.question === "object" && ans.question !== null
      ? ans.question.question || ans.question.instruction || ans.question.prompt || "Question"
      : ans.question || ans.questionText || `Question ${index + 1}`;
  const displayQuestion = typeof rawQuestion === "object" ? JSON.stringify(rawQuestion) : String(rawQuestion);

  // 2. Sanitize Correct Answer
  const rawCorrect =
    typeof (ans.correctAnswer ?? ans.question?.correctAnswer ?? ans.correct_answer) === "object" &&
    (ans.correctAnswer ?? ans.question?.correctAnswer ?? ans.correct_answer) !== null
      ? (ans.correctAnswer ?? ans.question?.correctAnswer ?? ans.correct_answer).answer ||
        (ans.correctAnswer ?? ans.question?.correctAnswer ?? ans.correct_answer).value ||
        JSON.stringify(ans.correctAnswer ?? ans.question?.correctAnswer ?? ans.correct_answer)
      : (ans.correctAnswer ?? ans.question?.correctAnswer ?? ans.correct_answer ?? "—");
  const displayCorrect = String(rawCorrect);

  // 3. Sanitize Observation
  const rawObs =
    typeof ans.observation === "object" && ans.observation !== null
      ? ans.observation.note || ans.observation.text || JSON.stringify(ans.observation)
      : (ans.observation ?? (ans.question?.observation || ""));
  const displayObs = typeof rawObs === "object" ? JSON.stringify(rawObs) : String(rawObs || "");

  return (
    <div
      className={`p-5 rounded-2xl border-2 ${
        ans.isCorrect ? "border-green-200 bg-white" : "border-red-200 bg-white"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <p className="font-bold text-lg text-slate-800 leading-tight">
          <span className="text-slate-400 mr-2">
            Q{ans.questionNumber || index + 1}.
          </span>{" "}
          {displayQuestion}
        </p>
        <span
          className={`text-2xl font-black ${
            ans.isCorrect ? "text-green-500" : "text-red-500"
          }`}
        >
          {ans.isCorrect ? "✓" : "✗"}
        </span>
      </div>

      <div className="flex flex-col gap-1 text-sm mt-3 pt-3 border-t border-slate-100">
        <p className="font-bold text-slate-600">
          Student Answer:{" "}
          <span
            className={
              ans.isCorrect
                ? "text-green-600 text-base"
                : "text-red-600 text-base"
            }
          >
            {formatReadableAnswer(ans)}
          </span>
        </p>

        {!ans.isCorrect && (
          <p className="font-bold text-slate-500">
            Correct Answer:{" "}
            <span className="text-slate-900 text-base">
              {displayCorrect}
            </span>
          </p>
        )}

        {displayObs && (
          <p className="text-slate-400 italic text-xs mt-1">
            Note: {displayObs}
          </p>
        )}
      </div>
    </div>
  );
}
