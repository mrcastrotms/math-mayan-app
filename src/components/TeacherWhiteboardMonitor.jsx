import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, doc, deleteDoc } from "firebase/firestore";

export default function TeacherWhiteboardMonitor({ defaultSection = "4D", onBack }) {
  const [section, setSection] = useState(defaultSection);
  const [students, setStudents] = useState([]);
  const [rawDocs, setRawDocs] = useState([]);
  const [roster, setRoster] = useState([]);
  const [pinnedNames, setPinnedNames] = useState([]);
  const [isCycling, setIsCycling] = useState(false);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [spotlightOnly, setSpotlightOnly] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  const dropdownRef = useRef(null);
  const sections = ["4A", "4B", "4C", "4D", "4E", "5B"];

  // Fetch Class Roster
  useEffect(() => {
    fetch("/api/roster", { headers: { "x-teacher-pin": "0801" } })
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => setRoster(data[section] || []))
      .catch((err) => console.error("Roster fetch error:", err));
  }, [section]);

  // Fetch Live Whiteboards
  useEffect(() => {
    if (!section) return;
    const q = query(collection(db, "class_whiteboards", section, "students"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsList = [];
      snapshot.forEach((docSnap) => {
        docsList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setRawDocs(docsList);
    }, (err) => {
      console.error("Error fetching whiteboard stream:", err);
    });
    return () => unsubscribe();
  }, [section]);

  // Periodic heartbeat filter & Alphabetical Locking
  useEffect(() => {
    const filterLiveStudents = () => {
      const now = Date.now();
      const studentMap = new Map();

      // Map out all live active sessions
      rawDocs.forEach((data) => {
        const rawName = (data.studentName || data.name || data.id || "").trim();
        if (!rawName) return;

        const lastSeenTime = data.lastSeen?.toMillis?.() || data.updatedAt?.toMillis?.() || data.timestamp || 0;
        const timeDiffSec = (now - lastSeenTime) / 1000;
        const isOnline = data.isLive !== false && lastSeenTime > 0 && timeDiffSec <= 40;

        const normKey = rawName.toLowerCase();
        const existing = studentMap.get(normKey);

        if (!existing || lastSeenTime >= (existing.lastSeenTime || 0)) {
          studentMap.set(normKey, {
            id: data.id,
            normKey,
            studentName: rawName,
            lastSeenTime,
            isOnline,
            ...data,
          });
        }
      });

      // Combine Roster with any live stragglers safely!
      const uniqueNames = new Set();
      
      // Safely extract string names from roster objects
      roster.forEach(r => {
        const nameStr = typeof r === 'string' ? r : (r.studentName || r.name || r.id || "");
        if (nameStr.trim()) uniqueNames.add(nameStr.trim());
      });
      
      // Add any live students who might not be in the roster yet
      rawDocs.forEach(d => {
        const nameStr = (d.studentName || d.name || d.id || "");
        if (nameStr.trim()) uniqueNames.add(nameStr.trim());
      });

      const list = Array.from(uniqueNames).map((name) => {
        const safeName = String(name);
        const normKey = safeName.toLowerCase();
        const liveData = studentMap.get(normKey);
        
        if (liveData && liveData.isOnline) {
          return { normKey, studentName: safeName, ...liveData, isOnline: true };
        } else {
          return { normKey, studentName: safeName, isOnline: false, dataUrl: null };
        }
      });

      // ALPHABETICAL LOCK: No more jumping!
      list.sort((a, b) => a.studentName.localeCompare(b.studentName));
      setStudents(list);
    };

    filterLiveStudents();
    const interval = setInterval(filterLiveStudents, 5000);
    return () => clearInterval(interval);
  }, [rawDocs, roster]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onlineStudents = students.filter(s => s.isOnline);
  const liveCount = onlineStudents.length;

  // Auto cycle timer (Only cycles through ONLINE students)
  useEffect(() => {
    if (!isCycling || onlineStudents.length === 0) return;
    const interval = setInterval(() => {
      setCycleIndex((prev) => (prev + 2) % onlineStudents.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isCycling, onlineStudents.length]);

  const togglePin = (normKey) => {
    setPinnedNames((prev) => {
      if (prev.includes(normKey)) return prev.filter((k) => k !== normKey);
      if (prev.length >= 4) return [...prev.slice(1), normKey];
      return [...prev, normKey];
    });
  };

  const purgeAllSectionBoards = async () => {
    if (!window.confirm(`Clear all ${rawDocs.length} saved whiteboard sessions for Section ${section}? This kicks stale ghosts immediately.`)) return;
    setIsPurging(true);
    try {
      for (const d of rawDocs) {
        await deleteDoc(doc(db, "class_whiteboards", section, "students", d.id));
      }
      setPinnedNames([]);
    } catch (err) {
      console.error("Purge error:", err);
    } finally {
      setIsPurging(false);
    }
  };

  const pinnedStudents = onlineStudents.filter((s) => pinnedNames.includes(s.normKey));

  const cycledStudents = isCycling && onlineStudents.length > 0
    ? onlineStudents.slice(cycleIndex, cycleIndex + 2).concat(
        onlineStudents.length < 2 ? [] : onlineStudents.slice(0, Math.max(0, 2 - (onlineStudents.length - cycleIndex)))
      )
    : [];

  const spotlightList = isCycling ? cycledStudents : pinnedStudents;

  const getSpotlightGridClass = () => {
    if (spotlightList.length === 1) return "grid-cols-1 max-w-4xl mx-auto";
    if (spotlightList.length === 2) return "grid-cols-1 md:grid-cols-2";
    return "grid-cols-1 sm:grid-cols-2";
  };

  return (
    <div className="w-full max-w-[1650px] mx-auto p-3 sm:p-6 min-h-screen flex flex-col">
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
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5 ${liveCount > 0 ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {liveCount > 0 ? <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> : <span className="w-2 h-2 rounded-full bg-slate-400" />}
                {liveCount} Live Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Heartbeat sync active: auto-removes disconnected students within 30s.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <span>📌 Pin ({pinnedNames.length}/4)</span>
              <span className="text-[10px]">▼</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 max-h-80 overflow-y-auto">
                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Select up to 4 to compare
                </div>
                {onlineStudents.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-slate-500 text-center">No students online right now</div>
                ) : (
                  onlineStudents.map((st) => {
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

          <button
            onClick={() => { setIsCycling(!isCycling); if (!isCycling) setPinnedNames([]); }}
            className={"px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 " + (isCycling ? "bg-amber-500 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200")}
          >
            {isCycling ? "⏸ Stop Cycle" : "▶ Auto Cycle (2-Up)"}
          </button>

          {spotlightList.length > 0 && (
            <button
              onClick={() => setSpotlightOnly(!spotlightOnly)}
              className={"px-3 py-1.5 text-xs font-semibold rounded-xl transition-all " + (spotlightOnly ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200")}
            >
              {spotlightOnly ? "Show All Boards" : "Projector View"}
            </button>
          )}

          <button
            onClick={purgeAllSectionBoards}
            disabled={isPurging || rawDocs.length === 0}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
            title="Clean out offline / stale ghost sessions"
          >
            {isPurging ? "Purging..." : `Purge (${rawDocs.length})`}
          </button>
        </div>
      </div>

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
              <button onClick={() => setPinnedNames([])} className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold">
                Unpin All
              </button>
            )}
          </div>
          <div className={"grid gap-4 " + getSpotlightGridClass()}>
            {spotlightList.map((student) => (
              <div key={"spotlight-" + student.normKey} className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border-2 border-blue-500 overflow-hidden flex flex-col">
                <div className="px-4 py-2 bg-blue-50/80 dark:bg-slate-800 border-b border-blue-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{student.studentName}</span>
                  {!isCycling && (
                    <button onClick={() => togglePin(student.normKey)} className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-0.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50">
                      ✕ Unpin
                    </button>
                  )}
                </div>
                <div className={"bg-slate-950 flex-1 flex items-center justify-center p-2.5 " + (spotlightList.length === 1 ? "min-h-[500px]" : spotlightList.length === 2 ? "min-h-[460px] lg:min-h-[560px]" : "min-h-[340px]")}>
                  <img src={student.dataUrl} alt={student.studentName} className="w-full h-full rounded-xl border border-slate-800 object-contain bg-white shadow-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!spotlightOnly && (
        <div className="flex-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
            All Classroom Scratchpads ({students.length} Total, {liveCount} Live)
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {students.map((student) => {
              const isPinned = pinnedNames.includes(student.normKey);
              return (
                <div
                  key={student.normKey}
                  className={`rounded-2xl shadow-sm border transition-all overflow-hidden flex flex-col ${isPinned ? "ring-2 ring-blue-500 border-blue-500" : "border-slate-200 dark:border-slate-800 hover:border-slate-300"} ${!student.isOnline ? "opacity-60 bg-slate-50 dark:bg-slate-900/50" : "bg-white dark:bg-slate-900"}`}
                >
                  <div className={`px-3.5 py-2.5 border-b flex items-center justify-between ${!student.isOnline ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800" : "bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800"}`}>
                    <div className="flex items-center gap-2">
                      {student.isOnline ? (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                      )}
                      <span className={`font-bold text-xs truncate max-w-[150px] ${!student.isOnline ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-slate-200"}`}>
                        {student.studentName}
                      </span>
                    </div>
                    {student.isOnline && (
                      <button
                        onClick={() => togglePin(student.normKey)}
                        className={"px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all " + (isPinned ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-600")}
                      >
                        {isPinned ? "✓ Pinned" : "+ Pin View"}
                      </button>
                    )}
                  </div>

                  <div className={`p-2 flex items-center justify-center min-h-[190px] ${!student.isOnline ? "bg-slate-200/50 dark:bg-slate-900/50" : "bg-slate-950"}`}>
                    {student.isOnline && student.dataUrl ? (
                      <img src={student.dataUrl} alt={student.studentName} className="w-full h-auto rounded-lg border border-slate-800 object-contain bg-white" />
                    ) : (
                      <div className="text-slate-500 text-xs font-semibold flex flex-col items-center gap-2">
                        <span className="text-2xl grayscale opacity-50">💤</span>
                        <span>Offline / Waiting</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
