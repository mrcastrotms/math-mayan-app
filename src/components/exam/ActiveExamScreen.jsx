"use client";
import Scratchpad from "../Scratchpad";
import ExamKeypad from "../ExamKeypad";
import AiHintModal from "../AiHintModal";

import { useState } from "react";
import ConfirmSubmitModal from "../ui/ConfirmSubmitModal";
import TapeDiagramManipulative from "../manipulatives/TapeDiagramManipulative";
import { useAppTheme } from "../../hooks/useAppTheme";
import ThemeToggle from "../ThemeToggle";

export default function ActiveExamScreen({ state, navigateTo, adminPanel, themeState }) {
  const localThemeState = useAppTheme();
  const activeThemeState = themeState || localThemeState;
  const [showAiHint, setShowAiHint] = useState(false);
  const [currentHintText, setCurrentHintText] = useState("");
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [hintCache, setHintCache] = useState({});
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  
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

  
  const handleOpenHint = async () => {
    setShowAiHint(true);
    const qKey = question?.id || question?.question || currentIndex;
    if (hintCache[qKey]) {
      setCurrentHintText(hintCache[qKey]);
      return;
    }
    if (question?.hint) {
      setCurrentHintText(question.hint);
      return;
    }

    setIsHintLoading(true);
    setCurrentHintText("");
    try {
      const res = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question?.question || "",
          instruction: question?.instruction || "",
          observation: question?.observation || "",
        }),
      });
      const data = await res.json();
      const resolved = data.hint || "Analyze the place values and work step by step.";
      setCurrentHintText(resolved);
      setHintCache((prev) => ({ ...prev, [qKey]: resolved }));
    } catch (err) {
      setCurrentHintText("Analyze the place values and work step by step.");
    } finally {
      setIsHintLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsModalOpen(false);
    if (typeof state?.handleFinishExam === "function") {
      await state.handleFinishExam();
    }
    navigateTo("student-home");
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
    <div className="relative flex h-screen flex-col overflow-hidden bg-[var(--app-bg)] text-[var(--app-fg)]">
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

        <div className="flex items-center gap-3">
        <ThemeToggle
          theme={activeThemeState.theme}
          changeTheme={activeThemeState.changeTheme}
          disabled={activeThemeState.themeLocked}
        />
        {activeThemeState.themeLocked && (
          <span role="status" className="text-xs font-semibold text-amber-700">
            Theme locked by teacher
          </span>
        )}
        <button
          onClick={() => setIsModalOpen(true)}
          className="touch-manipulation rounded bg-green-600 px-4 py-1.5 text-sm font-bold text-white shadow-sm hover:bg-green-700 active:bg-green-800"
        >
          Finish Exam
        </button>
        </div>
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

        <ExamKeypad 
          handlePadClick={(val) => state?.handlePadClick?.(val)}
          handleBackspace={() => state?.handleBackspace?.()}
          handleClear={() => state?.handleClear?.()}
          handlePassQuestion={handleOpenHint}
          handleSubmitQuestion={() => state?.handleSubmitQuestion?.()}
          handleFinishExam={() => setIsModalOpen(true)}
          timeLeft={timeLeft}
        />
      </div>
      </main>

      <AiHintModal
        isOpen={showAiHint}
        hintText={currentHintText}
        isLoading={isHintLoading}
        onClose={() => setShowAiHint(false)}
      />
      <ConfirmSubmitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleFinalSubmit}
      />
      {adminPanel}
    </div>
  );
}