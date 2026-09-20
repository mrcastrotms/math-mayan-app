import { useEffect, useMemo, useState } from "react";
import { deleteAttendanceRecords, loadAttendanceRecords } from "../services/attendanceService";
import { deleteBehaviorRecords, loadBehaviorRecords } from "../services/behaviorService";
import {
  historicalDailyTotals,
  historicalStudentRows,
  relativeBehaviorScores,
  sectionGrade,
} from "../utils/attendanceBehavior.mjs";

export default function AttendanceValuesHistory({ availableSections = [], onBack }) {
  const [attendance, setAttendance] = useState([]);
  const [behavior, setBehavior] = useState([]);
  const [dateKey, setDateKey] = useState("");
  const [grade, setGrade] = useState("all");
  const [section, setSection] = useState("all");
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [purging, setPurging] = useState(false);
  const [showPurgeConfirmation, setShowPurgeConfirmation] = useState(false);

  useEffect(() => {
    Promise.all([loadAttendanceRecords(""), loadBehaviorRecords("")])
      .then(([attendanceRecords, behaviorRecords]) => {
        setAttendance(attendanceRecords);
        setBehavior(behaviorRecords);
      })
      .catch(() => setError("Unable to load historical attendance and values records."));
  }, []);

  const grades = useMemo(
    () => [...new Set(availableSections.map(sectionGrade).filter(Boolean))].sort((a, b) => Number(a) - Number(b)),
    [availableSections],
  );
  const rows = useMemo(() => {
    const filteredBehavior = behavior.filter(
      (item) => (!dateKey || item.dateKey === dateKey) &&
        (grade === "all" || sectionGrade(item.section) === grade) &&
        (section === "all" || item.section === section),
    );
    return historicalStudentRows(attendance, relativeBehaviorScores(filteredBehavior), { dateKey, grade, section });
  }, [attendance, behavior, dateKey, grade, section]);
  const dailyTotals = useMemo(() => historicalDailyTotals(attendance, behavior, grade, section), [attendance, behavior, grade, section]);
  const maxPresent = Math.max(1, ...dailyTotals.map((item) => item.present));
  const visibleRecords = useMemo(() => {
    const keys = new Set(rows.map((row) => `${row.uid}_${row.section}`));
    return {
      attendance: attendance.filter((item) => keys.has(`${item.uid}_${item.section}`) && (!dateKey || item.dateKey === dateKey)),
      behavior: behavior.filter((item) => keys.has(`${item.uid}_${item.section}`) && (!dateKey || item.dateKey === dateKey)),
    };
  }, [attendance, behavior, dateKey, rows]);
  const purgeSelected = async () => {
    if (!selectedIds.length) return;
    setPurging(true);
    try {
      await Promise.all([
        deleteAttendanceRecords(visibleRecords.attendance.filter((record) => selectedIds.includes(`${record.uid}_${record.section}`))),
        deleteBehaviorRecords(visibleRecords.behavior.filter((record) => selectedIds.includes(`${record.uid}_${record.section}`))),
      ]);
      const [attendanceRecords, behaviorRecords] = await Promise.all([loadAttendanceRecords(""), loadBehaviorRecords("")]);
      setAttendance(attendanceRecords);
      setBehavior(behaviorRecords);
      setSelectedIds([]);
      setShowPurgeConfirmation(false);
    } catch (purgeError) {
      console.error("Unable to purge attendance and values history:", purgeError);
      setError("Unable to purge selected history.");
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-start justify-center bg-[var(--app-bg)] p-4 pt-16 text-[var(--app-fg)] sm:p-8">
    <section className="w-full max-w-5xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-[var(--app-fg)] shadow-xl" aria-labelledby="attendance-values-history-title">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="attendance-values-history-title" className="text-2xl font-bold">Attendance & Values History</h2>
          <p className="text-sm opacity-75">Historical Firestore records by student, date, and grade.</p>
        </div>
        <button type="button" onClick={onBack} className="rounded-lg border border-[var(--app-border)] px-4 py-2 font-bold hover:bg-black/5">Back to dashboard</button>
      </div>
      {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Date
          <input type="date" value={dateKey} onChange={(event) => setDateKey(event.target.value)} className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Grade
          <select value={grade} onChange={(event) => setGrade(event.target.value)} className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
            <option value="all">All grades</option>
            {grades.map((item) => <option key={item} value={item}>Grade {item}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Section
          <select value={section} onChange={(event) => setSection(event.target.value)} className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
            <option value="all">All sections</option>
            {availableSections
              .filter((item) => grade === "all" || sectionGrade(item) === grade)
              .map((item) => <option key={item} value={item}>Section {item}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => setDateKey("")} className="rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm font-bold">All dates</button>
        <button type="button" disabled={!selectedIds.length || purging} onClick={() => setShowPurgeConfirmation(true)} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-40">{purging ? "Purging…" : `Purge selected (${selectedIds.length})`}</button>
      </div>

      <div className="mb-6 rounded-xl border border-[var(--app-border)] p-4">
        <h3 className="mb-3 font-bold">Attendance trend</h3>
        {dailyTotals.length === 0 ? <p className="text-sm opacity-75">No historical records match these filters.</p> : (
          <div className="flex min-h-40 items-end gap-2 overflow-x-auto">
            {dailyTotals.map((item) => (
              <div key={item.dateKey} className="flex min-w-12 flex-col items-center gap-1 text-xs" title={`${item.dateKey}: ${item.present} present`}>
                <span>{item.present}</span>
                <div className="w-8 rounded-t bg-emerald-500" style={{ height: `${Math.max(8, (item.present / maxPresent) * 100)}px` }} />
                <span className="rotate-[-45deg] whitespace-nowrap">{item.dateKey.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead><tr className="border-b border-[var(--app-border)]"><th className="p-2">Student</th><th className="p-2">Grade / Section</th><th className="p-2">Attendance days</th><th className="p-2">Merits</th><th className="p-2">Demerits</th><th className="p-2">Values score</th></tr></thead>
          <tbody>
            {rows.map((row) => <tr key={row.id} className="border-b border-[var(--app-border)]/50"><td className="p-2"><input type="checkbox" aria-label={`Select ${row.studentName} history`} checked={selectedIds.includes(`${row.uid}_${row.section}`)} onChange={() => setSelectedIds((current) => current.includes(`${row.uid}_${row.section}`) ? current.filter((id) => id !== `${row.uid}_${row.section}`) : [...current, `${row.uid}_${row.section}`])} /></td><td className="p-2 font-semibold">{row.studentName}</td><td className="p-2">{row.grade} / {row.section}</td><td className="p-2">{row.attendanceDays}</td><td className="p-2">{row.merits}</td><td className="p-2">{row.demerits}</td><td className="p-2 font-bold">{row.behaviorScore == null ? "—" : `${row.behaviorScore}%`}</td></tr>)}
          </tbody>
        </table>
        {rows.length === 0 && <p className="py-4 text-sm opacity-75">No students match these filters.</p>}
      </div>
    </section>
    {showPurgeConfirmation && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="purge-history-title">
        <div className="w-full max-w-md rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-[var(--app-fg)] shadow-2xl">
          <h2 id="purge-history-title" className="text-xl font-bold">Purge attendance and values history?</h2>
          <p className="mt-3 text-sm opacity-80">
            This permanently removes the selected Attendance Book and Behavior & Values records. It does not remove Gradebook exam results.
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={() => setShowPurgeConfirmation(false)} className="rounded-lg border px-4 py-2 font-bold">Cancel</button>
            <button type="button" onClick={purgeSelected} disabled={purging} className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white disabled:opacity-50">{purging ? "Purging…" : "Delete history"}</button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
