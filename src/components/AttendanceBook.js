import React, { useEffect, useMemo, useState } from "react";
import { useAttendanceBook } from "../hooks/useAttendanceBook";

export default function AttendanceBook({ activeSection, onOpenHistory }) {
  const { records, dateKey, status, error } = useAttendanceBook();
  const [rosterDirectory, setRosterDirectory] = useState({});

  useEffect(() => {
    fetch("/api/roster", { headers: { "x-teacher-pin": "0801" } })
      .then((response) => (response.ok ? response.json() : {}))
      .then(setRosterDirectory)
      .catch((fetchError) => console.error("Unable to load attendance roster:", fetchError));
  }, []);

  const sectionData = useMemo(() => {
    if (!activeSection) return null;
    
    // Filter to ONLY the active section
    const rawRecords = records.filter((item) => item.section === activeSection);
    
    // Deduplicate! Keep the most recent/highest status record per student
    const uniqueStudentsMap = rawRecords.reduce((acc, curr) => {
      // If we already have them, only overwrite if they are now 'present'
      if (!acc[curr.studentName] || status(curr) === "present") {
         acc[curr.studentName] = curr;
      }
      return acc;
    }, {});
    
    const uniqueRecords = Object.values(uniqueStudentsMap).sort((a, b) => String(a.studentName || "").localeCompare(String(b.studentName || "")));
    const roster = rosterDirectory[activeSection] || [];
    
    return {
      section: activeSection,
      present: uniqueRecords.filter((item) => status(item) === "present").length,
      inProgress: uniqueRecords.filter((item) => status(item) === "in-progress").length,
      expected: roster.length,
      students: uniqueRecords,
    };
  }, [activeSection, records, rosterDirectory, status]);

  if (!activeSection || !sectionData) return null;

  return (
    <section className="w-full max-w-4xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-[var(--app-fg)] shadow-xl" aria-labelledby="attendance-book-title">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 id="attendance-book-title" className="text-xl font-bold">Live Attendance: Section {activeSection}</h2>
          <p className="text-sm opacity-75">Daily presence requires 10 minutes on Student Home. Date: {dateKey}</p>
        </div>
        <button type="button" onClick={onOpenHistory} className="rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-500">
          Open complete history
        </button>
      </div>
      
      {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
      
      <article className="rounded-xl border border-[var(--app-border)] p-4 bg-emerald-500/5">
        <div className="flex items-center gap-4 border-b border-[var(--app-border)] pb-3 mb-3">
          <p className="text-3xl font-black text-emerald-600">{sectionData.present} <span className="text-lg opacity-50 font-medium">/ {sectionData.expected || "—"} present</span></p>
          <div className="text-sm opacity-75 border-l border-[var(--app-border)] pl-4">
            <p>{sectionData.inProgress} in progress</p>
            <p>{Math.max(0, sectionData.expected - sectionData.present)} absent / unqualified</p>
          </div>
        </div>
        
        <ul className="grid gap-2 text-sm sm:grid-cols-2 md:grid-cols-3">
          {sectionData.students.map((student) => (
            <li key={student.studentName} className="flex items-center justify-between bg-[var(--app-bg)] p-2 rounded-lg border border-[var(--app-border)]">
              <span className="truncate font-semibold max-w-[140px]" title={student.studentName}>{student.studentName}</span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${status(student) === 'present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'}`}>
                {status(student)}
              </span>
            </li>
          ))}
        </ul>
        {sectionData.students.length === 0 && <p className="text-sm opacity-75 italic text-center py-4">No students have logged in today.</p>}
      </article>
    </section>
  );
}
