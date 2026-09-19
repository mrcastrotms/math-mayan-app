"use client";

import React from "react";
import StudentReportPrintSheet from "../StudentReportPrintSheet";

export default function GradebookBatchPrint({
  isPreparingPrint,
  printableSubmissions = [],
  currentOrigin,
}) {
  if (!isPreparingPrint) return null;

  return (
    <div
      id="batch-print-container"
      className="hidden print:block w-full bg-white text-black"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body {
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              #batch-print-container {
                display: block !important;
              }
              .report-page {
                page-break-after: always !important;
                break-after: page !important;
                min-height: 100vh;
              }
              .report-page:last-child {
                page-break-after: auto !important;
                break-after: auto !important;
              }
            }
          `,
        }}
      />
      {printableSubmissions.map((record) => (
        <StudentReportPrintSheet
          key={record.id || `${record.name}-${record.timestamp}`}
          record={record}
          baseUrl={currentOrigin}
        />
      ))}
    </div>
  );
}
