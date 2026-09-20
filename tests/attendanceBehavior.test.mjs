import test from "node:test";
import assert from "node:assert/strict";
import {
  ATTENDANCE_THRESHOLD_MS,
  attendanceStatus,
  historicalDailyTotals,
  historicalStudentRows,
  relativeBehaviorScores,
} from "../src/utils/attendanceBehavior.mjs";

test("marks a student present after ten minutes", () => {
  const joinedAtMs = 1000;
  assert.equal(
    attendanceStatus({ joinedAtMs, lastSeenAtMs: joinedAtMs + ATTENDANCE_THRESHOLD_MS }, joinedAtMs + ATTENDANCE_THRESHOLD_MS),
    "present",
  );
  assert.equal(attendanceStatus({ joinedAtMs, lastSeenAtMs: joinedAtMs + 1000 }, joinedAtMs + 1000), "in-progress");
});

test("normalizes behavior into a relative 70 to 100 score", () => {
  const scores = relativeBehaviorScores([
    { studentName: "Highest", merits: 4, demerits: 0 },
    { studentName: "Lowest", merits: 0, demerits: 2 },
  ]);
  assert.equal(scores[0].behaviorScore, 100);
  assert.equal(scores[1].behaviorScore, 70);
});

test("builds historical student rows and daily totals by grade and date", () => {
  const attendance = [
    { uid: "a", studentName: "Ada", section: "4B", dateKey: "2026-09-19", qualifiedAtMs: 1 },
    { uid: "a", studentName: "Ada", section: "4B", dateKey: "2026-09-20", qualifiedAtMs: 2 },
    { uid: "b", studentName: "Bo", section: "5A", dateKey: "2026-09-20", qualifiedAtMs: 3 },
  ];
  const behavior = [
    { uid: "a", studentName: "Ada", section: "4B", dateKey: "2026-09-20", merits: 2, demerits: 0 },
  ];
  const rows = historicalStudentRows(attendance, behavior, { dateKey: "2026-09-20", grade: "4" });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].attendanceDays, 1);
  assert.equal(rows[0].merits, 2);
  assert.deepEqual(historicalDailyTotals(attendance, behavior, "4"), [
    { dateKey: "2026-09-19", present: 1, students: 1, merits: 0, demerits: 0 },
    { dateKey: "2026-09-20", present: 1, students: 1, merits: 2, demerits: 0 },
  ]);
});
