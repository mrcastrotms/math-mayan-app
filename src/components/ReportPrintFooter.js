// src/components/ReportPrintFooter.js
import React from "react";
import { QRCodeSVG } from "qrcode.react";

export default function ReportPrintFooter({ reportUrl, recordId }) {
  return (
    <div className="border-t-2 border-slate-200 pt-4 flex items-center justify-between mt-auto">
      <div className="flex items-center gap-4">
        <div className="p-1 bg-white border border-slate-300 rounded">
          <QRCodeSVG value={reportUrl} size={76} level="M" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-900">Digital Record</h3>
          <p className="text-[10px] text-slate-500 max-w-sm leading-tight mt-0.5">
            Point a camera at this QR code to view the complete report.
          </p>
          <span className="text-[9px] font-mono text-blue-600 truncate block mt-1">
            {reportUrl}
          </span>
        </div>
      </div>

      <div className="text-right text-[10px] text-slate-400">
        <p>Official Evaluation</p>
        <p className="font-mono mt-0.5">Doc ID: {recordId}</p>
      </div>
    </div>
  );
}
