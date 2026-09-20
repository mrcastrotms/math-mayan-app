import test from "node:test";
import assert from "node:assert/strict";
import {
  formatSafeScore,
  formatRecordDate,
  getRecordTimestampMs,
  getDuplicateSubmissionKey,
  buildDuplicateSubmissionMap,
} from "../src/utils/gradebookUtils.mjs";

test("getDuplicateSubmissionKey normalizes student, section, and activity", () => {
  const record = {
    studentName: "  Gabriel Locandro  ",
    section: " 5b ",
    activityType: " Quiz ",
  };
  assert.equal(getDuplicateSubmissionKey(record), "gabriel locandro::5B::quiz");
});

test("buildDuplicateSubmissionMap ignores single submissions and NO_ATTEMPT", () => {
  const records = [
    { id: "rec1", studentName: "Student A", section: "4A", score: 80 },
    { id: "rec2", studentName: "Student B", section: "4A", status: "NO_ATTEMPT", score: null },
  ];
  const map = buildDuplicateSubmissionMap(records);
  assert.equal(map.size, 0);
});

test("buildDuplicateSubmissionMap detects duplicate attempts and orders earliest vs latest", () => {
  const records = [
    {
      id: "attempt-1",
      studentName: "Gabriel Antonio Locandro Espinal",
      section: "5B",
      activityType: "Quiz",
      score: 78,
      timestamp: 1726560000000, // Earlier
    },
    {
      id: "attempt-2",
      studentName: "Gabriel Antonio Locandro Espinal",
      section: "5B",
      activityType: "Quiz",
      score: 80,
      timestamp: 1726563600000, // Later
    },
  ];

  const map = buildDuplicateSubmissionMap(records);
  assert.equal(map.size, 2);

  const first = map.get("attempt-1");
  assert.equal(first.isDuplicate, true);
  assert.equal(first.isEarliest, true);
  assert.equal(first.isLatest, false);
  assert.equal(first.attemptNumber, 1);
  assert.equal(first.badgeText, "Attempt 1 (Earliest)");

  const second = map.get("attempt-2");
  assert.equal(second.isDuplicate, true);
  assert.equal(second.isEarliest, false);
  assert.equal(second.isLatest, true);
  assert.equal(second.attemptNumber, 2);
  assert.equal(second.badgeText, "Attempt 2 (Latest)");
});

test("supports triplicate attempts with intermediate attempt labels", () => {
  const records = [
    { id: "t1", studentName: "Student C", section: "4C", score: 60, timestamp: 100 },
    { id: "t2", studentName: "Student C", section: "4C", score: 70, timestamp: 200 },
    { id: "t3", studentName: "Student C", section: "4C", score: 85, timestamp: 300 },
  ];

  const map = buildDuplicateSubmissionMap(records);
  assert.equal(map.size, 3);
  assert.equal(map.get("t1").badgeText, "Attempt 1 (Earliest)");
  assert.equal(map.get("t2").badgeText, "Attempt 2");
  assert.equal(map.get("t3").badgeText, "Attempt 3 (Latest)");
});

test("reactively resets highlights when one attempt is purged", () => {
  const initialRecords = [
    { id: "sub1", studentName: "Kamilah Dickerman", section: "5B", score: 70, timestamp: 1000 },
    { id: "sub2", studentName: "Kamilah Dickerman", section: "5B", score: 70, timestamp: 2000 },
  ];

  const initialMap = buildDuplicateSubmissionMap(initialRecords);
  assert.equal(initialMap.has("sub1"), true);
  assert.equal(initialMap.has("sub2"), true);

  // Simulating purging sub2
  const updatedRecords = initialRecords.filter((r) => r.id !== "sub2");
  const updatedMap = buildDuplicateSubmissionMap(updatedRecords);

  // Remaining sub1 is no longer a duplicate
  assert.equal(updatedMap.has("sub1"), false);
  assert.equal(updatedMap.size, 0);
});
