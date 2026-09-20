"use client";

import { useState } from "react";
import { createWorksheet } from "../services/worksheetService";

function createQuestions(rawQuestions) {
  return rawQuestions
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [prompt, answer = ""] = line.split("|");
      return {
        id: `q${index + 1}`,
        type: "text",
        prompt: prompt.trim(),
        correctAnswer: answer.trim(),
        acceptedAnswers: [answer.trim()],
      };
    });
}

export default function WorksheetBuilderCard({ availableSections = [] }) {
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [section, setSection] = useState(availableSections[0] || "");
  const [dueDate, setDueDate] = useState("");
  const [rawQuestions, setRawQuestions] = useState("");
  const [status, setStatus] = useState("");
  const [isDigitizing, setIsDigitizing] = useState(false);

  const handleDigitize = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsDigitizing(true);
    try {
      const image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const response = await fetch("/api/worksheets/digitize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, mimeType: file.type || "image/jpeg" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setRawQuestions(result.questions.map((question) =>
        `${question.prompt} | ${question.correctAnswer}`).join("\n"));
      setStatus("Review the digitized questions before posting.");
    } catch (error) {
      console.error("Worksheet OCR failed:", error);
      setStatus("Could not digitize that image. You can enter questions manually.");
    } finally {
      setIsDigitizing(false);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const questions = createQuestions(rawQuestions);
    if (!title.trim() || !section || !dueDate || questions.length === 0) {
      setStatus("Add a title, section, due date, and at least one question.");
      return;
    }
    setStatus("Saving assignment…");
    try {
      await createWorksheet({ title, instructions, section, dueDate, questions });
      setTitle("");
      setInstructions("");
      setDueDate("");
      setRawQuestions("");
      setStatus("Assignment posted.");
    } catch (error) {
      console.error("Unable to create worksheet:", error);
      setStatus("Assignment could not be saved.");
    }
  };

  return (
    <section aria-labelledby="worksheet-builder-title" className="mb-6 w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-800 p-6 text-white shadow-xl">
      <h2 id="worksheet-builder-title" className="mb-2 text-xl font-bold">Assign Classwork</h2>
      <p className="mb-4 text-sm text-slate-300">Create mobile-friendly work. One question per line using <code>prompt | answer</code>.</p>
      <form onSubmit={handleCreate} className="grid gap-4">
        <label className="grid gap-1 text-sm font-bold">Title
          <input required value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-lg bg-slate-900 p-3 text-white" />
        </label>
        <label className="grid gap-1 text-sm font-bold">Instructions
          <textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} rows="2" className="rounded-lg bg-slate-900 p-3 text-white" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold">Section
            <select required value={section} onChange={(event) => setSection(event.target.value)} className="rounded-lg bg-slate-900 p-3 text-white">
              {availableSections.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold">Due date and time
            <input required type="datetime-local" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="rounded-lg bg-slate-900 p-3 text-white" />
          </label>
        </div>
        <label className="grid gap-1 text-sm font-bold">Questions
          <textarea required value={rawQuestions} onChange={(event) => setRawQuestions(event.target.value)} rows="5" placeholder={"Write 4^4 as repeated multiplication | 4*4*4*4"} className="rounded-lg bg-slate-900 p-3 text-white" />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Digitize a photographed worksheet (optional)
          <input type="file" accept="image/*" capture="environment" onChange={handleDigitize} disabled={isDigitizing} className="rounded-lg border border-slate-600 p-3 text-sm" />
          <span className="text-xs font-normal text-slate-400">{isDigitizing ? "Reading worksheet…" : "Review the generated text and answers before posting."}</span>
        </label>
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-3 font-bold hover:bg-blue-500">Post assigned work</button>
        {status && <p role="status" aria-live="polite" className="text-sm text-emerald-300">{status}</p>}
      </form>
    </section>
  );
}
