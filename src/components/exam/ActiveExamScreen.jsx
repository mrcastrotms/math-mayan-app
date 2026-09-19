"use client";
import Scratchpad from "../Scratchpad";
import ExamKeypad from "../ExamKeypad";
import AiHintModal from "../AiHintModal";

import { useState } from "react";
import ConfirmSubmitModal from "../ui/ConfirmSubmitModal";
import TapeDiagramManipulative from "../manipulatives/TapeDiagramManipulative";
import { verifyTeacherPin } from "../../utils/teacherAuth";
import { BEHAVIOR_OPTIONS } from "../../utils/behaviorOptions";

export default function ActiveExamScreen({ state, navigateTo, adminPanel }) {
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
    navigateTo("dashboard");
  };

  const handleTimerDoubleClick = async () => {
    const enteredPin = window.prompt("Enter Teacher Override PIN:");
    if (await verifyTeacherPin(enteredPin)) {
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

  const handleBehaviorClick = (type, reason) => {
    if (typeof state?.addBehaviorEvent === "function") {
      state.addBehaviorEvent(type, reason);
    } else if (type === "demerit" && typeof state?.handleAddDemerit === "function") {
      state.handleAddDemerit(reason);
    }
    if (typeof state?.setShowBehaviorMenu === "function") {
      state.setShowBehaviorMenu(false);
    } else {
      setLocalShowBehaviorMenu(false);
    }
  };

  return (
    <div className="relative flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-slate-50">
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
            <span>|</span>
            <span>
              Merits:{" "}
              <span className="font-bold text-emerald-600" data-testid="merits">
                {state?.merits || 0}
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

      <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-4 overflow-y-auto p-3 sm:p-4 lg:flex-row lg:overflow-hidden">
        <div className="relative flex min-h-[22rem] flex-1 flex-col overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          {showBehaviorMenu && (
            <div className="absolute right-3 top-3 z-20 max-h-[70%] w-[min(22rem,calc(100%-1.5rem))] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                Behavior record
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {BEHAVIOR_OPTIONS.map((option) => (
                  <button
                    key={`${option.type}-${option.reason}`}
                    type="button"
                    onClick={() => handleBehaviorClick(option.type, option.reason)}
                    className={`touch-manipulation rounded-lg border px-3 py-2 text-left text-xs font-bold transition ${
                      option.type === "merit"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        : "border-red-200 bg-red-50 text-red-800 hover:bg-red-100"
                    }`}
                  >
                    {option.type === "merit" ? "Merit" : "Demerit"}: {option.reason}
                  </button>
                ))}
              </div>
            </div>
          )}

          <h2
            data-testid="question-text"
            className="question-text select-none text-xl font-medium text-slate-800 sm:text-2xl"
            onDoubleClick={handleQuestionDoubleClick}
            dangerouslySetInnerHTML={{ __html: question.question }}
          />

          {question?.type === "tape-diagram" && (
            <div className="mt-4">
              <TapeDiagramManipulative question={question} state={state} />
            </div>
          )}
          <Scratchpad />
        </div>

        <div className="flex w-full shrink-0 flex-col gap-3 lg:w-72">
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