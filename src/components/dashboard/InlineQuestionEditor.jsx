"use client";
import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function InlineQuestionEditor() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [saveSuccessId, setSaveSuccessId] = useState(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const qRef = collection(db, "question_bank");
      const snap = await getDocs(qRef);
      const list = [];
      snap.forEach((d) => {
        list.push({ docId: d.id, ...d.data() });
      });
      list.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
      setQuestions(list);
    } catch (err) {
      console.error("Failed to load question bank:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      await fetchQuestions();
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleFieldChange = (docId, field, value) => {
    setQuestions((prev) =>
      prev.map((q) => (q.docId === docId ? { ...q, [field]: value } : q))
    );
  };

  const handleSaveQuestion = async (q) => {
    setSavingId(q.docId);
    try {
      await updateDoc(doc(db, "question_bank", q.docId), {
        question: q.question,
        correctAnswer: q.correctAnswer,
        observation: q.observation || "",
      });
      setSaveSuccessId(q.docId);
      setTimeout(() => setSaveSuccessId(null), 2500);
    } catch (err) {
      console.error("Failed to save question:", err);
      alert("Error saving question to Firestore.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-[var(--app-fg)] shadow-xl mt-6">
      <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-3">
        <div>
          <h3 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <span>✏️</span> Question Bank Editor
          </h3>
          <p className="text-xs text-slate-400">
            Edit question prompts or correct answers in real-time. Changes immediately apply to active student exams.
          </p>
        </div>
        <button
          onClick={fetchQuestions}
          disabled={loading}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 transition"
        >
          {loading ? "Refreshing..." : "↻ Refresh Bank"}
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm py-4 text-center animate-pulse">
          Loading question bank from Firestore...
        </p>
      ) : questions.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-sm">
          No questions found in Firestore collection <code>question_bank</code>.
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {questions.map((q, idx) => (
            <div
              key={q.docId}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 font-mono text-xs font-black">
                  #{q.id || idx + 1}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {q.difficulty || "standard"}
                </span>
              </div>

              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Question Prompt
                  </label>
                  <input
                    type="text"
                    value={q.question || ""}
                    onChange={(e) => handleFieldChange(q.docId, "question", e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Correct Answer
                  </label>
                  <input
                    type="text"
                    value={q.correctAnswer || ""}
                    onChange={(e) => handleFieldChange(q.docId, "correctAnswer", e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono font-bold text-green-400 focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => handleSaveQuestion(q)}
                  disabled={savingId === q.docId}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 ${
                    saveSuccessId === q.docId
                      ? "bg-green-600 text-white"
                      : "bg-blue-600 hover:bg-blue-500 text-white"
                  }`}
                >
                  {savingId === q.docId
                    ? "Saving..."
                    : saveSuccessId === q.docId
                    ? "✓ Saved"
                    : "Save"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
