"use client";

export default function ConfirmSubmitModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-slate-900">Submit Exam?</h3>
          <p className="text-slate-600">
            Are you sure you want to finish and submit your exam? You won't be
            able to change your answers after this.
          </p>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-200 active:bg-slate-300"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 active:bg-blue-800"
          >
            Yes, Submit
          </button>
        </div>
      </div>
    </div>
  );
}
