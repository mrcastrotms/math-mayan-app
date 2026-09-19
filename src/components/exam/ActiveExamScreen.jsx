"use client";

import { useState } from "react";
import ConfirmSubmitModal from "../ui/ConfirmSubmitModal";
import TapeDiagramManipulative from "../manipulatives/TapeDiagramManipulative";

export default function ActiveExamScreen({ state, navigateTo, adminPanel }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localShowBehaviorMenu, setLocalShowBehaviorMenu] = useState(false);

  const question =
    state?.currentQ ||
    state?.getCurrentQuestion?.() || { question: "Loading question..." };
  const currentIndex = state?.currentQuestionIndex || 0;
  const currentInput = state?.currentInput || "";
  const timeLeft = state?.timeLeft || 0;
  const demerits = state?.demerits || 0;
  const showBehaviorMenu =
    state?.showBehaviorMenu !== undefined
      ? state.showBehaviorMenu
      : localShowBehaviorMenu;

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

  const handleTimerDoubleClick = () => {
    const enteredPin = window.prompt("Enter Teacher Override PIN:");
    if (enteredPin === "2026") {
      if (typeof state?.handleNinjaOneMinute === "function") {
        state.handleNinjaOneMinute();
      } else if (typeof state?.setTimeLeft === "function") {
        state.setTimeLeft(60);
      }
    }
  };

  const handleQuestionDoubleClick = () => {
    if (typeof state?.setShowBehaviorMenu === "function") {
      state.setShowBehaviorMenu((prev) => !prev);
    } else {
      setLocalShowBehaviorMenu((prev) => !prev);
    }
  };

  const handleInfractionClick = () => {
    if (typeof state?.handleAddDemerit === "function") {
      state.handleAddDemerit();
    } else if (typeof state?.setDemerits === "function") {
      state.setDemerits((prev) => (prev || 0) + 1);
    }

    if (typeof state?.setShowBehaviorMenu === "function") {
      state.setShowBehaviorMenu(false);
    } else {
      setLocalShowBehaviorMenu(false);
    }
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-slate-50">
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4 shadow-sm">
        <div>
          <h1 className="text-lg font-bold leading-tight text-slate-800">
            Question {currentIndex + 1}
          </h1>
          <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>{state?.student?.name || "Student"}</span>
            <span>|</span>
            <span>
              TIME:{" "}
              <span
                className="timer select-none font-semibold text-slate-700"
                data-testid="exam-timer"
                onDoubleClick={handleTimerDoubleClick}
              >
                {formatTime(timeLeft)}
              </span>
            </span>
            <span>|</span>
            <span>
              Demerits:{" "}
              <span
                className="demerits-count font-bold text-red-600"
                data-testid="demerits"
              >
                {demerits}
              </span>
            </span>
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="touch-manipulation rounded bg-green-600 px-4 py-1.5 text-sm font-bold text-white shadow-sm hover:bg-green-700 active:bg-green-800"
        >
          Finish Exam
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 gap-4 overflow-hidden p-4">
        <div className="relative flex flex-1 flex-col overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {showBehaviorMenu && (
            <div className="absolute right-4 top-4 z-20 flex gap-2 rounded-lg border border-red-200 bg-white p-2 shadow-md">
              <button
                type="button"
                onClick={handleInfractionClick}
                className="touch-manipulation rounded bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 active:bg-red-800"
              >
                Off-Task
              </button>
            </div>
          )}

          <h2
            data-testid="question-text"
            className="question-text select-none text-2xl font-medium text-slate-800"
            onDoubleClick={handleQuestionDoubleClick}
            dangerouslySetInnerHTML={{ __html: question.question }}
          />

          {question?.type === "tape-diagram" && (
            <div className="mt-4">
              <TapeDiagramManipulative question={question} state={state} />
            </div>
          )}
        </div>

        <div className="flex w-72 shrink-0 flex-col gap-3">
          <div className="shrink-0 rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              Answer
            </div>
            <div className="flex h-12 items-center justify-center overflow-hidden rounded-lg bg-slate-50 text-4xl font-bold text-slate-900">
              {currentInput || (
                <span className="opacity-50 text-slate-300">_</span>
              )}
            </div>
          </div>

          <div className="grid flex-1 grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => state?.handlePadClick?.(num.toString())}
                className="touch-manipulation rounded-lg border border-slate-200 bg-white text-xl font-bold text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-200"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => state?.handleClear?.()}
              className="touch-manipulation rounded-lg border border-red-100 bg-red-50 text-lg font-bold text-red-600 shadow-sm hover:bg-red-100 active:bg-red-200"
            >
              C
            </button>
            <button
              onClick={() => state?.handlePadClick?.("0")}
              className="touch-manipulation rounded-lg border border-slate-200 bg-white text-xl font-bold text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-200"
            >
              0
            </button>
            <button
              onClick={() => state?.handleBackspace?.()}
              className="touch-manipulation rounded-lg bg-slate-200 text-lg font-bold text-slate-700 shadow-sm hover:bg-slate-300 active:bg-slate-400"
            >
              DEL
            </button>
          </div>

          <div className="flex shrink-0 flex-col gap-2">
            <button
              onClick={() => state?.handleSubmitQuestion?.()}
              className="touch-manipulation w-full rounded-lg bg-blue-600 py-3 text-lg font-bold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800"
            >
              Submit
            </button>
            <button
              onClick={() => state?.handlePassQuestion?.()}
              className="touch-manipulation w-full rounded-lg bg-slate-100 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 active:bg-slate-300"
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
