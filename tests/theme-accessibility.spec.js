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
    await expect(page.getByRole("heading", { name: "Attendance Book" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Behavior & Values Book" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Lock Theme", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Release Lock", exact: true })).toBeVisible();
    await expect(
      page.getByText("Broadcast the selected theme to active students in Section 4A."),
    ).toBeVisible();
  });

  test("opens the complete historical attendance and values report", async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("teacher_authorized", "true");
      sessionStorage.setItem("exam_active_view", "dashboard");
      localStorage.setItem("math_app_sections", JSON.stringify(["4A"]));
    });
    await page.goto("/?view=dashboard");
    await page.getByRole("button", { name: "Open complete attendance history" }).click();
    await expect(page.getByRole("heading", { name: "Attendance & Values History" })).toBeVisible();
    await expect(page.getByLabel("Date")).toBeVisible();
    await expect(page.getByLabel("Grade")).toBeVisible();
    await expect(page.getByText("Attendance trend")).toBeVisible();
    await page.getByRole("button", { name: "Back to dashboard" }).click();
    await expect(page.getByRole("heading", { name: "Attendance Book" })).toBeVisible();
  });

  test("keeps Standard theme text dark and activity choices touch-sized", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("math_app_theme", "default");
    });

    await page.goto("/?view=student-home");

    await expect(page.getByRole("heading", { name: "What do you want to do today?" })).toBeVisible();
    const activity = page.getByRole("button", { name: /Classwork Practice/ });
    await expect(activity).toBeVisible();
    expect(await activity.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(96);
    const welcomeCard = page.getByTestId("student-welcome-card");
    const cardBox = await welcomeCard.boundingBox();
    expect(cardBox.width).toBeGreaterThanOrEqual(768);
    await expect(page.getByRole("button", { name: "Standard", exact: true })).toBeVisible();
    expect(await page.getByRole("button", { name: "Standard", exact: true }).locator("..").evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(255, 255, 255)");
    expect(await page.getByRole("button", { name: "Standard", exact: true }).evaluate((element) => element.closest("[data-testid='student-welcome-card']"))).toBeNull();
    expect(await page.getByRole("button", { name: "Reset Session" }).evaluate((element) => element.closest("[data-testid='student-welcome-card']"))).toBeNull();
    expect(await page.locator("html").evaluate((element) => getComputedStyle(element).getPropertyValue("--app-fg").trim())).toBe("#0f172a");
    expect(await page.locator("body").evaluate((element) => getComputedStyle(element).color)).toMatch(/rgb\(15, 23, 42\)/);
  });

  test("keeps Student Home contained on phones with bottom controls", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      localStorage.setItem("exam_student_name", "Mobile Test Student");
      sessionStorage.setItem("exam_active_view", "student-home");
    });
    await page.goto("/?view=student-home");
    await expect(page.getByTestId("student-welcome-card")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Mobile student controls" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    expect(await page.getByRole("navigation", { name: "Mobile student controls" }).evaluate((element) => getComputedStyle(element).position)).toBe("fixed");
  });

  test("returns teachers to the Exam Gate from Student Version", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      sessionStorage.setItem("teacher_authorized", "true");
      sessionStorage.setItem("exam_active_view", "dashboard");
      localStorage.setItem("math_app_sections", JSON.stringify(["4A"]));
    });
    await page.reload();
    await page.getByRole("button", { name: "Student Version" }).click();
    await expect(page.getByRole("heading", { name: "Select your section" })).toBeVisible();
  });

  test("keeps teacher authentication through the dashboard and opens Gradebook", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Welcome", exact: true }).click();
    const teacherCode = page.getByPlaceholder("••••");
    await expect(teacherCode).toHaveAttribute("type", "text");
    await expect(teacherCode).toHaveAttribute("autocomplete", "off");
    await page.getByPlaceholder("••••").fill("0801");
    await page.getByRole("button", { name: "Confirm", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Teacher Dashboard" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await expect(page.getByRole("button", { name: "Dashboard", exact: true })).toBeVisible();
    await expect(page.locator("datalist")).toHaveCount(0);
  });
});
