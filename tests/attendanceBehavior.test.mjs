import test from "node:test";
import assert from "node:assert/strict";
import {
  ATTENDANCE_THRESHOLD_MS,
  attendanceStatus,
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
