"use client";
import React, { useState, useEffect, useRef } from "react";

export default function ActiveExamScreen({
  question,
  questionIndex,
  examTimeLeft = 300,
  demerits = 0,
  setDemerits,
  showBehaviorMenu = false,
  setShowBehaviorMenu,
  onTimerOverride,
  onDemeritChange,
}) {
  const [timeLeft, setTimeLeft] = useState(examTimeLeft);
  const [timerOverridden, setTimerOverridden] = useState(false);
  const lastBlurRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleBlur = () => {
      const now = Date.now();
      if (now - lastBlurRef.current > 2000) {
        lastBlurRef.current = now;
        if (setDemerits) {
          setDemerits((prev) => {
            const updated =
              typeof prev === "function" ? prev((p) => p + 1) : prev + 1;
            if (onDemeritChange) onDemeritChange(updated);
            return updated;
          });
        }
      }
    };

    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [setDemerits, onDemeritChange]);

  const handleTimerDoubleClick = () => {
    const pin = window.prompt("Enter Teacher PIN:");
    if (pin === "2026" || pin === "00000") {
      setTimeLeft(60);
      setTimerOverridden(true);
      if (onTimerOverride) onTimerOverride(60);
    } else if (pin !== null) {
      alert("Incorrect PIN!");
    }
  };

  const handleQuestionDoubleClick = () => {
    if (setShowBehaviorMenu) {
      setShowBehaviorMenu((prev) => !prev);
    }
  };

  const handleAddInfraction = () => {
    if (setDemerits) {
      setDemerits((prev) => {
        const updated =
          typeof prev === "function" ? prev((p) => p + 1) : prev + 1;
        if (onDemeritChange) onDemeritChange(updated);
        return updated;
      });
    }
    if (setShowBehaviorMenu) {
      setShowBehaviorMenu(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex flex-col h-full w-full p-6 bg-slate-900 text-white select-none relative">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm font-semibold text-slate-400">
          Demerits:{" "}
          <span
            className="demerits-count text-red-400 font-bold"
            data-testid="demerits"
          >
            {demerits}
          </span>
          {timerOverridden && (
            <span
              className="ml-2 text-xs text-yellow-400 timer-override-active"
              data-testid="timer-override"
            >
              (60s Override Active)
            </span>
          )}
        </div>

        <div
          className="timer cursor-pointer px-4 py-2 bg-slate-800 rounded border border-slate-700 hover:border-slate-500 font-mono text-lg transition-colors"
          onDoubleClick={handleTimerDoubleClick}
          title="Double-click to override timer with PIN"
          data-testid="exam-timer"
        >
          Time: {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        <div
          className="question-text max-w-2xl w-full p-8 bg-slate-800 rounded-lg shadow-lg border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors"
          onDoubleClick={handleQuestionDoubleClick}
          data-testid="question-text"
        >
          <h2 className="text-xl font-bold mb-4 text-cyan-400">
            Question {(questionIndex ?? 0) + 1}
          </h2>
          <p className="text-lg text-slate-200">
            {question?.question ||
              question?.questionText ||
              question?.prompt ||
              "Loading question content..."}
          </p>
        </div>
      </div>

      {showBehaviorMenu && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-red-400">
              Log Behavior Infraction
            </h3>
            <p className="text-xs text-slate-400">Select reason for demerit:</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleAddInfraction}
                className="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded text-sm transition"
              >
                Talking whilst exam
              </button>
              <button
                type="button"
                onClick={handleAddInfraction}
                className="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded text-sm transition"
              >
                Off-task / Looking around
              </button>
              <button
                type="button"
                onClick={() => setShowBehaviorMenu(false)}
                className="w-full mt-2 p-2 bg-slate-900 hover:bg-slate-950 text-slate-400 rounded text-center text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
