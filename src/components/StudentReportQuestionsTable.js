// src/components/StudentReportQuestionsTable.js
import React from "react";
import { formatReadableAnswer } from "../utils/reportFormattingUtils";

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
          <tbody>
            {answers.map((ans, idx) => (
              <tr key={idx} className="border-b last:border-0">
                <td className="p-3 font-mono">{ans.questionNumber}</td>
                <td className="p-3 font-bold">{ans.question}</td>
                <td className="p-3 font-mono">{formatReadableAnswer(ans)}</td>
                <td className="p-3 font-mono text-slate-600">
                  {ans.correctAnswer}
                </td>
                <td className="p-3 font-bold">
                  {ans.isCorrect ? (
                    <span className="text-green-600">Correct</span>
                  ) : (
                    <span className="text-red-600">Incorrect</span>
                  )}
                </td>
                <td className="p-3 text-slate-500 text-xs italic">
                  {ans.observation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
