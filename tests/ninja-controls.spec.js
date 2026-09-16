const { test, expect } = require("@playwright/test");

test.describe("Teacher Ninja Controls & Demerits", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  // Helper to complete student login using master bypass code 00000
  async function loginWithMasterCode(page) {
    const nameInput = page
      .locator(
        'input[data-testid="student-name-input"], input[placeholder*="name" i], input[placeholder*="nombre" i]',
      )
      .first();
    if (await nameInput.isVisible({ timeout: 4000 }).catch(() => false)) {
      await nameInput.fill("Test Student");

      const codeInput = page
        .locator(
          'input[data-testid="exam-code-input"], input[placeholder*="code" i], input[placeholder*="codigo" i]',
        )
        .first();
      if (await codeInput.isVisible()) {
        await codeInput.fill("00000");
      }

      const submitBtn = page
        .locator('button[data-testid="start-exam-btn"], button')
        .filter({ hasText: /start|begin|comenzar|iniciar|enter/i })
        .first();
      await submitBtn.click();
    }
  }

  test("should increase demerits when question text is double-clicked", async ({
    page,
  }) => {
    await loginWithMasterCode(page);

    try {
      await page.waitForSelector("text=/question 1|preguntas?/i", {
        timeout: 10000,
      });
    } catch (err) {
      console.log("FAILED URL:", page.url());
      console.log("PAGE HTML DUMP:", await page.content());
      throw err;
    }

    const questionText = page
      .locator('.question-text, [data-testid="question-text"]')
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
    await loginWithMasterCode(page);

    try {
      await page.waitForSelector("text=/question 1|preguntas?/i", {
        timeout: 10000,
      });
    } catch (err) {
      console.log("FAILED URL:", page.url());
      console.log("PAGE HTML DUMP:", await page.content());
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
