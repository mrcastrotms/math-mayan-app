import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTheme, VALID_THEMES } from "../src/utils/themeUtils.mjs";

test("supports all accessible application themes", () => {
  assert.deepEqual(VALID_THEMES, ["default", "dark", "sepia", "contrast"]);
});

test("falls back safely for invalid persisted or remote themes", () => {
  assert.equal(normalizeTheme("dark"), "dark");
  assert.equal(normalizeTheme("neon"), "default");
  assert.equal(normalizeTheme(undefined), "default");
});
