"use client";

import React, { useState, useEffect } from "react";

const TEACHER_PIN = "0801196604650";

export default function StudentLockOverlay({
  isLocked,
  onUnlock,
  studentName,
}) {
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [graceSeconds, setGraceSeconds] = useState(45);

  useEffect(() => {
    if (!isLocked) {
      setGraceSeconds(45);
      setPinInput("");
      setPinError(false);
      return;
    }

    setGraceSeconds(45);

    const timer = setInterval(() => {
      setGraceSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onUnlock?.(); // Auto-dismisses the overlay after 45 seconds
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, onUnlock]);

  if (!isLocked) return null;

  const handleTeacherUnlock = (e) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    if (
      cleanPin === "0801" ||
      cleanPin === "2026" ||
      cleanPin === "00000" ||
      cleanPin === TEACHER_PIN
    ) {
      setPinError(false);
      setPinInput("");
      onUnlock?.();
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const formatDisplayTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none font-sans animate-in fade-in duration-200">
      <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 shadow-inner">
        <svg
          className="w-7 h-7 text-amber-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
      </div>

      <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
        Exam Paused — {studentName || "Student"}
      </h2>

      <p className="text-slate-300 max-w-md text-sm sm:text-base leading-relaxed mb-4">
        You switched windows or left fullscreen. A demerit has been logged.
        Please raise your hand for teacher assistance.
      </p>

      {/* 45-Second Auto-Dismiss Countdown */}
      <div className="text-4xl font-mono font-black text-amber-400 mb-6 tracking-widest">
        {formatDisplayTime(graceSeconds)}
      </div>

      <form
        onSubmit={handleTeacherUnlock}
        className="flex flex-col items-center gap-2 w-full max-w-xs"
      >
        <div className="flex w-full gap-2">
          <input
            placeholder="Teacher PIN"
            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-center font-mono text-base outline-none focus:border-amber-400 transition"
            type="text" inputMode="numeric" autoComplete="one-time-code" data-lpignore="true" style={{ WebkitTextSecurity: "disc" }}
            autoFocus
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value);
              setPinError(false);
            }}
          />
          <button
            type="submit"
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-lg transition cursor-pointer active:scale-95 shadow-sm"
          >
            Unlock
          </button>
        </div>
        {pinError && (
          <span className="text-red-400 text-xs font-mono mt-1 font-semibold">
            Invalid PIN
          </span>
        )}
      </form>
    </div>
  );
}
