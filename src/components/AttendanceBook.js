import React, { useEffect, useMemo, useState } from "react";
import { useAttendanceBook } from "../hooks/useAttendanceBook";

export default function AttendanceBook({ availableSections = [], onOpenHistory }) {
  const { records, dateKey, status, error } = useAttendanceBook();
  const [rosterDirectory, setRosterDirectory] = useState({});
  useEffect(() => {
    fetch("/api/roster", { headers: { "x-teacher-pin": "0801" } })
      .then((response) => (response.ok ? response.json() : {}))
      .then(setRosterDirectory)
      .catch((fetchError) => console.error("Unable to load attendance roster:", fetchError));
  }, []);
  const rows = useMemo(
    () =>
      availableSections.map((section) => {
        const sectionRecords = records.filter((item) => item.section === section);
        const roster = rosterDirectory[section] || [];
        return {
          section,
          present: sectionRecords.filter((item) => status(item) === "present").length,
          inProgress: sectionRecords.filter((item) => status(item) === "in-progress").length,
          expected: roster.length,
          students: sectionRecords,
        };
      }),
    [availableSections, records, rosterDirectory, status],
  );
  return (
    <section className="w-full max-w-4xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-[var(--app-fg)] shadow-xl" aria-labelledby="attendance-book-title">
      <h2 id="attendance-book-title" className="text-xl font-bold">Attendance Book</h2>
      <p className="mb-4 text-sm opacity-75">Daily presence requires 10 minutes on Student Home. Date: {dateKey}</p>
      <button type="button" onClick={onOpenHistory} className="mb-4 rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-500">Open complete attendance history</button>
      {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((row) => (
          <article key={row.section} className="rounded-xl border border-[var(--app-border)] p-4">
            <h3 className="font-bold">Section {row.section}</h3>
            <p className="text-2xl font-black text-emerald-600">{row.present} / {row.expected || "—"} present</p>
            <p className="text-sm opacity-75">{row.inProgress} in progress · {row.students.length} logged in · {Math.max(0, row.expected - row.present)} absent/unqualified</p>
            <ul className="mt-2 text-sm">
              {row.students.map((student) => <li key={student.id}>{student.studentName}: {status(student)}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
