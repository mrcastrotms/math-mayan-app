const { test, expect } = require("@playwright/test");

test.describe("Teacher Ninja Controls & Demerits", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app root and wait for network/hydration to settle
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {
      // Fallback if networkidle takes too long in CI
    });
  });

  test("should increase demerits when question text is double-clicked", async ({
    page,
  }) => {
    // Target the start button with an explicit visibility check and generous timeout for CI
    const startButton = page.getByRole("button", { name: /Start Assessment/i });

    await expect(startButton).toBeVisible({ timeout: 20000 });
    await startButton.click();

    // Verify the exam screen is active
    await page.waitForSelector("text=Question 1", { timeout: 10000 });

    // Add your ninja control / double-click demerit logic here
    const questionText = page
      .locator('.question-text, [data-testid="question-text"]')
      .first();
    await expect(questionText).toBeVisible();
    await questionText.dblclick();

    // Assert demerit count increased (adjust selector per your app implementation)
    const demeritCounter = page.locator(
      '.demerits-count, [data-testid="demerits"]',
    );
    await expect(demeritCounter).toContainText("1");
  });

  test("should trigger timer overrides on double-clicks", async ({ page }) => {
    const startButton = page.getByRole("button", { name: /Start Assessment/i });

    await expect(startButton).toBeVisible({ timeout: 20000 });
    await startButton.click();

    await page.waitForSelector("text=Question 1", { timeout: 10000 });

    // Add your timer override double-click logic here
    const timerElement = page.locator('.timer, [data-testid="exam-timer"]');
    await expect(timerElement).toBeVisible();
    await timerElement.dblclick();

    // Verify override state triggered
    const overrideIndicator = page.locator(
      '.timer-override-active, [data-testid="timer-override"]',
    );
    await expect(overrideIndicator).toBeVisible();
  });
});
