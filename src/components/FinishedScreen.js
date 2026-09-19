// src/components/FinishedScreen.js
"use client";
import React from "react";
import ScoreSummaryCard from "./ScoreSummaryCard";
import StudentAnswersTable from "./StudentAnswersTable";

export default function FinishedScreen({
  student,
  selectedSection,
  finalScore,
  isSaving,
  handleReturnHome,
  studentAnswers = [],
  demerits = 0,
  children,
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start p-4 md:p-8 font-sans print:bg-white print:p-0">
      <ScoreSummaryCard
        student={student}
        selectedSection={selectedSection}
        finalScore={finalScore}
        isSaving={isSaving}
        handleReturnHome={handleReturnHome}
        demerits={demerits}
      />

      <StudentAnswersTable
        studentAnswers={studentAnswers}
        demerits={demerits}
      />

      <div className="print:hidden mt-8 w-full max-w-3xl">{children}</div>
    </div>
  );
}
