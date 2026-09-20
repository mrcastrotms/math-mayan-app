"use client";

import { useMemo, useState } from "react";
import { normalizeWorksheetParts } from "../utils/worksheetParts.mjs";

export default function WorksheetEditModal({ work, onClose, onSave }) {
  const normalized = useMemo(() => normalizeWorksheetParts(work), [work]);
  const [title, setTitle] = useState(work.title || "");
  const [instructions, setInstructions] = useState(work.instructions || "");
  const [dueDate, setDueDate] = useState(work.dueDate || "");
  const [parts, setParts] = useState(normalized.parts);
  const [saving, setSaving] = useState(false);

  const updatePart = (partId, changes) => setParts((current) => current.map((part) => part.id === partId ? { ...part, ...changes } : part));
  const updateQuestion = (partId, questionId, changes) => setParts((current) => current.map((part) => part.id === partId
    ? { ...part, questions: part.questions.map((question) => question.id === questionId ? { ...question, ...changes } : question) }
    : part));
  const addQuestion = (partId) => setParts((current) => current.map((part) => part.id === partId
    ? { ...part, questions: [...part.questions, { id: `${part.id}-q${part.questions.length + 1}-${Date.now()}`, prompt: "", correctAnswer: "", acceptedAnswers: [""] }] }
    : part));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({ title, instructions, dueDate, parts });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-assignment-title">
      <form onSubmit={save} className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-[var(--app-fg)] shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div><h2 id="edit-assignment-title" className="text-2xl font-bold">Edit assigned work</h2><p className="text-sm opacity-75">Update questions and answer keys without creating a new assignment.</p></div>
          <button type="button" onClick={onClose} className="rounded-lg border px-3 py-2 font-bold">Close</button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold">Title<input value={title} onChange={(event) => setTitle(event.target.value)} required className="rounded-lg border bg-transparent p-3 font-normal" /></label>
          <label className="grid gap-1 text-sm font-bold">Due date<input type="datetime-local" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="rounded-lg border bg-transparent p-3 font-normal" /></label>
        </div>
        <label className="mt-3 grid gap-1 text-sm font-bold">Instructions<textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} rows="2" className="rounded-lg border bg-transparent p-3 font-normal" /></label>
        <div className="mt-5 grid gap-4">
          {parts.map((part) => (
            <fieldset key={part.id} className="grid gap-3 rounded-xl border border-current/20 p-4">
              <legend className="px-2 font-bold">{part.title || "Part"}</legend>
              <input aria-label="Part title" value={part.title} onChange={(event) => updatePart(part.id, { title: event.target.value })} className="rounded-lg border bg-transparent p-2" />
              <textarea aria-label="Part instruction" value={part.instruction} onChange={(event) => updatePart(part.id, { instruction: event.target.value })} rows="2" placeholder="Part instruction" className="rounded-lg border bg-transparent p-2" />
              {part.questions.map((question, index) => (
                <div key={question.id} className="grid gap-2 rounded-lg border border-current/10 p-3 md:grid-cols-2">
                  <label className="grid gap-1 text-sm font-semibold md:col-span-2">Question {index + 1}<textarea value={question.prompt || ""} onChange={(event) => updateQuestion(part.id, question.id, { prompt: event.target.value })} rows="2" className="rounded-lg border bg-transparent p-2 font-normal" /></label>
                  <label className="grid gap-1 text-sm font-semibold">Correct answer<input value={question.correctAnswer || ""} onChange={(event) => updateQuestion(part.id, question.id, { correctAnswer: event.target.value, acceptedAnswers: [event.target.value] })} className="rounded-lg border bg-transparent p-2 font-normal" /></label>
                  <label className="grid gap-1 text-sm font-semibold">Accepted answers<input value={(question.acceptedAnswers || []).join(", ")} onChange={(event) => updateQuestion(part.id, question.id, { acceptedAnswers: event.target.value.split(",").map((answer) => answer.trim()).filter(Boolean) })} className="rounded-lg border bg-transparent p-2 font-normal" /></label>
                </div>
              ))}
              <button type="button" onClick={() => addQuestion(part.id)} className="w-fit rounded-lg border px-3 py-2 text-sm font-bold">Add question</button>
            </fieldset>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-lg border px-4 py-3 font-bold">Cancel</button><button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button></div>
      </form>
    </div>
  );
}
