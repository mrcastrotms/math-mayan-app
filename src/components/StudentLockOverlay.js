// src/components/StudentLockOverlay.js
"use client";

export default function StudentLockOverlay({ isLocked, studentName }) {
  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200">
      <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center mb-6">
        <span className="text-4xl">🔒</span>
      </div>
      <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
        Exam Paused by Teacher
      </h2>
      <p className="text-slate-300 max-w-md text-sm sm:text-base leading-relaxed mb-6">
        {studentName ? `${studentName}, your` : "Your"} exam session is
        currently locked. Please look up and wait for instructions from Mr.
        Castro.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/60 border border-red-800/60 text-red-300 text-xs font-mono font-bold tracking-wide uppercase">
        <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
        Lockdown Active
      </div>
    </div>
  );
}
