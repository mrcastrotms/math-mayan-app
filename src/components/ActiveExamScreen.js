"use client";
import { useState, useEffect } from "react";

export default function ActiveExamScreen({
  currentQ,
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
  children,
}) {
  const [hintsUsed, setLocalHintsUsed] = useState(0);
  const [isHintLoading, setIsHintLoading] = useState(false);

  // Trap the back button and prevent swipe-backs on iPads/Chromebooks
  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleHintClick = async () => {
    if (hintsUsed >= 3) {
      alert(
        "Out of hints! You have to use your own brain power for the rest of this test!",
      );
      return;
    }

    setLocalHintsUsed((prev) => prev + 1);

    if (currentQ?.hint) {
      alert(`QUICK HINT:\n\n${currentQ.hint}`);
      return;
    }

    setIsHintLoading(true);
    try {
      const questionText =
        currentQ?.text || currentQ?.question || "Math problem";
      const res = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionText }),
      });
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      alert(`AI MATH COACH:\n\n${data.hint}`);
    } catch (err) {
      alert(
        "GROWTH MINDSET CHECK:\n\n" +
          "Take a deep breath! Try breaking the problem into smaller pieces, or draw a quick picture on your paper.\n\n" +
          "You haven't figured it out YET, but your brain is growing every time you try!",
      );
    } finally {
      setIsHintLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-8 font-sans">
      {/* Top HUD */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-xl font-bold text-slate-700">
          Question {questionsAttempted + 1}
        </div>
        <div
          className={`text-2xl font-black ${timeLeft < 300 ? "text-red-500 animate-pulse" : "text-slate-800"}`}
        >
          {formatTime(timeLeft)}
        </div>
        {isTeacherTesting && (
          <button
            onClick={() => setShowBehaviorMenu(!showBehaviorMenu)}
            className="text-red-500 font-bold border border-red-200 bg-red-50 px-3 py-1 rounded-lg"
          >
            Demerits: {demerits}
          </button>
        )}
      </div>

      {/* Main Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center mb-8">
        {/* FIXED: Double click for ninja demerits, select-none to prevent text highlight */}
        <div
          onDoubleClick={() => setDemerits(demerits + 1)}
          className="text-3xl md:text-5xl font-black text-slate-800 mb-8 text-center max-w-4xl select-none"
        >
          {currentQ?.text || currentQ?.question || "Loading question..."}
        </div>

        {/* Big Answer Display */}
        <div className="bg-white border-4 border-blue-200 h-24 w-full max-w-sm rounded-2xl flex items-center justify-center text-4xl font-mono font-bold text-blue-600 mb-8 shadow-inner">
          {currentInput || "?"}
        </div>

        {/* FIXED: Math Keypad now includes the comma and spans backspace */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, ",", 0, "."].map((num) => (
            <button
              key={num}
              onClick={() => handlePadClick(num.toString())}
              className="bg-white border border-slate-200 text-2xl font-bold py-4 rounded-xl shadow-sm hover:bg-slate-50 active:scale-95 transition"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleBackspace}
            className="col-span-3 bg-slate-200 text-slate-700 text-2xl font-bold py-4 rounded-xl shadow-sm hover:bg-slate-300 active:scale-95 transition"
          >
            ⌫ Backspace
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          <button
            onClick={handleClear}
            className="bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 active:scale-95 transition"
          >
            Clear
          </button>
          <button
            onClick={handlePassQuestion}
            className="bg-amber-100 text-amber-700 font-bold py-3 rounded-xl hover:bg-amber-200 active:scale-95 transition"
          >
            Skip
          </button>

          <button
            onClick={handleSubmitQuestion}
            className="col-span-2 bg-blue-600 text-white text-xl font-black py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition"
          >
            Submit Answer
          </button>

          <button
            type="button"
            onClick={handleHintClick}
            disabled={isHintLoading}
            className={`col-span-2 font-bold text-lg py-4 px-6 rounded-xl shadow-sm transition border ${
              isHintLoading
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 active:scale-95"
            }`}
          >
            {isHintLoading
              ? "Coach is thinking..."
              : `Need a Hint? (${3 - hintsUsed} left)`}
          </button>
        </div>
      </div>

      {/* The Finish Exam Button (Disabled while saving) */}
      {showEndExamButton && (
        <div className="w-full flex justify-center mb-8">
          <button
            onClick={handleFinishExam}
            disabled={isSaving}
            className={`px-8 py-4 rounded-xl font-black text-xl transition shadow-lg ${
              isSaving
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-red-600 text-white shadow-red-200 hover:bg-red-700 active:scale-95"
            }`}
          >
            {isSaving ? "Saving Test..." : "Finish & Grade Exam"}
          </button>
        </div>
      )}

      {/* Dev Tools */}
      <div className="w-full flex justify-center mt-auto">{children}</div>
    </div>
  );
}
