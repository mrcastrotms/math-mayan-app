import test from "node:test";
import assert from "node:assert/strict";
import {
  getWorksheetStatus,
  isWorksheetAnswerCorrect,
  isWorksheetClosed,
  normalizeWorksheetAnswer,
  scoreWorksheet,
} from "../src/utils/worksheetUtils.mjs";

test("normalizes multiplication typography consistently", () => {
  assert.equal(normalizeWorksheetAnswer("4 × 4 · 4 * 4"), "4*4*4*4");
  assert.equal(isWorksheetAnswerCorrect("4 · 4 · 4 · 4", {
    correctAnswer: "4 x 4 x 4 x 4",
  }), true);
});

test("scores unanswered worksheet questions as incorrect", () => {
  const result = scoreWorksheet([
    { id: "q1", correctAnswer: "4" },
    { id: "q2", correctAnswer: "9" },
  ], { q1: "4" });
  assert.deepEqual(result, { correct: 1, answered: 1, total: 2, score: 50 });
});

test("reports progress and deadline state", () => {
  const now = Date.parse("2026-09-20T12:00:00Z");
  assert.equal(getWorksheetStatus(null, "2026-09-20T13:00:00Z", now), "Not Started");
  assert.equal(getWorksheetStatus({ answers: { q1: "4" } }, "2026-09-20T13:00:00Z", now), "In Progress");
  assert.equal(getWorksheetStatus(null, "2026-09-20T11:00:00Z", now), "Closed");
  assert.equal(isWorksheetClosed("2026-09-20T11:00:00Z", now), true);
});
