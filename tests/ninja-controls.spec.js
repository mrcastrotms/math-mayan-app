const { test, expect } = require("@playwright/test");

test.describe("Teacher Ninja Controls & Demerits", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?bypass=true", { waitUntil: "domcontentloaded" });
  });

  test("should increase demerits when question text is double-clicked", async ({
    page,
  }) => {
    const questionText = page
      .locator('.question-text, [data-testid="question-text"]')
      .first();
    await expect(questionText).toBeVisible({ timeout: 15000 });
    await questionText.dblclick();

    const demeritCounter = page
      .locator('.demerits-count, [data-testid="demerits"]')
      .first();
    await expect(demeritCounter).toContainText("1");
  });

  test("should trigger timer overrides on double-clicks with PIN 2026", async ({
    page,
  }) => {
    page.once("dialog", async (dialog) => {
      await dialog.accept("2026");
    });

    const timerElement = page
      .locator('.timer, [data-testid="exam-timer"]')
      .first();
    await expect(timerElement).toBeVisible({ timeout: 15000 });
    await timerElement.dblclick();

    await expect(timerElement).toContainText(/0?1:00|60s|60/i, {
      timeout: 5000,
    });
  });
});
