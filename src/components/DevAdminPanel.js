// src/components/DevAdminPanel.js
"use client";
import { useState, useEffect } from "react";
import { useDraggablePanel } from "../hooks/useDraggablePanel";

export default function DevAdminPanel({
  isDevMode,
  setIsLocked,
  handleFinishExam,
  handleSimulateCorrect,
  handleTryHarder,
  canTriggerHarder,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const { position, handlePointerDown, handlePointerMove, handlePointerUp } =
    useDraggablePanel(280);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isDevMode || !isMounted) return null;

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed bg-emerald-900/95 text-emerald-200 p-4 rounded-xl shadow-2xl border border-emerald-500 z-[9999] flex flex-col gap-2 font-mono text-xs select-none"
    >
      <div
        className="font-bold border-b border-emerald-700 pb-1 flex justify-between items-center cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <span>DEV MODE</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setIsLocked(true)}
          className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 px-3 py-1 rounded font-bold transition"
        >
          [Lock Exam]
        </button>
        <button
          type="button"
          onClick={() => setIsLocked(false)}
          className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 px-3 py-1 rounded font-bold transition"
        >
          [Unlock Exam]
        </button>
        <button
          type="button"
          onClick={handleFinishExam}
          className="bg-red-900/80 hover:bg-red-800 text-red-100 px-3 py-1 rounded font-bold transition"
        >
          [Force Finish]
        </button>
        {handleSimulateCorrect && (
          <button
            type="button"
            onClick={handleSimulateCorrect}
            className="bg-blue-800 hover:bg-blue-700 text-blue-100 px-3 py-1 rounded font-bold transition"
          >
            [Simulate Correct]
          </button>
        )}
        {handleTryHarder && canTriggerHarder && (
          <button
            type="button"
            onClick={handleTryHarder}
            className="bg-orange-800 hover:bg-orange-700 text-orange-100 px-3 py-1 rounded font-bold transition"
          >
            [Trigger Harder]
          </button>
        )}
      </div>
    </div>
  );
}
