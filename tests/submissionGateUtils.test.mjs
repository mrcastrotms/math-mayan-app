import test from "node:test";
import assert from "node:assert/strict";
import {
  slugifyIdentifier,
  buildExamDocId,
  buildClassworkDocId,
  isPriorSubmissionActive,
} from "../src/utils/submissionGateUtils.mjs";

test("slugifyIdentifier cleans spaces, accents, and special characters", () => {
  assert.equal(slugifyIdentifier("Ian Baquedano"), "ian_baquedano");
  assert.equal(slugifyIdentifier("5B "), "5b");
  assert.equal(slugifyIdentifier("Mía Sarahí"), "mia_sarahi");
});

test("buildExamDocId generates deterministic keys for official exam attempts", () => {
  const docId = buildExamDocId({
    sessionCode: "MTH01",
    section: "5B",
    studentIdentifier: "Ian Baquedano",
  });
  assert.equal(docId, "exam_mth01_5b_ian_baquedano");
});

test("buildExamDocId returns null for practice runs (00000) or test runs", () => {
  assert.equal(
    buildExamDocId({ sessionCode: "00000", section: "5B", studentIdentifier: "Ian" }),
    null
  );
  assert.equal(
    buildExamDocId({ sessionCode: "MTH01", section: "5B", studentIdentifier: "Ian", isTestRun: true }),
    null
  );
});

test("buildClassworkDocId generates deterministic keys for worksheets", () => {
  const docId = buildClassworkDocId({
    worksheetId: "ws-exponents-101",
    studentIdentifier: "5B_Ian_Baquedano",
  });
  assert.equal(docId, "cw_ws-exponents-101_5b_ian_baquedano");
});

test("isPriorSubmissionActive filters out soft-deleted or empty attempts", () => {
  assert.equal(isPriorSubmissionActive({ score: 85, isDeleted: false }), true);
  assert.equal(isPriorSubmissionActive({ score: 85, isDeleted: true }), false);
  assert.equal(isPriorSubmissionActive({ score: null, status: "NO_ATTEMPT" }), false);
});
