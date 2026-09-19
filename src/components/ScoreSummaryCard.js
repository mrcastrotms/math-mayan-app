// src/components/ScoreSummaryCard.js
import React from "react";

export default function ScoreSummaryCard({
  student,
  selectedSection,
  finalScore,
  isSaving,
  handleReturnHome,
  demerits = 0,
}) {
  const handleEmailReport = () => {
    const studentName = student?.name || "Your student";
    const subject = encodeURIComponent(`Math Assessment Score: ${studentName}`);

    let bodyText = `Hello!\n\n${studentName} just finished their Math Assessment for Section ${selectedSection}.\n\n`;
    bodyText += `Final Score: ${finalScore}%\n`;
    if (demerits > 0) bodyText += `Demerits: ${demerits} (-${demerits * 5}%)\n`;
    bodyText += `\nMr. Castro has the full detailed report saved in the Gradebook.\n\n- The Mayan School Math App`;

    const body = encodeURIComponent(bodyText);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
    window.open(gmailUrl, "_blank");
  };

  return (
    <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-3xl text-center border border-slate-100 print:shadow-none print:border-none print:p-0 print:mb-8">
      {/* Printable Header */}
      <div className="hidden print:block mb-6 text-left">
        <h2 className="text-3xl font-black text-slate-800">The Mayan School</h2>
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
          Saving to Mr. Castro&apos;s Gradebook...
        </p>
      ) : (
        <p className="text-green-500 font-bold text-lg mb-8 print:hidden">
          Saved to Gradebook
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden max-w-xl mx-auto">
        <button
          type="button"
          onClick={() => window.print()}
          className="w-full bg-indigo-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg active:scale-95"
        >
          Print / Save PDF
        </button>

        <button
          type="button"
          onClick={handleEmailReport}
          className="w-full bg-blue-50 text-blue-600 border border-blue-100 font-bold text-lg py-4 rounded-xl hover:bg-blue-100 transition active:scale-95"
        >
          Email to Parents (Gmail)
        </button>

        <button
          type="button"
          onClick={handleReturnHome}
          className="w-full md:col-span-2 bg-slate-100 text-slate-600 font-bold text-lg py-4 rounded-xl hover:bg-slate-200 transition"
        >
          Back to Start
        </button>
      </div>
    </div>
  );
}
