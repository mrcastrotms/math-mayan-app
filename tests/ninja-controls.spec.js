const { test, expect } = require("@playwright/test");

test.describe("Teacher Ninja Controls & Demerits", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  async function loginWithMasterCode(page) {
    await page.waitForTimeout(500);

    const nameInput = page
      .locator(
        'input[data-testid="student-name-input"], input[placeholder*="name" i], input[placeholder*="nombre" i], input',
      )
      .first();
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill("Test Student");
    }

    const codeInput = page
      .locator(
        'input[data-testid="exam-code-input"], input[placeholder*="code" i], input[placeholder*="codigo" i], input[placeholder*="pin" i]',
      )
      .last();
    if (await codeInput.isVisible().catch(() => false)) {
      await codeInput.fill("00000");
    }

    const submitBtn = page
      .locator('button[data-testid="start-exam-btn"], button')
      .filter({ hasText: /start|begin|comenzar|iniciar|enter|login/i })
      .first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
    } else {
      await page
        .locator("button")
        .first()
        .click()
        .catch(() => {});
    }
  }

  test("should increase demerits when question text is double-clicked", async ({
    page,
  }) => {
    await loginWithMasterCode(page);

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
    await loginWithMasterCode(page);

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
