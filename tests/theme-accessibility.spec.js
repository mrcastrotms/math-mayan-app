import { test, expect } from "@playwright/test";

test.describe("system theme and teacher enforcement controls", () => {
  test("applies and persists the dark theme from the welcome screen", async ({ page }) => {
    await page.goto("/");

    const darkButton = page.getByRole("button", { name: "Dark", exact: true });
    await expect(darkButton).toBeVisible();
    await darkButton.click();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("renders teacher theme enforcement controls for the active section", async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("teacher_authorized", "true");
      sessionStorage.setItem("exam_active_view", "dashboard");
      localStorage.setItem("math_app_sections", JSON.stringify(["4A"]));
    });

    await page.goto("/?view=dashboard");

    await expect(page.getByRole("heading", { name: "Theme Enforcement" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Lock Theme", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Release Lock", exact: true })).toBeVisible();
    await expect(
      page.getByText("Broadcast the selected theme to active students in Section 4A."),
    ).toBeVisible();
  });
});
