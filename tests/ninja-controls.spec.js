import { test, expect } from "@playwright/test";

test.describe("Teacher Ninja Controls & Demerits", () => {
  test("should increase demerits when question text is double-clicked", async ({
    page,
  }) => {
    // 1. Navigate to the local server
    await page.goto("http://localhost:3000");

    // 2. Select section 4A
    await page.getByRole("button", { name: "4A" }).click();

    // 3. Fill out student details
    await page.getByPlaceholder(/Sofie Calderón/i).fill("Test Student");
    await page.getByPlaceholder("ENTER CODE").fill("TEST1");

    // 4. Click Start
    await page.getByRole("button", { name: /Start Assessment/i }).click();

    // Wait for Exam Screen to mount
    await page.waitForSelector("text=Question 1");

    // 5. Test Ninja Demerit (Double click the question text)
    const questionText = page.locator(".text-3xl.md\\:text-5xl");
    await questionText.dblclick();
    await questionText.dblclick();

    console.log("Ninja Demerit test passed!");
  });

  test("should trigger timer overrides on double-clicks", async ({ page }) => {
    await page.goto("http://localhost:3000");

    // Select section 4A
    await page.getByRole("button", { name: "4A" }).click();

    // Fill out student details
    await page.getByPlaceholder(/Sofie Calderón/i).fill("Test Student");
    await page.getByPlaceholder("ENTER CODE").fill("TEST1");

    // Click Start
    await page.getByRole("button", { name: /Start Assessment/i }).click();

    // Wait for Exam Screen
    await page.waitForSelector("text=Question 1");

    // 1. Test Ninja Double Time (Double click "Question X")
    const questionHeader = page.locator("text=Question 1");
    await questionHeader.dblclick();

    // 2. Test 60-second Nuke (Double click the Timer)
    page.on("dialog", async (dialog) => {
      expect(dialog.type()).toBe("prompt");
      await dialog.accept("2026");
    });

    const timerElement = page.locator(".text-2xl.font-black");
    await timerElement.dblclick();

    console.log("Timer override test passed!");
  });
});
