"use client";
import React from "react";

export default function AiHintModal({ isOpen, hintText, isLoading, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold text-xs uppercase tracking-wider">
              AI Assistant
            </span>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Smart Hint</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg transition-colors font-bold text-sm"
          >
            [X]
          </button>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 mb-6 min-h-[80px] flex items-center">
          {isLoading ? (
            <div className="w-full text-center text-zinc-500 text-sm animate-pulse font-medium">
              Generating smart hint for this question...
            </div>
          ) : (
            <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
              {hintText}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-md shadow-indigo-200 dark:shadow-none text-sm"
        >
          Got it, back to the problem!
        </button>
      </div>
    </div>
  );
}
