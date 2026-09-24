// src/components/StudentAnswersTable.js
import React from "react";

export default function StudentAnswersTable({
 studentAnswers = [],
 demerits = 0,
}) {
 return (
 <div className="mt-8 w-full max-w-3xl bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-100 print:shadow-none print:border-none print:p-0 print:mt-0">
 <h3 className="text-2xl font-black text-slate-800 mb-6 border-b pb-4">
 Detailed Assessment Report
 </h3>

 {demerits > 0 && (
 <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
 <p className="font-bold text-red-600">
 Behavior Demerits Logged: {demerits}
 </p>
 <p className="text-sm text-red-500">
 (-{demerits * 5}% penalty applied to final score)
 </p>
 </div>
 )}

 <div className="overflow-x-auto w-full">
 <table className="w-full text-left border-collapse min-w-[600px]">
 <thead>
 <tr className="bg-slate-100 border-b-2 border-slate-200 text-slate-700 print:bg-transparent print:border-b-4 print:border-black">
 <th className="p-4 font-bold uppercase tracking-wider text-sm w-12">
 #
 </th>
 <th className="p-4 font-bold uppercase tracking-wider text-sm">
 Question
 </th>
 <th className="p-4 font-bold uppercase tracking-wider text-sm">
 Student Answer
 </th>
 <th className="p-4 font-bold uppercase tracking-wider text-sm">
 Correct Answer
 </th>
 </tr>
 </thead>
 <tbody>
 {(!Array.isArray(studentAnswers) || studentAnswers.length === 0) ? (
 <tr>
 <td
 colSpan="4"
 className="p-8 text-center font-bold text-slate-400"
 >
 Blank Assessment Submitted (0 answers)
 </td>
 </tr>
 ) : (
 (Array.isArray(studentAnswers) ? studentAnswers : []).map((ans, index) => (
 <tr
 key={index}
 className="border-b border-slate-100 print:border-slate-300"
 >
 <td className="p-4 font-bold text-slate-400">{index + 1}</td>
 <td className="p-4 text-slate-800 font-medium">
 <div dangerouslySetInnerHTML={{ __html: ans?.question?.question || ans?.question?.text || ans?.question?.prompt || (typeof ans?.question === "string" ? ans?.question : "Unknown Question") }} />
 </td>
 <td className="p-4">
 <span
 className={`font-bold px-3 py-1 rounded-lg ${
 ans?.isCorrect
 ? "bg-green-100 text-green-700 print:bg-transparent print:text-black"
 : "bg-red-100 text-red-700 print:bg-transparent print:text-black"
 }`}
 >
 {ans?.studentInput || "Skipped"}
 {!ans.isCorrect && " "}
 {ans.isCorrect && " "}
 </span>
 </td>
 <td className="p-4 font-bold text-slate-600">{ans?.correctAnswer || ans?.question?.answer || ans?.expected || "MISSING FROM DB"}</td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 );
}
