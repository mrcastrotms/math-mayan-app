"use client";

import { useState } from "react";
import { useWorksheetAttempt } from "../hooks/useWorksheetAttempt";
import { isWorksheetClosed } from "../utils/worksheetUtils.mjs";

export default function WorksheetWorkspace({ worksheet, student, onBack }) {
  const [showSubmit, setShowSubmit] = useState(false);
  const [hint, setHint] = useState("");
  const attempt = useWorksheetAttempt(worksheet, student);
  const closed = isWorksheetClosed(worksheet.dueDate);

  if (attempt.status === "submitted") {
    return (
      <main className="min-h-screen bg-[var(--app-bg)] p-4 text-[var(--app-fg)] sm:p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-current/20 p-6 text-center">
          <h1 className="text-2xl font-bold">{worksheet.title}</h1>
          <p className="mt-3">Submitted. Score: {attempt.result.score}%</p>
          <button type="button" onClick={onBack} className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-bold text-white">Back to assignments</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--app-bg)] p-4 text-[var(--app-fg)] sm:p-8">
      <div className="mx-auto max-w-3xl">
        <button type="button" onClick={onBack} className="mb-4 font-bold underline">← Back to home</button>
        <header className="mb-6 rounded-2xl border border-current/20 p-5">
          <h1 className="text-2xl font-bold">{worksheet.title}</h1>
          <p className="mt-2 text-sm opacity-80">{worksheet.instructions}</p>
          <p role="status" aria-live="polite" className="mt-3 text-sm font-semibold">
            {attempt.status === "saving" ? "Saving progress…" : attempt.status === "saved" ? "Progress saved" : `${attempt.result.answered} of ${attempt.result.total} answered`}
          </p>
        </header>
        {attempt.error && <p role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-red-800">{attempt.error}</p>}
        <div className="mb-4 rounded-lg border border-indigo-300/40 p-3">
          <button
            type="button"
            disabled={attempt.hintsUsed >= 4 || attempt.status === "submitting"}
            onClick={async () => setHint(await attempt.requestHint(worksheet.questions.find((question) => !attempt.answers[question.id])))}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            title={attempt.hintsUsed >= 4 ? "Hint limit reached" : "Get a Socratic hint"}
          >
            Need a hint? ({4 - attempt.hintsUsed} remaining)
          </button>
          {hint && <p role="status" className="mt-2 text-sm">{hint}</p>}
        </div>
        <div className="grid gap-4">
          {worksheet.questions.map((question, index) => (
            <label key={question.id} className="rounded-2xl border border-current/20 p-5">
              <span className="mb-3 block font-bold">
                {index + 1}. <span dangerouslySetInnerHTML={{ __html: question.prompt }} />
              </span>
              <input
                aria-label={`Answer question ${index + 1}`}
                inputMode={question.type === "numeric" ? "decimal" : "text"}
                disabled={closed}
                value={attempt.answers[question.id] || ""}
                onChange={(event) => attempt.saveProgress({ ...attempt.answers, [question.id]: event.target.value })}
                className="w-full rounded-lg border-2 border-current/30 bg-transparent p-3 text-lg"
              />
            </label>
          ))}
        </div>
        {showSubmit && (
          <div role="alertdialog" aria-labelledby="submit-assignment-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-900">
              <h2 id="submit-assignment-title" className="text-xl font-bold">Submit assignment?</h2>
              <p className="my-4">You answered {attempt.result.answered} of {attempt.result.total}. You can’t edit after submitting.</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowSubmit(false)} className="flex-1 rounded-lg bg-slate-200 px-4 py-3 font-bold">Keep working</button>
                <button type="button" onClick={async () => { if (await attempt.submit()) setShowSubmit(false); }} className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-bold text-white">Submit</button>
              </div>
            </div>
          </div>
        )}
        <button type="button" disabled={closed || attempt.status === "submitting"} onClick={() => setShowSubmit(true)} className="mt-6 w-full rounded-xl bg-emerald-600 px-5 py-4 text-lg font-bold text-white disabled:opacity-50">
          {closed ? "Assignment closed" : "Review and submit"}
        </button>
      </div>
    </main>
  );
}
