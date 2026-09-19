"use client";

import { useState } from "react";

export default function CommandModal({ student, isOpen, onClose, onSendCommand }) {
  const [customType, setCustomType] = useState("FLASH_MESSAGE");
  const [customPayload, setCustomPayload] = useState(
    '{"text": "Eyes on your screen!"}'
  );

  if (!isOpen) return null;

  const presets = [
    { label: "Force Fullscreen", type: "FORCE_FULLSCREEN", payload: {} },
    {
      label: "Give Freebie (+1 Pt)",
      type: "AWARD_FREEBIE",
      payload: { points: 1, note: "Teacher Bonus" },
    },
    {
      label: "Jump to Next Question",
      type: "JUMP_QUESTION",
      payload: { targetIndex: (student.currentQuestionIndex || 0) + 1 },
    },
    {
      label: "Swap to Harder Question",
      type: "SWAP_QUESTION",
      payload: { difficulty: "hard" },
    },
    {
      label: "Flash Alert Message",
      type: "FLASH_MESSAGE",
      payload: { text: "Please stay focused!" },
    },
  ];

  const handleSendCustom = () => {
    try {
      const parsed = customPayload.trim() ? JSON.parse(customPayload) : {};
      onSendCommand?.(student.uid, customType.trim().toUpperCase(), parsed);
      onClose();
    } catch (e) {
      alert("Invalid JSON payload. Please verify syntax.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">
              Remote Command Hub
            </h3>
            <p className="text-xs text-slate-400">
              Target:{" "}
              <span className="text-blue-400 font-semibold">
                {student.name}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Quick Presets
          </div>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => (
              <button
                key={p.type}
                type="button"
                onClick={() => {
                  onSendCommand?.(student.uid, p.type, p.payload);
                  onClose();
                }}
                className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 text-left transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-3 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Custom Command
          </div>
          <input
            type="text"
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            placeholder="COMMAND_NAME (e.g. HINT)"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white uppercase font-mono"
          />
          <textarea
            value={customPayload}
            onChange={(e) => setCustomPayload(e.target.value)}
            rows={2}
            placeholder='{"key": "value"}'
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-mono"
          />
          <button
            type="button"
            onClick={handleSendCustom}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white rounded-lg transition"
          >
            Dispatch Command
          </button>
        </div>
      </div>
    </div>
  );
}
