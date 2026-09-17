// src/components/ParentQuestionCard.js
import React from "react";
import { formatReadableAnswer } from "../utils/gradebookUtils";

export default function ParentQuestionCard({ ans, index }) {
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
          {ans.question}
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
              {ans.correctAnswer}
            </span>
          </p>
        )}
        {ans.observation && (
          <p className="text-slate-400 italic text-xs mt-1">
            Note: {ans.observation}
          </p>
        )}
      </div>
    </div>
  );
}
