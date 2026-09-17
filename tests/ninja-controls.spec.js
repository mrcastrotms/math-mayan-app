const { test, expect } = require("@playwright/test");

test.describe("Teacher Ninja Controls", () => {
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

    await questionText.dispatchEvent("dblclick");

    const infractionBtn = page.getByRole("button", { name: /Off-Task/i });
    if (
      !(await infractionBtn.isVisible({ timeout: 1500 }).catch(() => false))
    ) {
      await questionText.dblclick({ force: true });
    }

    await expect(infractionBtn).toBeVisible({ timeout: 5000 });
    await infractionBtn.click();

    const demeritCounter = page
      .locator('.demerits-count, [data-testid="demerits"]')
      .first();
    await expect(demeritCounter).toContainText("1", { timeout: 5000 });
  });

  test("should trigger timer overrides on double-clicks with PIN 2026", async ({
    page,
  }) => {
    page.on("dialog", async (dialog) => {
      await dialog.accept("2026");
    });

    const timerElement = page
      .locator('.timer, [data-testid="exam-timer"]')
      .first();
    await expect(timerElement).toBeVisible({ timeout: 15000 });

    await timerElement.dispatchEvent("dblclick");

    const modalInput = page
      .locator('input[placeholder*="PIN"], input[type="password"]')
      .first();

    if (await modalInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await modalInput.fill("2026");
      const confirmBtn = page.getByRole("button", { name: /^Confirm$/i });
      await confirmBtn.click();
    } else {
      const timerText = await timerElement.innerText();
      if (
        !timerText.includes("01:00") &&
        !timerText.includes("1:00") &&
        !timerText.includes("60")
      ) {
        await timerElement.dblclick({ force: true });
      }
    }

    await expect(timerElement).toContainText(/0?1:00|60s|60/i, {
      timeout: 5000,
    });
  });
});
