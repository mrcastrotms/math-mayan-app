import test from "node:test";
import assert from "node:assert/strict";
import {
  addSection,
  normalizeSection,
  removeSection,
} from "../src/utils/sectionUtils.mjs";

test("normalizes section labels before persistence", () => {
  assert.equal(normalizeSection(" 6a "), "6A");
});

test("adds a new section without mutating the current list", () => {
  const sections = ["4A"];
  assert.deepEqual(addSection(sections, " 6a "), ["4A", "6A"]);
  assert.deepEqual(sections, ["4A"]);
  assert.deepEqual(addSection(sections, "4A"), sections);
});

test("removes only the requested section", () => {
  assert.deepEqual(removeSection(["4A", "4B", "4C"], "4B"), ["4A", "4C"]);
});
