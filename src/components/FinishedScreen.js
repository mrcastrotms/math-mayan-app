"use client";
import React from "react";

export default function FinishedScreen({
  student,
  selectedSection,
  finalScore,
  isSaving,
  handleTryAgain,
  studentAnswers = [], // Passed from page.js for the detailed table
  demerits = 0, // Passed from page.js
  children,
}) {
  // Opens a direct Gmail web tab instead of relying on broken mailto: links on Lenovo/Chrome
  const handleEmailReport = () => {
    const studentName = student?.name || "Your student";
    const subject = encodeURIComponent(`Math Assessment Score: ${studentName}`);

    let bodyText = `Hello!\n\n${studentName} just finished their Math Assessment for Section ${selectedSection}.\n\n`;
    bodyText += `Final Score: ${finalScore}%\n`;
    if (demerits > 0) bodyText += `Demerits: ${demerits} (-${demerits * 5}%)\n`;
    bodyText += `\nMr. Castro has the full detailed report saved in the Gradebook.\n\n- The Mayan School Math App`;

    const body = encodeURIComponent(bodyText);

    // The magic Gmail web compose URL
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;

    // Opens in a new tab so they don't lose the test page
    window.open(gmailUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start p-4 md:p-8 font-sans print:bg-white print:p-0">
      {/* 1. TOP CARD: THE FINAL SCORE */}
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-3xl text-center border border-slate-100 print:shadow-none print:border-none print:p-0 print:mb-8">
        {/* Printable Header (Only shows on the PDF) */}
        <div className="hidden print:block mb-6 text-left">
          <h2 className="text-3xl font-black text-slate-800">
            The Mayan School
          </h2>
          <p className="text-slate-500 text-lg">Mathematics with Mr. Castro</p>
          <hr className="my-4 border-slate-300" />
          <div className="flex justify-between font-bold text-slate-700">
            <p>Student: {student?.name || "Anonymous"}</p>
            <p>Section: {selectedSection}</p>
          </div>
        </div>

        <h1 className="text-4xl font-black text-slate-800 mb-2 print:hidden">
          Exam Complete!
        </h1>
        <p className="text-slate-500 font-medium mb-6 text-lg print:hidden">
          Great job,{" "}
          <span className="font-bold text-slate-700">
            {student?.name || "Student"}
          </span>
          !
        </p>

        {/* Score Display */}
        <div
          className={`text-7xl md:text-8xl font-black mb-6 print:text-left print:text-6xl print:text-black ${
            finalScore >= 80
              ? "text-green-500"
              : finalScore >= 70
                ? "text-amber-500"
                : "text-red-500"
          }`}
        >
          {finalScore}%
        </div>

        {isSaving ? (
          <p className="text-blue-500 font-bold animate-pulse text-lg mb-8 print:hidden">
            Saving to Mr. Castro's Gradebook...
          </p>
        ) : (
          <p className="text-green-500 font-bold text-lg mb-8 print:hidden">
            ✓ Saved to Gradebook
          </p>
        )}

        {/* Action Buttons (Hidden when printing to PDF) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden max-w-xl mx-auto">
          <button
            onClick={() => window.print()}
            className="w-full bg-indigo-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg active:scale-95"
          >
            📄 Print / Save PDF
          </button>

          <button
            onClick={handleEmailReport}
            className="w-full bg-blue-50 text-blue-600 border border-blue-100 font-bold text-lg py-4 rounded-xl hover:bg-blue-100 transition active:scale-95"
          >
            ✉️ Email to Parents (Gmail)
          </button>

          <button
            onClick={handleTryAgain}
            className="w-full md:col-span-2 bg-slate-100 text-slate-600 font-bold text-lg py-4 rounded-xl hover:bg-slate-200 transition"
          >
            Back to Start
          </button>
        </div>
      </div>

      {/* 2. BOTTOM CARD: THE DETAILED REPORT */}
      <div className="mt-8 w-full max-w-3xl bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-100 print:shadow-none print:border-none print:p-0 print:mt-0">
        <h3 className="text-2xl font-black text-slate-800 mb-6 border-b pb-4">
          Detailed Assessment Report
        </h3>

        {demerits > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="font-bold text-red-600">
              ⚠️ Behavior Demerits Logged: {demerits}
            </p>
            <p className="text-sm text-red-500">
              (-{demerits * 5}% penalty applied to final score)
            </p>
          </div>
        )}

        {/* Responsive Table wrapper so it scrolls nicely on Chromebooks */}
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
              {studentAnswers.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="p-8 text-center font-bold text-slate-400"
                  >
                    Blank Assessment Submitted (0 answers)
                  </td>
                </tr>
              ) : (
                studentAnswers.map((ans, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100 print:border-slate-300"
                  >
                    <td className="p-4 font-bold text-slate-400">
                      {index + 1}
                    </td>

                    {/* The Question Text */}
                    <td className="p-4 text-slate-800 font-medium">
                      {ans.question?.text || ans.question || "Unknown Question"}
                    </td>

                    {/* What the student typed */}
                    <td className="p-4">
                      <span
                        className={`font-bold px-3 py-1 rounded-lg ${
                          ans.isCorrect
                            ? "bg-green-100 text-green-700 print:bg-transparent print:text-black"
                            : "bg-red-100 text-red-700 print:bg-transparent print:text-black"
                        }`}
                      >
                        {ans.studentInput || "Skipped"}
                        {!ans.isCorrect && " ❌"}
                        {ans.isCorrect && " ✅"}
                      </span>
                    </td>

                    {/* The Correct Answer */}
                    <td className="p-4 font-bold text-slate-600">
                      {ans.correctAnswer}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dev Panel Injection */}
      <div className="print:hidden mt-8 w-full max-w-3xl">{children}</div>
    </div>
  );
}
