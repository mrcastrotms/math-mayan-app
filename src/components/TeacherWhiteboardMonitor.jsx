import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

export default function TeacherWhiteboardMonitor({ defaultSection = "4D", onBack }) {
  const [section, setSection] = useState(defaultSection);
  const [students, setStudents] = useState([]);
  const [pinnedIds, setPinnedIds] = useState([]);
  const [isCycling, setIsCycling] = useState(false);
  const [cycleIndex, setCycleIndex] = useState(0);

  const sections = ["4A", "4B", "4C", "4D", "4E", "5B"];

  useEffect(() => {
    if (!section) return;
    const q = query(collection(db, "class_whiteboards", section, "students"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentMap = new Map();

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // Unique key by studentId, or fallback to normalized studentName
        const uniqueKey = data.studentId || docSnap.id || data.studentName?.trim().toLowerCase();
        if (!uniqueKey) return;

        const currentTimestamp = data.updatedAt?.toMillis?.() || 0;
        const existing = studentMap.get(uniqueKey);

        if (!existing || currentTimestamp >= (existing.updatedAt?.toMillis?.() || 0)) {
          studentMap.set(uniqueKey, {
            id: docSnap.id,
            uniqueKey,
            ...data,
          });
        }
      });

      const list = Array.from(studentMap.values());
      list.sort((a, b) => (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0));
      setStudents(list);
    }, (err) => {
      console.error("Error fetching whiteboard stream:", err);
    });
    return () => unsubscribe();
  }, [section]);

  useEffect(() => {
    if (!isCycling || students.length === 0) return;
    const interval = setInterval(() => {
      setCycleIndex((prev) => (prev + 2) % students.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isCycling, students.length]);

  const togglePin = (uniqueKey) => {
    if (pinnedIds.includes(uniqueKey)) {
      setPinnedIds(pinnedIds.filter((id) => id !== uniqueKey));
    } else {
      if (pinnedIds.length >= 4) {
        setPinnedIds([pinnedIds[1], pinnedIds[2], pinnedIds[3], uniqueKey]);
      } else {
        setPinnedIds([...pinnedIds, uniqueKey]);
      }
    }
  };

  const displayedStudents = isCycling
    ? students.slice(cycleIndex, cycleIndex + 2).concat(students.length < 2 ? [] : students.slice(0, Math.max(0, 2 - (students.length - cycleIndex))))
    : pinnedIds.length > 0
      ? students.filter((s) => pinnedIds.includes(s.uniqueKey))
      : students;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5">
              ← Back
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Live Whiteboard Monitor</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time student scratchpad stream & multi-view monitor</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Section:</span>
            <select value={section} onChange={(e) => { setSection(e.target.value); setPinnedIds([]); }} className="bg-transparent text-xs font-bold text-blue-600 dark:text-blue-400 focus:outline-none cursor-pointer">
              {sections.map(sec => <option key={sec} value={sec} className="dark:bg-slate-900">{sec}</option>)}
            </select>
          </div>
          <button onClick={() => setIsCycling(!isCycling)} className={"px-3 py-1.5 text-xs font-semibold rounded-xl transition-all " + (isCycling ? "bg-amber-500 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300")}>
            {isCycling ? "⏸ Stop Cycle" : "▶ Auto Cycle"}
          </button>
          {pinnedIds.length > 0 && (
            <button onClick={() => setPinnedIds([])} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 text-xs font-semibold rounded-xl transition-all">
              Clear Pins ({pinnedIds.length})
            </button>
          )}
        </div>
      </div>
      {students.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="text-slate-400 text-4xl mb-3">✏️</div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No Active Whiteboards in Section {section}</h3>
          <p className="text-xs text-slate-500 mt-1">Student live sketches will appear here instantly as they draw.</p>
        </div>
      ) : (
        <div className={"grid gap-6 " + (pinnedIds.length > 0 || isCycling ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4")}>
          {displayedStudents.map((student) => {
            const isPinned = pinnedIds.includes(student.uniqueKey);
            return (
              <div key={student.uniqueKey} className={"bg-white dark:bg-slate-900 rounded-2xl shadow-sm border transition-all overflow-hidden flex flex-col " + (isPinned ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md" : "border-slate-200 dark:border-slate-800")}>
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate max-w-[160px]">{student.studentName || "Student"}</span>
                  </div>
                  <button onClick={() => togglePin(student.uniqueKey)} className={"px-2.5 py-1 text-xs font-semibold rounded-lg transition-all " + (isPinned ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300")}>
                    {isPinned ? "Pinned ✓" : "Pin View"}
                  </button>
                </div>
                <div className="p-3 bg-slate-950 flex-1 flex items-center justify-center">
                  {student.dataUrl ? (
                    <img src={student.dataUrl} alt={student.studentName + " whiteboard"} className="w-full h-auto rounded-lg border border-slate-800 object-contain bg-white" />
                  ) : (
                    <div className="h-48 flex items-center justify-center text-slate-500 text-xs">Waiting for drawing...</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
