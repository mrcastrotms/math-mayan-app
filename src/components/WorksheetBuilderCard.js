"use client";

import { useState } from "react";
import { createWorksheet, publishWorksheet } from "../services/worksheetService";
import MathExpression from "./MathExpression";
import { normalizeWorksheetParts } from "../utils/worksheetParts.mjs";

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
  const [reviewQuestions, setReviewQuestions] = useState([]);
  const [reviewId, setReviewId] = useState("");
  const [parts, setParts] = useState([{ id: "part-a", title: "Part A", instruction: "", rawQuestions: "" }]);
  const [jsonInput, setJsonInput] = useState("");

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
      const questions = result.questions.map((question, index) => ({
        ...question,
        id: question.id || `q${index + 1}`,
        acceptedAnswers: question.acceptedAnswers?.length
          ? question.acceptedAnswers
          : [question.correctAnswer],
      }));
      setReviewQuestions(questions);
      setRawQuestions(questions.map((question) =>
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
    let importedParts = parts;
    if (jsonInput.trim()) {
      try {
        const parsed = JSON.parse(jsonInput);
        importedParts = parsed.parts || (Array.isArray(parsed.questions) ? [{ id: "part-a", title: "Part A", instruction: "", questions: parsed.questions }] : []);
        if (!importedParts.length) throw new Error("JSON must contain parts or questions.");
        setParts(importedParts.map((part, index) => ({
          id: part.id || `part-${String.fromCharCode(97 + index)}`,
          title: part.title || `Part ${String.fromCharCode(65 + index)}`,
          instruction: part.instruction || "",
          rawQuestions: (part.questions || []).map((question) => `${question.prompt} | ${question.correctAnswer}`).join("\n"),
        })));
      } catch (error) {
        setStatus(`Invalid worksheet JSON: ${error.message}`);
        return;
      }
    }
    const partData = importedParts.map((part, index) => ({
      id: part.id || `part-${String.fromCharCode(97 + index)}`,
      title: part.title || `Part ${String.fromCharCode(65 + index)}`,
      instruction: part.instruction || "",
      questions: part.questions || createQuestions(part.rawQuestions || (index === 0 ? rawQuestions : "")),
    }));
    const questions = reviewQuestions.length ? reviewQuestions : partData.flatMap((part) => part.questions);
    if (!title.trim() || !section || !dueDate || questions.length === 0) {
      setStatus("Add a title, section, due date, and at least one question.");
      return;
    }
    setReviewQuestions(normalizeWorksheetParts({ parts: partData }).questions);
    setStatus("Review every question and answer, then publish.");
  };

  const updatePart = (id, key, value) => {
    setParts((current) => current.map((part) => (part.id === id ? { ...part, [key]: value } : part)));
  };

  const addPart = () => {
    setParts((current) => [...current, {
      id: `part-${String.fromCharCode(97 + current.length)}`,
      title: `Part ${String.fromCharCode(65 + current.length)}`,
      instruction: "",
      rawQuestions: "",
    }]);
  };

  const updateReviewQuestion = (id, key, value) => {
    setReviewQuestions((current) => current.map((question) =>
      question.id === id ? { ...question, [key]: value, acceptedAnswers: key === "correctAnswer" ? [value] : question.acceptedAnswers } : question,
    ));
  };

  return (
    <section aria-labelledby="worksheet-builder-title" className="w-full max-w-4xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-[var(--app-fg)] shadow-xl">
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
          <textarea value={rawQuestions} onChange={(event) => setRawQuestions(event.target.value)} rows="5" placeholder={"Write 4^4 as repeated multiplication | 4*4*4*4"} className="rounded-lg bg-slate-900 p-3 text-white" />
        </label>
        <fieldset className="grid gap-3 rounded-xl border border-cyan-400/50 bg-slate-900 p-4">
          <legend className="px-2 text-sm font-bold text-cyan-300">Parts / Sections</legend>
          <p className="text-xs text-slate-300">Give each group its own instruction. Questions use <code>prompt | answer</code>.</p>
          {parts.map((part, index) => (
            <div key={part.id} className="grid gap-2 rounded-lg border border-slate-700 p-3">
              <label className="grid gap-1 text-xs font-bold">Part {index + 1} title
                <input value={part.title} onChange={(event) => updatePart(part.id, "title", event.target.value)} className="rounded-lg bg-slate-800 p-2 text-white" />
              </label>
              <label className="grid gap-1 text-xs font-bold">Part instruction
                <textarea value={part.instruction} onChange={(event) => updatePart(part.id, "instruction", event.target.value)} rows="2" className="rounded-lg bg-slate-800 p-2 text-white" />
              </label>
              <label className="grid gap-1 text-xs font-bold">Part questions
                <textarea value={part.rawQuestions || ""} onChange={(event) => updatePart(part.id, "rawQuestions", event.target.value)} rows="3" className="rounded-lg bg-slate-800 p-2 text-white" placeholder="Prompt | answer" />
              </label>
            </div>
          ))}
          <button type="button" onClick={addPart} className="rounded-lg border border-cyan-400 px-3 py-2 font-bold text-cyan-200">New Part/Section</button>
        </fieldset>
        <label className="grid gap-1 text-sm font-bold">Optional worksheet JSON
          <textarea value={jsonInput} onChange={(event) => setJsonInput(event.target.value)} rows="4" className="rounded-lg bg-slate-900 p-3 font-mono text-sm text-white" placeholder={'{"schemaVersion":2,"parts":[{"title":"Part A","instruction":"Write the exponent","questions":[{"prompt":"4^3","correctAnswer":"64","acceptedAnswers":["64"]}]}]}'}/>
          <span className="text-xs font-normal text-slate-400">Import parts, instructions, questions, and answer keys. Review is still required before publishing.</span>
        </label>
        {reviewQuestions.length > 0 && (
          <fieldset className="grid gap-3 rounded-xl border border-amber-400/50 bg-slate-900 p-4">
            <legend className="px-2 text-sm font-bold text-amber-300">Answer key review</legend>
            <p className="text-xs text-slate-300">Confirm every prompt and answer before publishing.</p>
            {reviewQuestions.map((question, index) => (
              <div key={question.id} className="grid gap-2 rounded-lg border border-slate-700 p-3">
                <p className="text-xs font-bold text-slate-400">Question {index + 1} preview</p>
                <label className="grid gap-1 text-xs font-bold">Verified prompt / LaTeX
                  <textarea
                    value={question.prompt || ""}
                    onChange={(event) => updateReviewQuestion(question.id, "prompt", event.target.value)}
                    rows="2"
                    className="rounded-lg bg-slate-800 p-2 text-white"
                  />
                </label>
                <MathExpression value={question.prompt} className="text-lg" />
                <label className="grid gap-1 text-xs font-bold">Verified answer
                  <input value={question.correctAnswer || ""} onChange={(event) => updateReviewQuestion(question.id, "correctAnswer", event.target.value)} className="rounded-lg bg-slate-800 p-2 text-white" />
                </label>
              </div>
            ))}
            <button type="button" onClick={async () => {
              try {
                const reviewedParts = partData.map((part) => ({
                  ...part,
                  questions: reviewQuestions.filter((question) => question.partId === part.id),
                })).filter((part) => part.questions.length > 0);
                const worksheetId = reviewId || await createWorksheet({
                  title,
                  instructions,
                  section,
                  dueDate,
                  questions: reviewQuestions,
                  parts: reviewedParts,
                });
                setReviewId(worksheetId);
                await publishWorksheet(worksheetId);
                setTitle("");
                setInstructions("");
                setDueDate("");
                setRawQuestions("");
                setReviewQuestions([]);
                setReviewId("");
                setStatus("Assignment published.");
              } catch (error) {
                console.error("Unable to publish worksheet:", error);
                setStatus("Assignment could not be published.");
              }
            }} className="rounded-lg bg-emerald-600 px-4 py-3 font-bold text-white">Confirm answer key and publish</button>
          </fieldset>
        )}
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
