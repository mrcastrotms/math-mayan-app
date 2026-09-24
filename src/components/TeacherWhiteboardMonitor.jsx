import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

export default function TeacherWhiteboardMonitor({ defaultSection = "4D", onBack }) {
  const [section, setSection] = useState(defaultSection);
  const [students, setStudents] = useState([]);
  const [pinnedNames, setPinnedNames] = useState([]);
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
        const rawName = (data.studentName || data.name || docSnap.id).trim();
        if (!rawName) return;

        // Dedup STRICTLY by student name so reconnects or multi-tabs never duplicate
        const normKey = rawName.toLowerCase();
        const currentTimestamp = data.updatedAt?.toMillis?.() || data.timestamp || 0;
        const existing = studentMap.get(normKey);

        if (!existing || currentTimestamp >= (existing.updatedAt?.toMillis?.() || existing.timestamp || 0)) {
          studentMap.set(normKey, {
            id: docSnap.id,
            normKey,
            studentName: rawName,
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

  const togglePin = (normKey) => {
    setPinnedNames((prev) => {
      if (prev.includes(normKey)) {
        return prev.filter((k) => k !== normKey);
      }
      if (prev.length >= 4) {
        // Keep up to 4, replace oldest
        return [...prev.slice(1), normKey];
      }
      return [...prev, normKey];
    });
  };

  // Determine which students to render
  const displayedStudents = isCycling
    ? students.slice(cycleIndex, cycleIndex + 2).concat(students.length < 2 ? [] : students.slice(0, Math.max(0, 2 - (students.length - cycleIndex))))
    : pinnedNames.length > 0
      ? students.filter((s) => pinnedNames.includes(s.normKey))
      : students;

  // Compute layout grid based on pinned count
  const getGridClass = () => {
    if (pinnedNames.length === 1) {
      return "grid-cols-1 max-w-4xl mx-auto";
    }
    if (pinnedNames.length === 2) {
      return "grid-cols-1 md:grid-cols-2";
    }
    if (pinnedNames.length === 3 || pinnedNames.length === 4) {
      return "grid-cols-1 sm:grid-cols-2";
    }
    if (isCycling) {
      return "grid-cols-1 md:grid-cols-2";
    }
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-3 sm:p-6 min-h-screen flex flex-col">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5">
              ← Back
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Live Whiteboard Monitor</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold">
                {students.length} Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time student scratchpad stream & multi-view monitor</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Section Selector */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Section:</span>
            <select
              value={section}
              onChange={(e) => { setSection(e.target.value); setPinnedNames([]); }}
              className="bg-transparent text-xs font-bold text-blue-600 dark:text-blue-400 focus:outline-none cursor-pointer"
            >
              {sections.map(sec => <option key={sec} value={sec} className="dark:bg-slate-900">{sec}</option>)}
            </select>
          </div>

          {/* Quick Pin Presets Info */}
          {pinnedNames.length > 0 && (
            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-xl text-xs font-semibold border border-blue-200 dark:border-blue-800">
              <span>Pinned: {pinnedNames.length} / 4</span>
              {pinnedNames.length === 2 && <span className="opacity-75 font-normal">(Side-by-Side)</span>}
              {pinnedNames.length === 4 && <span className="opacity-75 font-normal">(2×2 Grid)</span>}
            </div>
          )}

          {/* Auto Cycle Button */}
          <button
            onClick={() => setIsCycling(!isCycling)}
            className={"px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 " + (isCycling ? "bg-amber-500 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200")}
          >
            {isCycling ? "⏸ Stop Cycle" : "▶ Auto Cycle (2-Up)"}
          </button>

          {/* Clear Pins */}
          {pinnedNames.length > 0 && (
            <button
              onClick={() => setPinnedNames([])}
              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl transition-all"
            >
              Reset to All ({students.length})
            </button>
          )}
        </div>
      </div>

      {/* Main Board Feed */}
      {students.length === 0 ? (
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center">
          <div className="text-slate-400 text-5xl mb-3">✏️</div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No Active Whiteboards in Section {section}</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">When students open the Live Scratchpad in this section, their work streams here automatically.</p>
        </div>
      ) : (
        <div className={"grid gap-4 flex-1 " + getGridClass()}>
          {displayedStudents.map((student) => {
            const isPinned = pinnedNames.includes(student.normKey);
            const isTwoUp = pinnedNames.length === 2;
            const isFourUp = pinnedNames.length >= 3;

            return (
              <div
                key={student.normKey}
                className={"bg-white dark:bg-slate-900 rounded-2xl shadow-sm border transition-all overflow-hidden flex flex-col " + (isPinned ? "border-blue-500 ring-2 ring-blue-500/30 shadow-md" : "border-slate-200 dark:border-slate-800 hover:border-slate-300")}
              >
                {/* Student Card Header */}
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                      {student.studentName}
                    </span>
                  </div>
                  <button
                    onClick={() => togglePin(student.normKey)}
                    className={"px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 " + (isPinned ? "bg-blue-600 text-white shadow-sm" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600")}
                  >
                    {isPinned ? "✓ Pinned" : "+ Pin View"}
                  </button>
                </div>

                {/* Whiteboard Stream Canvas Area */}
                <div className={"bg-slate-950 flex-1 flex items-center justify-center p-2 " + (isTwoUp ? "min-h-[380px] lg:min-h-[520px]" : isFourUp ? "min-h-[280px]" : "min-h-[220px]")}>
                  {student.dataUrl ? (
                    <img
                      src={student.dataUrl}
                      alt={`${student.studentName}'s scratchpad`}
                      className="w-full h-full rounded-xl border border-slate-800 object-contain bg-white"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 text-xs py-12">
                      <span className="text-2xl mb-1">⏳</span>
                      <span>Waiting for student stroke...</span>
                    </div>
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
