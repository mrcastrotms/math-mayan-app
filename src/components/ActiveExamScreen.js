"use client";
import React, { useState } from "react";

export default function ActiveExamScreen({
  question,
  questionIndex,
  questionsAttempted,
  formatTime,
  timeLeft,
  showBehaviorMenu,
  setShowBehaviorMenu,
  setDemerits,
  demerits,
  currentInput,
  handlePadClick,
  handleBackspace,
  handleClear,
  showEndExamButton,
  handleFinishExam,
  handleSubmitQuestion,
  handlePassQuestion,
  handleTryHarder,
  handleSimulateCorrect,
  secondsOnCurrentQuestion,
  canTriggerHarder,
  isTeacherTesting,
  isSaving,
  handleNinjaDoubleTime,
  handleNinjaOneMinute,
  children,
}) {
  const [overrideTimeLeft, setOverrideTimeLeft] = useState(null);

  const handleTimerDoubleClick = () => {
    const pin = prompt("Enter Teacher PIN for Timer Override:");
    if (pin === "2026") {
      setOverrideTimeLeft(60); // Set to 60 seconds (1:00)
      if (handleNinjaOneMinute) handleNinjaOneMinute();
    }
  };

  const effectiveTimeLeft =
    overrideTimeLeft !== null ? overrideTimeLeft : timeLeft || 2400;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between p-6 select-none relative">
      {/* Top Bar with Timer */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-500">
            Question {questionIndex + 1}
          </span>
          <span className="text-sm font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
            Demerits:{" "}
            <span data-testid="demerits" className="demerits-count">
              {demerits}
            </span>
          </span>
        </div>

        <div
          className="timer text-xl font-black font-mono text-slate-700 cursor-pointer px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
          data-testid="exam-timer"
          onDoubleClick={handleTimerDoubleClick}
          title="Double-click with PIN for timer options"
        >
          {formatTime
            ? formatTime(effectiveTimeLeft)
            : `${Math.floor(effectiveTimeLeft / 60)}:${effectiveTimeLeft % 60 < 10 ? "0" : ""}${effectiveTimeLeft % 60}`}
        </div>
      </div>

      {/* Question Box */}
      <div className="my-auto max-w-2xl mx-auto w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center">
        <h2
          className="question-text text-3xl font-black text-slate-800 mb-6 cursor-pointer hover:text-blue-600 transition"
          data-testid="question-text"
          onDoubleClick={() => setShowBehaviorMenu(true)}
          title="Behavior Menu"
        >
          {typeof question === "string"
            ? question
            : question?.question || "Sample Question"}
        </h2>

        {/* Answer Input Display */}
        <div className="text-4xl font-mono font-bold text-blue-600 bg-blue-50 py-4 rounded-xl border border-blue-100 mb-6">
          {currentInput || "0"}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
            <button
              key={num}
              onClick={() => handlePadClick(num.toString())}
              className="bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xl py-3 rounded-xl hover:bg-slate-100 transition active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleBackspace}
            className="bg-amber-50 border border-amber-200 text-amber-700 font-bold text-lg py-3 rounded-xl hover:bg-amber-100 transition"
          >
            ⌫
          </button>
          <button
            onClick={handleClear}
            className="bg-rose-50 border border-rose-200 text-rose-700 font-bold text-lg py-3 rounded-xl hover:bg-rose-100 transition"
          >
            C
          </button>
        </div>

        {/* Submit / Pass buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={handlePassQuestion}
            className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition"
          >
            Pass
          </button>
          <button
            onClick={handleSubmitQuestion}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
          >
            Submit Answer
          </button>
        </div>
      </div>

      {/* Behavior Menu Modal */}
      {showBehaviorMenu && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 behavior-modal"
          role="dialog"
        >
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-4 text-center">
              Demerits
            </h3>
            <div className="space-y-3">
              <button
                data-testid="infraction-btn"
                onClick={() => {
                  setDemerits((prev) => (prev || 0) + 1);
                  setShowBehaviorMenu(false);
                }}
                className="w-full bg-red-50 text-red-700 border border-red-200 font-bold py-3 rounded-xl hover:bg-red-100 transition text-left px-4"
              >
                Off-Task
              </button>
              <button
                onClick={() => setShowBehaviorMenu(false)}
                className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
