// src/components/TeacherJailMonitor.js
"use client";
import { useState } from "react";

function CommandModal({ student, isOpen, onClose, onSendCommand }) {
  const [customType, setCustomType] = useState("FLASH_MESSAGE");
  const [customPayload, setCustomPayload] = useState(
    '{"text": "Eyes on your screen!"}',
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

function StudentCard({ student, onSendCommand }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className={`p-3.5 rounded-xl border flex flex-col justify-between transition ${
          student.isLocked
            ? "bg-red-950/40 border-red-700/60 text-red-200"
            : "bg-slate-900/80 border-slate-700 text-slate-200"
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="font-bold text-sm text-white leading-tight">
              {student.name}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
              <span>Section {student.section}</span>
              <span>·</span>
              <span>Q{(student.currentQuestionIndex ?? 0) + 1}</span>
              <span>·</span>
              <span className="text-amber-400 font-semibold">
                Demerits: {student.demerits || 0}
              </span>
            </div>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              student.isLocked
                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            {student.isLocked ? "Locked" : "Active"}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() =>
              onSendCommand?.(student.uid, student.isLocked ? "UNLOCK" : "LOCK")
            }
            className={`py-1.5 px-1 rounded-lg text-xs font-bold transition text-center ${
              student.isLocked
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-amber-600 hover:bg-amber-500 text-white"
            }`}
          >
            {student.isLocked ? "Unlock" : "Lock"}
          </button>
          <button
            type="button"
            onClick={() => onSendCommand?.(student.uid, "ADD_DEMERIT")}
            className="py-1.5 px-1 rounded-lg text-xs font-bold bg-amber-900/40 hover:bg-amber-800 text-amber-200 border border-amber-700/50 transition text-center"
          >
            +1 Dem
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Force finish exam for ${student.name}?`)) {
                onSendCommand?.(student.uid, "FORCE_FINISH");
              }
            }}
            className="py-1.5 px-1 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-600 text-white transition text-center"
          >
            Finish
          </button>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(`Kick ${student.name} from exam for behavior?`)
              ) {
                onSendCommand?.(student.uid, "KICK", {
                  code: student.code || null,
                  name: student.name,
                  section: student.section,
                  reason: "Behavior / Not following directions",
                });
              }
            }}
            className="py-1.5 px-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-200 transition text-center"
          >
            Kick
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="py-1.5 px-1 rounded-lg text-xs font-bold bg-purple-900/50 hover:bg-purple-700 text-purple-200 border border-purple-700/50 transition text-center"
            title="Custom Actions & Presets"
          >
            Actions
          </button>
        </div>
      </div>

      <CommandModal
        student={student}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSendCommand={onSendCommand}
      />
    </>
  );
}

export default function TeacherJailMonitor({
  liveStudents = [],
  activeSection,
  onSendCommand,
}) {
  return (
    <div className="w-full max-w-4xl bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-xl mb-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Live Classroom Sync</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
              Section {activeSection || "All"}
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            {liveStudents.length} active student
            {liveStudents.length === 1 ? "" : "s"} connected
          </p>
        </div>
      </div>

      {liveStudents.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500 font-medium">
          No students currently connected to this section.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {liveStudents.map((student) => (
            <StudentCard
              key={student.uid}
              student={student}
              onSendCommand={onSendCommand}
            />
          ))}
        </div>
      )}
    </div>
  );
}
