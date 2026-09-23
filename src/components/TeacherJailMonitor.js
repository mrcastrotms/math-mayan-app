"use client";

import StudentCard from "./jail/StudentCard";

export default function TeacherJailMonitor({
  liveStudents = [],
  activeSection,
  onSendCommand,
}) {
  return (
    <div className="w-full max-w-4xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-[var(--app-fg)] shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Live Classroom</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
              Section {activeSection || "All"}
            </span>
            {liveStudents.length > 0 && (
              <button 
                onClick={() => {
                  if(window.confirm("Force finish exams for ALL " + liveStudents.length + " active students?")) {
                    liveStudents.forEach(s => onSendCommand?.(s.uid, "FORCE_FINISH"));
                  }
                }}
                className="ml-auto text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg font-bold transition shadow-sm"
              >
                Finish All
              </button>
            )}
          </h3>
          <p className="text-xs text-slate-400">
            {liveStudents.length} active student
            {liveStudents.length === 1 ? "" : "s"} connected
          </p>
        </div>
      </div>

      {liveStudents.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500 font-medium">
          No students currently connected
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
