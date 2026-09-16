"use client";
import React from "react";

export default function FinishedScreen({
  student,
  selectedSection,
  finalScore,
  isSaving,
  handleTryAgain,
  children, // For the dev admin panel
}) {
  // Opens the iPad/Computer native email app with a pre-written message!
  const handleEmailReport = () => {
    const studentName = student?.name || "Your student";
    const subject = encodeURIComponent(`Math Assessment Score: ${studentName}`);
    const body = encodeURIComponent(
      `Hello!\n\n${studentName} just finished their Math Assessment for Section ${selectedSection}.\n\n` +
        `Final Score: ${finalScore}%\n\n` +
        `Mr. Castro has the full detailed report saved in the Gradebook.\n\n` +
        `- The Mayan School Math App`,
    );

    // This triggers the native email daemon
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* The main score card */}
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-lg text-center border border-slate-100 print:shadow-none print:border-none">
        {/* Printable Header (Only shows on the PDF) */}
        <div className="hidden print:block mb-8">
          <h2 className="text-2xl font-black text-slate-800">
            The Mayan School
          </h2>
          <p className="text-slate-500">Mathematics with Mr. Castro</p>
          <hr className="my-4 border-slate-200" />
        </div>

        <h1 className="text-4xl font-black text-slate-800 mb-2">
          Exam Complete!
        </h1>
        <p className="text-slate-500 font-medium mb-8 text-lg">
          Great job,{" "}
          <span className="font-bold text-slate-700">
            {student?.name || "Student"}
          </span>
          !
        </p>

        {/* Score Display */}
        <div
          className={`text-8xl font-black mb-8 print:text-black ${
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
          <p className="text-blue-500 font-bold animate-pulse text-lg mb-8">
            Saving to Mr. Castro's Gradebook...
          </p>
        ) : (
          <p className="text-green-500 font-bold text-lg mb-8 print:hidden">
            ✓ Saved to Gradebook
          </p>
        )}

        {/* Action Buttons (Hidden when printing to PDF) */}
        <div className="space-y-4 print:hidden">
          <button
            onClick={() => window.print()}
            className="w-full bg-indigo-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 active:scale-95"
          >
            📄 Save / Print PDF
          </button>

          <button
            onClick={handleEmailReport}
            className="w-full bg-blue-50 text-blue-600 border border-blue-100 font-bold text-lg py-4 rounded-xl hover:bg-blue-100 transition active:scale-95"
          >
            ✉️ Email to Parents
          </button>

          <button
            onClick={handleTryAgain}
            className="w-full bg-slate-100 text-slate-600 font-bold text-lg py-4 rounded-xl hover:bg-slate-200 transition mt-4"
          >
            Back to Start
          </button>
        </div>
      </div>

      {/* Dev Panel Injection */}
      <div className="print:hidden mt-8 w-full max-w-lg">{children}</div>
    </div>
  );
}
