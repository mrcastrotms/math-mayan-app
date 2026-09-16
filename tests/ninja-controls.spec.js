const { test, expect } = require("@playwright/test");

test.describe("Teacher Ninja Controls & Demerits", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  async function loginThroughStartScreen(page) {
    // 1. Click the first class section button
    const firstSectionBtn = page.locator('form button[type="button"]').first();
    if (await firstSectionBtn.isVisible().catch(() => false)) {
      await firstSectionBtn.click();
    }

    // 2. Fill student name input
    const nameInput = page
      .locator('input[placeholder*="Sofie" i], input[type="text"]')
      .first();
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill("Test Student");
    }

    // 3. Fill code input with master bypass code "00000"
    const codeInput = page
      .locator('input[placeholder*="CODE" i], input[type="text"]')
      .last();
    if (await codeInput.isVisible().catch(() => false)) {
      await codeInput.fill("00000");
    }

    // 4. Click Start submit button
    const startBtn = page
      .locator('button[type="submit"]')
      .filter({ hasText: /start|comenzar/i })
      .first();
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click();
    }
  }

  test("should increase demerits when question text is double-clicked", async ({
    page,
  }) => {
    await loginThroughStartScreen(page);

    try {
      await page.waitForSelector("text=/question|preguntas?/i", {
        timeout: 15000,
      });
    } catch (err) {
      console.log("URL:", page.url());
      console.log("HTML:", await page.content());
      throw err;
    }

    const questionText = page
      .locator('.question-text, [data-testid="question-text"], h2, p')
      .first();
    await expect(questionText).toBeVisible();
    await questionText.dblclick();

    const demeritCounter = page
      .locator('.demerits-count, [data-testid="demerits"]')
      .first();
    await expect(demeritCounter).toContainText("1");
  });

  test("should trigger timer overrides on double-clicks with PIN 2026", async ({
    page,
  }) => {
    await loginThroughStartScreen(page);

    try {
      await page.waitForSelector("text=/question|preguntas?/i", {
        timeout: 15000,
      });
    } catch (err) {
      console.log("URL:", page.url());
      console.log("HTML:", await page.content());
      throw err;
    }

    page.once("dialog", async (dialog) => {
      await dialog.accept("2026");
    });

    const timerElement = page
      .locator('.timer, [data-testid="exam-timer"]')
      .first();
    await expect(timerElement).toBeVisible();
    await timerElement.dblclick();

    await expect(timerElement).toContainText(/0?1:00|60s|60/i, {
      timeout: 5000,
    });
  });
});
