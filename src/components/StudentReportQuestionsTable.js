// src/components/StudentReportQuestionsTable.js
import React from "react";
import { formatReadableAnswer } from "../utils/gradebookUtils";

export default function StudentReportQuestionsTable({ answers = [] }) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-slate-800">Exam Questions</h3>
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-600 uppercase tracking-wider">
              <th className="p-3 border-b">#</th>
              <th className="p-3 border-b">Question</th>
              <th className="p-3 border-b">Student Input</th>
              <th className="p-3 border-b">Correct Answer</th>
              <th className="p-3 border-b">Status</th>
              <th className="p-3 border-b">Observation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {answers.map((ans, idx) => {
              const rawQuestion =
                typeof ans.question === "object" && ans.question !== null
                  ? ans.question.question ||
                    ans.question.instruction ||
                    ans.question.prompt
                  : ans.question || ans.questionText || `Question ${idx + 1}`;
              const displayQuestion =
                typeof rawQuestion === "object"
                  ? JSON.stringify(rawQuestion)
                  : String(rawQuestion ?? `Question ${idx + 1}`);

              const rawCorrect =
                typeof ans.correctAnswer === "object" &&
                ans.correctAnswer !== null
                  ? ans.correctAnswer.answer ||
                    ans.correctAnswer.value ||
                    JSON.stringify(ans.correctAnswer)
                  : (ans.correctAnswer ?? "—");
              const displayCorrect = String(rawCorrect);

              const rawObs =
                typeof ans.observation === "object" && ans.observation !== null
                  ? ans.observation.note ||
                    ans.observation.text ||
                    JSON.stringify(ans.observation)
                  : (ans.observation ??
                    (ans.isCorrect ? "Mastered" : "Needs review"));
              const displayObservation = String(rawObs);

              return (
                <tr
                  key={idx}
                  className="border-b last:border-0 hover:bg-slate-50/50"
                >
                  <td className="p-3 font-mono">
                    {ans.questionNumber ?? idx + 1}
                  </td>
                  <td className="p-3 font-bold">{displayQuestion}</td>
                  <td className="p-3 font-mono">{formatReadableAnswer(ans)}</td>
                  <td className="p-3 font-mono text-slate-600">
                    {displayCorrect}
                  </td>
                  <td className="p-3 font-bold">
                    {ans.isCorrect ? (
                      <span className="text-green-600">Correct</span>
                    ) : (
                      <span className="text-red-600">Incorrect</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-500 text-xs italic">
                    {displayObservation}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
