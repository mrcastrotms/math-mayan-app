"use client";

import React, { useState, useEffect } from "react";
import { verifyTeacherPin } from "../utils/teacherAuth";

export default function StudentLockOverlay({
  isLocked,
  onUnlock,
  studentName,
}) {
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [graceSeconds, setGraceSeconds] = useState(() => {
    if (typeof window === "undefined") return 45;
    const saved = sessionStorage.getItem("exam_lock_grace");
    const parsed = Number(saved);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 45;
  });

  useEffect(() => {
    if (!isLocked) {
      return;
    }

    const timer = setInterval(() => {
      setGraceSeconds((prev) => {
        const next = prev - 1;
        if (typeof window !== "undefined") {
          sessionStorage.setItem("exam_lock_grace", String(next));
        }
        if (next <= 0) {
          clearInterval(timer);
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("exam_is_locked");
            sessionStorage.removeItem("exam_lock_grace");
          }
          onUnlock?.();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, onUnlock]);

  if (!isLocked) return null;

  const performUnlock = () => {
    setPinError(false);
    setPinInput("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("exam_is_locked");
      sessionStorage.removeItem("exam_lock_grace");
    }
    onUnlock?.();
  };

  const handleTeacherUnlock = async (e) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();

    if (await verifyTeacherPin(cleanPin)) {
      performUnlock();
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
      {/* Teacher Gesture: Double-click icon to unlock immediately */}
      <div
        onDoubleClick={performUnlock}
        title="Teacher secret: Double-click to unlock"
        className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 shadow-inner cursor-pointer hover:bg-amber-500/20 transition active:scale-95"
      >
        <svg
          className="w-7 h-7 text-amber-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
      </div>

      <h2
        onDoubleClick={performUnlock}
        className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight cursor-default"
      >
        {studentName || "Student"}
      </h2>

      <p className="text-slate-300 max-w-md text-sm sm:text-base leading-relaxed mb-4">
        You switched windows or left fullscreen. A demerit has been logged.
        Please raise your hand for teacher assistance.
      </p>

      <div className="text-4xl font-mono font-black text-amber-400 mb-6 tracking-widest">
        {formatDisplayTime(graceSeconds)}
      </div>

      <form
        onSubmit={handleTeacherUnlock}
        className="flex flex-col items-center gap-2 w-full max-w-xs"
      >
        <div className="flex w-full gap-2">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            data-lpignore="true"
            placeholder={
              "Teacher PIN"
            }
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value);
              if (pinError) setPinError(false);
            }}
            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-center font-mono text-base outline-none focus:border-amber-400 transition"
            style={{ WebkitTextSecurity: "disc" }}
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
