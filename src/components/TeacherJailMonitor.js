"use client";

import StudentCard from "./jail/StudentCard";

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
            <span>Live Classroom</span>
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
