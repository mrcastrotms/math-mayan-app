"use client";
import React from "react";
import PinModal from "./PinModal";
import ExamKeypad from "./ExamKeypad";
import BehaviorModal from "./BehaviorModal";
import { useTimerOverride } from "../hooks/useTimerOverride";

export default function ActiveExamScreen({
  question,
  questionIndex,
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
  handleSubmitQuestion,
  handlePassQuestion,
  handleNinjaOneMinute,
  children,
}) {
  const timerHook = useTimerOverride(timeLeft, handleNinjaOneMinute);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between p-6 select-none relative">
      <PinModal
        isOpen={timerHook.showTimerModal}
        onClose={() => timerHook.setShowTimerModal(false)}
        onSubmit={timerHook.handleTimerPinSubmit}
        title="Timer Override"
        placeholder="Enter Teacher PIN"
      />
      <BehaviorModal
        isOpen={showBehaviorMenu}
        onClose={() => setShowBehaviorMenu(false)}
        onAddDemerit={() => {
          setDemerits((prev) => (prev || 0) + 1);
          setShowBehaviorMenu(false);
        }}
      />
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-500">
            Question {questionIndex + 1}
          </span>
          <span className="text-sm font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
            Demerits: <span data-testid="demerits">{demerits}</span>
          </span>
        </div>
        <div
          className="timer text-xl font-black font-mono text-slate-700 cursor-pointer px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
          onDoubleClick={timerHook.handleTimerDoubleClick}
          title="Double-click with PIN for timer options"
        >
          {formatTime
            ? formatTime(timerHook.effectiveTimeLeft)
            : `${Math.floor(timerHook.effectiveTimeLeft / 60)}:${timerHook.effectiveTimeLeft % 60 < 10 ? "0" : ""}${timerHook.effectiveTimeLeft % 60}`}
        </div>
      </div>
      {/* Main Play Area */}
      <div className="my-auto max-w-2xl mx-auto w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center">
        <h2
          data-testid="question-text"
          className="question-text text-3xl font-black text-slate-800 mb-6 cursor-pointer hover:text-blue-600 transition"
          onDoubleClick={() => setShowBehaviorMenu(true)}
          title="Behavior Menu"
        >
          {typeof question === "string"
            ? question
            : question?.question || "Sample Question"}
        </h2>

        <div className="text-4xl font-mono font-bold text-blue-600 bg-blue-50 py-4 rounded-xl border border-blue-100 mb-6">
          {currentInput || "0"}
        </div>

        <ExamKeypad
          handlePadClick={handlePadClick}
          handleBackspace={handleBackspace}
          handleClear={handleClear}
          handlePassQuestion={handlePassQuestion}
          handleSubmitQuestion={handleSubmitQuestion}
        />
      </div>
      {children}
    </div>
  );
}
