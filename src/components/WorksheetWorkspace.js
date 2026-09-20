"use client";

import { useEffect, useState } from "react";
import { useWorksheetAttempt } from "../hooks/useWorksheetAttempt";
import { isWorksheetClosed } from "../utils/worksheetUtils.mjs";
import MathExpression from "./MathExpression";
import ThemeToggle from "./ThemeToggle";
import { useAppTheme } from "../hooks/useAppTheme";

export default function WorksheetWorkspace({ worksheet, student, onBack }) {
  const [showSubmit, setShowSubmit] = useState(false);
  const [hint, setHint] = useState("");
  const attempt = useWorksheetAttempt(worksheet, student);
  const themeState = useAppTheme({ studentUid: student.uid });
  const closed = isWorksheetClosed(worksheet.dueDate);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, Math.floor((new Date(worksheet.dueDate).getTime() - Date.now()) / 1000)));
  const currentQuestion = worksheet.questions[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft(Math.max(0, Math.floor((new Date(worksheet.dueDate).getTime() - Date.now()) / 1000))), 1000);
    return () => clearInterval(timer);
  }, [worksheet.dueDate]);

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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{worksheet.title}</h1>
              <p className="text-sm opacity-75">{student.name} · Section {student.section}</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle theme={themeState.theme} changeTheme={themeState.changeTheme} disabled={themeState.themeLocked} />
              <span className="rounded-lg bg-slate-900 px-3 py-2 font-mono text-sm text-white" aria-label="Time remaining">
                {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
              </span>
            </div>
          </div>
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
        <div className="rounded-2xl border border-current/20 p-5">
            <label className="block">
              <span className="mb-5 block text-xl font-bold">
                {currentIndex + 1} of {worksheet.questions.length}. <MathExpression value={currentQuestion.prompt} />
              </span>
              <input
                aria-label={`Answer question ${currentIndex + 1}`}
                inputMode={currentQuestion.type === "numeric" ? "decimal" : "text"}
                disabled={closed}
                value={attempt.answers[currentQuestion.id] || ""}
                onChange={(event) => attempt.saveProgress({ ...attempt.answers, [currentQuestion.id]: event.target.value })}
                className="w-full rounded-lg border-2 border-current/30 bg-transparent p-3 text-lg"
              />
            </label>
          <div className="mt-5 flex flex-wrap justify-between gap-3">
            <button type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex((value) => value - 1)} className="rounded-lg border px-4 py-3 font-bold disabled:opacity-40">Previous</button>
            <button type="button" disabled={currentIndex === worksheet.questions.length - 1} onClick={() => setCurrentIndex((value) => value + 1)} className="rounded-lg bg-blue-600 px-4 py-3 font-bold text-white disabled:opacity-40">Next question</button>
          </div>
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
