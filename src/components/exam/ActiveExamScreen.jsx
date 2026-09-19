// src/components/exam/ActiveExamScreen.jsx
"use client";

import { useState } from "react";
import ConfirmSubmitModal from "../ui/ConfirmSubmitModal";

export default function ActiveExamScreen({ state, navigateTo, adminPanel }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const question = state?.currentQ ||
    state?.getCurrentQuestion?.() || { question: "Loading question..." };
  const currentIndex = state?.currentQuestionIndex || 0;
  const currentInput = state?.currentInput || "";
  const timeLeft = state?.timeLeft || 0;
  const formatTime =
    state?.formatTime ||
    ((s) => `${Math.floor(s / 60)}:${s % 60 < 10 ? "0" : ""}${s % 60}`);

  const handleFinalSubmit = async () => {
    setIsModalOpen(false);
    if (typeof state?.handleFinishExam === "function") {
      await state.handleFinishExam();
    }
    navigateTo("dashboard");
  };

  return (
    <div className="relative flex h-screen flex-col bg-slate-50 overflow-hidden">
      {/* --- Compact Header (Optimized for 1366x768) --- */}
      <header className="flex h-14 shrink-0 items-center justify-between bg-white px-4 shadow-sm border-b">
        <div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">
            Question {currentIndex + 1}
          </h1>
          <p className="text-xs font-medium text-slate-500">
            {state?.student?.name || "Student"} | ⏱ {formatTime(timeLeft)}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded bg-green-600 px-4 py-1.5 text-sm font-bold text-white shadow-sm hover:bg-green-700 active:bg-green-800 touch-manipulation"
        >
          Finish Exam
        </button>
      </header>

      {/* --- Main Workspace (Forces content into the 577px vertical height) --- */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 gap-4 p-4 overflow-hidden">
        {/* Left Side: Question Content */}
        <div className="flex-1 rounded-xl bg-white p-6 shadow-sm border border-slate-200 flex flex-col overflow-y-auto">
          <h2
            className="text-2xl font-medium text-slate-800"
            dangerouslySetInnerHTML={{ __html: question.question }}
          />
        </div>

        {/* Right Side: Keypad & Input (Touch optimized) --- */}
        <div className="w-72 shrink-0 flex flex-col gap-3">
          {/* Answer Display */}
          <div className="rounded-xl bg-white p-3 shadow-sm border border-slate-200 text-center shrink-0">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Answer
            </div>
            <div className="text-4xl font-bold text-slate-900 h-12 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden">
              {currentInput || (
                <span className="text-slate-300 opacity-50">_</span>
              )}
            </div>
          </div>

          {/* Numeric Keypad Grid (Fills remaining height) */}
          <div className="grid grid-cols-3 gap-2 flex-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => state?.handlePadClick?.(num.toString())}
                className="rounded-lg bg-white text-xl font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 active:bg-slate-200 touch-manipulation"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => state?.handleClear?.()}
              className="rounded-lg bg-red-50 text-lg font-bold text-red-600 shadow-sm border border-red-100 hover:bg-red-100 active:bg-red-200 touch-manipulation"
            >
              C
            </button>
            <button
              onClick={() => state?.handlePadClick?.("0")}
              className="rounded-lg bg-white text-xl font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 active:bg-slate-200 touch-manipulation"
            >
              0
            </button>
            <button
              onClick={() => state?.handleBackspace?.()}
              className="rounded-lg bg-slate-200 text-xl font-bold text-slate-700 shadow-sm hover:bg-slate-300 active:bg-slate-400 touch-manipulation"
            >
              ⌫
            </button>
          </div>

          {/* Action Controls */}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={() => state?.handleSubmitQuestion?.()}
              className="w-full rounded-lg bg-blue-600 py-3 text-lg font-bold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 touch-manipulation"
            >
              Submit
            </button>
            <button
              onClick={() => state?.handlePassQuestion?.()}
              className="w-full rounded-lg bg-slate-100 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 active:bg-slate-300 touch-manipulation"
            >
              Skip
            </button>
          </div>
        </div>
      </main>

      <ConfirmSubmitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleFinalSubmit}
      />
      {adminPanel}
    </div>
  );
}
