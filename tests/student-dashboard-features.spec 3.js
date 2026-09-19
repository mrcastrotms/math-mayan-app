import { test, expect } from "@playwright/test";

test.describe("Student entry UI", () => {
  test("renders section, name, and session-code controls", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Select your section")).toBeVisible();
    await expect(page.locator("input[type='text']")).toBeVisible();
    await expect(page.getByRole("button", { name: "START" })).toBeVisible();
  });
});
