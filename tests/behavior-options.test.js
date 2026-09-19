import assert from "node:assert/strict";
import test from "node:test";
import { BEHAVIOR_OPTIONS, getBehaviorOptions } from "../src/utils/behaviorOptions.js";

test("behavior options include six demerits and six merits", () => {
  assert.equal(getBehaviorOptions("demerit").length, 6);
  assert.equal(getBehaviorOptions("merit").length, 6);
});

test("behavior options include the requested direction labels", () => {
  assert.ok(BEHAVIOR_OPTIONS.some((option) => option.reason === "Does not follow directions"));
  assert.ok(BEHAVIOR_OPTIONS.some((option) => option.reason === "Follows directions"));
});

test("behavior option records have stable types and reasons", () => {
  for (const option of BEHAVIOR_OPTIONS) {
    assert.ok(["demerit", "merit"].includes(option.type));
    assert.equal(typeof option.reason, "string");
    assert.ok(option.reason.length > 0);
  }
});
