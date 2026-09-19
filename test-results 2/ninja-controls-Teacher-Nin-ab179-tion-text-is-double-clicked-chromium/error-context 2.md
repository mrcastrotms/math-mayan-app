# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ninja-controls.spec.js >> Teacher Ninja Controls >> should increase demerits when question text is double-clicked
- Location: tests/ninja-controls.spec.js:8:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.question-text, [data-testid="question-text"]').first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('.question-text, [data-testid="question-text"]').first() with timeout 15000ms
  - waiting for locator('.question-text, [data-testid="question-text"]').first()

```

# Test source

```ts
  1  | const { test, expect } = require("@playwright/test");
  2  | 
  3  | test.describe("Teacher Ninja Controls", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto("/?bypass=true", { waitUntil: "domcontentloaded" });
  6  |   });
  7  | 
  8  |   test("should increase demerits when question text is double-clicked", async ({
  9  |     page,
  10 |   }) => {
  11 |     const questionText = page
  12 |       .locator('.question-text, [data-testid="question-text"]')
  13 |       .first();
> 14 |     await expect(questionText).toBeVisible({ timeout: 15000 });
     |                                ^ Error: expect(locator).toBeVisible() failed
  15 | 
  16 |     await questionText.dispatchEvent("dblclick");
  17 | 
  18 |     const infractionBtn = page.getByRole("button", { name: /Off-Task/i });
  19 |     if (
  20 |       !(await infractionBtn.isVisible({ timeout: 1500 }).catch(() => false))
  21 |     ) {
  22 |       await questionText.dblclick({ force: true });
  23 |     }
  24 | 
  25 |     await expect(infractionBtn).toBeVisible({ timeout: 5000 });
  26 |     await infractionBtn.click();
  27 | 
  28 |     const demeritCounter = page
  29 |       .locator('.demerits-count, [data-testid="demerits"]')
  30 |       .first();
  31 |     await expect(demeritCounter).toContainText("1", { timeout: 5000 });
  32 |   });
  33 | 
  34 |   test("should trigger timer overrides on double-clicks with PIN 2026", async ({
  35 |     page,
  36 |   }) => {
  37 |     page.on("dialog", async (dialog) => {
  38 |       await dialog.accept("2026");
  39 |     });
  40 | 
  41 |     const timerElement = page
  42 |       .locator('.timer, [data-testid="exam-timer"]')
  43 |       .first();
  44 |     await expect(timerElement).toBeVisible({ timeout: 15000 });
  45 | 
  46 |     await timerElement.dispatchEvent("dblclick");
  47 | 
  48 |     const modalInput = page
  49 |       .locator('input[placeholder*="PIN"], input[type="password"]')
  50 |       .first();
  51 | 
  52 |     if (await modalInput.isVisible({ timeout: 2000 }).catch(() => false)) {
  53 |       await modalInput.fill("2026");
  54 |       const confirmBtn = page.getByRole("button", { name: /^Confirm$/i });
  55 |       await confirmBtn.click();
  56 |     } else {
  57 |       const timerText = await timerElement.innerText();
  58 |       if (
  59 |         !timerText.includes("01:00") &&
  60 |         !timerText.includes("1:00") &&
  61 |         !timerText.includes("60")
  62 |       ) {
  63 |         await timerElement.dblclick({ force: true });
  64 |       }
  65 |     }
  66 | 
  67 |     await expect(timerElement).toContainText(/0?1:00|60s|60/i, {
  68 |       timeout: 5000,
  69 |     });
  70 |   });
  71 | });
  72 | 
```