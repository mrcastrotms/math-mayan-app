import { test, expect } from "@playwright/test";

test.describe("Exam UI foundation", () => {
  test("persists the selected high-contrast theme across reloads", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "High Contrast" }).click();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "contrast");
    await expect(page.evaluate(() => localStorage.getItem("math_app_theme"))).resolves.toBe(
      "contrast",
    );

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "contrast");
  });

  test("keeps the gate usable on a narrow touch viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByRole("button", { name: "START" })).toBeVisible();
    await expect(page.getByRole("button", { name: "High Contrast" })).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow-x", "visible");
  });
});
