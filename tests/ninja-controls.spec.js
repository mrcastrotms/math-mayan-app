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

    // Dispatch native dblclick to ensure event fires reliably across headless CI
    await questionText.dispatchEvent("dblclick");

    // Check if the infraction button or behavior modal is triggered
    const infractionBtn = page.getByRole("button", { name: /Off-Task/i });

    // Fallback: if double-click didn't register via dispatch, try standard dblclick
    if (
      !(await infractionBtn.isVisible({ timeout: 2000 }).catch(() => false))
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
    const timerElement = page
      .locator('.timer, [data-testid="exam-timer"]')
      .first();
    await expect(timerElement).toBeVisible({ timeout: 15000 });

    // Set up dialog handler before triggering event
    page.on("dialog", async (dialog) => {
      await dialog.accept("2026");
    });

    // Dispatch direct native dblclick
    await timerElement.dispatchEvent("dblclick");

    // Check if modal appears (if migrated to PinModal) or if prompt handled it
    const modalInput = page
      .locator('input[placeholder*="PIN"], input[type="password"]')
      .first();
    if (await modalInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await modalInput.fill("2026");
      const confirmBtn = page.getByRole("button", {
        name: /Confirm|OK|Submit/i,
      });
      await confirmBtn.click();
    } else {
      // Fallback for clickCount: 2 if dispatchEvent didn't trigger prompt
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
