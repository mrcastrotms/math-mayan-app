const { test, expect } = require("@playwright/test");

test.describe("Teacher Ninja Controls & Demerits", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app root and wait for DOM content to load without hanging on Firebase streams
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  test("should increase demerits when question text is double-clicked", async ({
    page,
  }) => {
    const startButton = page.getByRole("button", { name: /Start Assessment/i });

    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();

    await page.waitForSelector("text=Question 1", { timeout: 10000 });

    const questionText = page
      .locator('.question-text, [data-testid="question-text"]')
      .first();
    await expect(questionText).toBeVisible();
    await questionText.dblclick();

    const demeritCounter = page.locator(
      '.demerits-count, [data-testid="demerits"]',
    );
    await expect(demeritCounter).toContainText("1");
  });

  test("should trigger timer overrides on double-clicks", async ({ page }) => {
    const startButton = page.getByRole("button", { name: /Start Assessment/i });

    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();

    await page.waitForSelector("text=Question 1", { timeout: 10000 });

    const timerElement = page.locator('.timer, [data-testid="exam-timer"]');
    await expect(timerElement).toBeVisible();
    await timerElement.dblclick();

    const overrideIndicator = page.locator(
      '.timer-override-active, [data-testid="timer-override"]',
    );
    await expect(overrideIndicator).toBeVisible();
  });
});
