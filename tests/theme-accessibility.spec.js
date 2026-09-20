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

  test("keeps Standard theme text dark and activity choices touch-sized", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("math_app_theme", "default");
    });

    await page.goto("/?bypass=true");

    await expect(page.getByRole("heading", { name: "What do you want to do today?" })).toBeVisible();
    const activity = page.getByRole("button", { name: /Classwork Practice/ });
    await expect(activity).toBeVisible();
    expect(await activity.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(96);
    const welcomeCard = page.getByTestId("student-welcome-card");
    const cardBox = await welcomeCard.boundingBox();
    expect(cardBox.width).toBeGreaterThanOrEqual(768);
    await expect(page.getByRole("button", { name: "Standard", exact: true })).toBeVisible();
    expect(await page.getByRole("button", { name: "Standard", exact: true }).evaluate((element) => element.closest("[data-testid='student-welcome-card']"))).toBeNull();
    expect(await page.getByRole("button", { name: "Reset Session" }).evaluate((element) => element.closest("[data-testid='student-welcome-card']"))).toBeNull();
    expect(await page.locator("html").evaluate((element) => getComputedStyle(element).getPropertyValue("--app-fg").trim())).toBe("#0f172a");
    expect(await page.locator("body").evaluate((element) => getComputedStyle(element).color)).toMatch(/rgb\(15, 23, 42\)/);
  });
});
