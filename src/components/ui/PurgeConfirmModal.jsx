"use client";

import React, { useEffect } from "react";

export default function PurgeConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  count = 1,
  isProcessing = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isProcessing) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-red-500/40 bg-slate-900 p-6 text-white shadow-2xl">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-red-400">
            Destructive Action
          </span>
          <h3 className="text-lg font-bold text-slate-100">
            Confirm Permanent Purge
          </h3>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          PERMANENT DELETE: This will delete the document completely. The QR code and report link will no longer work. Proceed?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="touch-manipulation rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={onConfirm}
            className="touch-manipulation rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-red-700 active:bg-red-800 disabled:opacity-50"
          >
            {isProcessing ? "Purging..." : `Purge (${count})`}
          </button>
        </div>
      </div>
    </div>
  );
}
