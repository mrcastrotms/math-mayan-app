"use client";

import { useState } from "react";
import CommandModal from "./CommandModal";

export default function StudentCard({ student, onSendCommand }) {
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
              <span className="text-emerald-400 font-semibold">
                Merits: {student.merits || 0}
              </span>
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

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-2 border-t border-slate-800">
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
            onClick={() => onSendCommand?.(student.uid, "ADD_MERIT")}
            className="py-1.5 px-1 rounded-lg text-xs font-bold bg-emerald-900/40 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 transition text-center"
          >
            +1 Merit
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
