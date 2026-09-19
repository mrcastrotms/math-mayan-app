"use client";
import React, { useState } from "react";

export default function ExamKeypad({
  handlePadClick,
  handleBackspace,
  handleClear,
  handlePassQuestion,
  handleSubmitQuestion,
  handleFinishExam,
  timeLeft = 0,
}) {
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const isTimeAllowed = timeLeft <= 900;

  const onFinishClick = () => {
    if (isTimeAllowed) {
      if (confirm("Are you sure you want to finish and submit your exam?")) {
        handleFinishExam?.();
      }
    } else {
      setShowPinPrompt(true);
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (enteredPin === "0801") {
      setShowPinPrompt(false);
      setEnteredPin("");
      setPinError(false);
      handleFinishExam?.();
    } else {
      setPinError(true);
    }
  };

  return (
    <>
      {/* 3x4 Number Grid with Comma */}
      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-4">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handlePadClick?.(item)}
            className="bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xl py-3 rounded-xl hover:bg-slate-100 transition active:scale-95 shadow-sm"
          >
            {item}
          </button>
        ))}
        <button
          type="button"
          onClick={handleBackspace}
          className="bg-amber-50 border border-amber-200 text-amber-700 font-bold text-lg py-3 rounded-xl hover:bg-amber-100 transition active:scale-95 shadow-sm"
        >
          Del
        </button>
      </div>

      {/* Clear Button */}
      <div className="max-w-xs mx-auto mb-5">
        <button
          type="button"
          onClick={handleClear}
          className="w-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-sm py-2 rounded-xl hover:bg-rose-100 transition shadow-sm"
        >
          Clear (C)
        </button>
      </div>

      {/* AI Hint & Submit Answer */}
      <div className="flex gap-3 justify-center mb-4">
        <button
          type="button"
          onClick={handlePassQuestion}
          className="px-6 py-3 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition active:scale-95 shadow-sm"
        >
          AI Hint
        </button>
        <button
          type="button"
          onClick={handleSubmitQuestion}
          className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition active:scale-95"
        >
          Submit Answer
        </button>
      </div>

      {/* Finish Exam Early Button */}
      <div className="flex justify-center border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onFinishClick}
          className={"px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-2 " + (
            isTimeAllowed
              ? "bg-red-600 hover:bg-red-700 text-white shadow-red-200"
              : "bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200 hover:text-slate-600"
          )}
        >
          Finish Exam Early
          {!isTimeAllowed && (
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
              T-15m / PIN
            </span>
          )}
        </button>
      </div>

      {/* Teacher Override Modal */}
      {showPinPrompt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Early Finish Authorization
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              More than 15 minutes remain. Enter Teacher PIN to submit early.
            </p>
            <form onSubmit={handlePinSubmit}>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                data-lpignore="true"
                style={{ WebkitTextSecurity: "disc" }}
                maxLength={4}
                autoFocus
                placeholder="Enter 4-digit PIN"
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setPinError(false);
                }}
                className={"w-full text-center text-2xl tracking-widest py-2 px-3 border rounded-xl mb-2 outline-none font-mono " + (
                  pinError
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-slate-300 focus:border-blue-500"
                )}
              />
              {pinError && (
                <p className="text-red-500 text-xs text-center font-bold mb-3">
                  Invalid PIN.
                </p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinPrompt(false);
                    setEnteredPin("");
                    setPinError(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition text-sm shadow-md shadow-blue-200"
                >
                  Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
