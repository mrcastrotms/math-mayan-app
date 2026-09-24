import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

export default function TeacherWhiteboardMonitor({ defaultSection = "4D", onBack }) {
  const [section, setSection] = useState(defaultSection);
  const [students, setStudents] = useState([]);
  const [pinnedNames, setPinnedNames] = useState([]);
  const [isCycling, setIsCycling] = useState(false);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [spotlightOnly, setSpotlightOnly] = useState(false);

  const dropdownRef = useRef(null);
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

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto cycle timer
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
        return [...prev.slice(1), normKey];
      }
      return [...prev, normKey];
    });
  };

  const pinnedStudents = students.filter((s) => pinnedNames.includes(s.normKey));

  const cycledStudents = isCycling
    ? students.slice(cycleIndex, cycleIndex + 2).concat(
        students.length < 2 ? [] : students.slice(0, Math.max(0, 2 - (students.length - cycleIndex)))
      )
    : [];

  const spotlightList = isCycling ? cycledStudents : pinnedStudents;

  const getSpotlightGridClass = () => {
    if (spotlightList.length === 1) return "grid-cols-1 max-w-4xl mx-auto";
    if (spotlightList.length === 2) return "grid-cols-1 md:grid-cols-2";
    return "grid-cols-1 sm:grid-cols-2"; // 3 or 4 in 2x2
  };

  return (
    <div className="w-full max-w-[1650px] mx-auto p-3 sm:p-6 min-h-screen flex flex-col">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-5 flex flex-wrap items-center justify-between gap-4 sticky top-2 z-30 backdrop-blur-md bg-white/95 dark:bg-slate-900/95">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5">
              ← Back
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Live Whiteboard Monitor</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {students.length} Online
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

          {/* Quick Pin Dropdown Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <span>📌 Pin Boards ({pinnedNames.length}/4)</span>
              <span className="text-[10px]">▼</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 max-h-80 overflow-y-auto">
                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Select up to 4 to compare
                </div>
                {students.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-slate-500 text-center">No students online</div>
                ) : (
                  students.map((st) => {
                    const isChecked = pinnedNames.includes(st.normKey);
                    return (
                      <label
                        key={st.normKey}
                        onClick={() => togglePin(st.normKey)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer font-medium text-slate-700 dark:text-slate-200"
                      >
                        <span className="truncate max-w-[190px]">{st.studentName}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                        />
                      </label>
                    );
                  })
                )}
                {pinnedNames.length > 0 && (
                  <button
                    onClick={() => { setPinnedNames([]); setIsDropdownOpen(false); }}
                    className="w-full mt-2 text-center text-rose-600 text-xs py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold"
                  >
                    Clear All Pins
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Auto Cycle Button */}
          <button
            onClick={() => { setIsCycling(!isCycling); if (!isCycling) setPinnedNames([]); }}
            className={"px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 " + (isCycling ? "bg-amber-500 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200")}
          >
            {isCycling ? "⏸ Stop Cycle" : "▶ Auto Cycle (2-Up)"}
          </button>

          {/* Theater / Spotlight Only View Toggle */}
          {spotlightList.length > 0 && (
            <button
              onClick={() => setSpotlightOnly(!spotlightOnly)}
              className={"px-3 py-1.5 text-xs font-semibold rounded-xl transition-all " + (spotlightOnly ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200")}
            >
              {spotlightOnly ? "Show All Boards" : "Projector View"}
            </button>
          )}
        </div>
      </div>

      {/* Spotlight Screen (Side-by-Side or 2x2 Grid) */}
      {spotlightList.length > 0 && (
        <div className="mb-8 p-4 bg-slate-100/70 dark:bg-slate-800/40 rounded-3xl border border-blue-500/20 ring-4 ring-blue-500/5">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2.5 py-0.5 rounded-lg">
                {isCycling ? "Auto Cycling Spotlight (2-Up)" : `Pinned Spotlight (${spotlightList.length} of 4)`}
              </span>
              {spotlightList.length === 2 && <span className="text-xs text-slate-500 font-medium">Side-by-Side Mode</span>}
              {spotlightList.length >= 3 && <span className="text-xs text-slate-500 font-medium">2×2 Comparison Grid</span>}
            </div>
            {!isCycling && (
              <button
                onClick={() => setPinnedNames([])}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
              >
                Unpin All
              </button>
            )}
          </div>

          <div className={"grid gap-4 " + getSpotlightGridClass()}>
            {spotlightList.map((student) => (
              <div
                key={"spotlight-" + student.normKey}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border-2 border-blue-500 overflow-hidden flex flex-col"
              >
                <div className="px-4 py-2 bg-blue-50/80 dark:bg-slate-800 border-b border-blue-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                    {student.studentName}
                  </span>
                  {!isCycling && (
                    <button
                      onClick={() => togglePin(student.normKey)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-0.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50"
                    >
                      ✕ Unpin
                    </button>
                  )}
                </div>
                <div className={"bg-slate-950 flex-1 flex items-center justify-center p-2.5 " + (spotlightList.length === 1 ? "min-h-[500px]" : spotlightList.length === 2 ? "min-h-[460px] lg:min-h-[560px]" : "min-h-[340px]")}>
                  {student.dataUrl ? (
                    <img
                      src={student.dataUrl}
                      alt={student.studentName}
                      className="w-full h-full rounded-xl border border-slate-800 object-contain bg-white shadow-sm"
                    />
                  ) : (
                    <div className="text-slate-500 text-xs">Waiting for student stroke...</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Classroom Grid (Never vanishes unless Projector View is toggled) */}
      {!spotlightOnly && (
        <div className="flex-1">
          {spotlightList.length > 0 && (
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
              All Classroom Scratchpads ({students.length})
            </div>
          )}

          {students.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center">
              <div className="text-slate-400 text-5xl mb-3">✏️</div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No Active Whiteboards in Section {section}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">When students open the Live Scratchpad, their live drawings appear here instantly.</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {students.map((student) => {
                const isPinned = pinnedNames.includes(student.normKey);
                return (
                  <div
                    key={student.normKey}
                    className={"bg-white dark:bg-slate-900 rounded-2xl shadow-sm border transition-all overflow-hidden flex flex-col " + (isPinned ? "ring-2 ring-blue-500 border-blue-500" : "border-slate-200 dark:border-slate-800 hover:border-slate-300")}
                  >
                    <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                          {student.studentName}
                        </span>
                      </div>
                      <button
                        onClick={() => togglePin(student.normKey)}
                        className={"px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all " + (isPinned ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-600")}
                      >
                        {isPinned ? "✓ Pinned" : "+ Pin View"}
                      </button>
                    </div>

                    <div className="bg-slate-950 p-2 flex items-center justify-center min-h-[190px]">
                      {student.dataUrl ? (
                        <img
                          src={student.dataUrl}
                          alt={student.studentName}
                          className="w-full h-auto rounded-lg border border-slate-800 object-contain bg-white"
                        />
                      ) : (
                        <div className="text-slate-500 text-xs">Waiting for drawing...</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
