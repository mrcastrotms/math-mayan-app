import { test, expect } from "@playwright/test";

test("teacher can reach the accessible classwork assignment form", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("teacher_authorized", "true");
    sessionStorage.setItem("exam_active_view", "dashboard");
    localStorage.setItem("math_app_sections", JSON.stringify(["4A", "5B"]));
  });

  await page.goto("/?view=dashboard");

  await expect(page.getByRole("heading", { name: "Assign Classwork" })).toBeVisible();
  await expect(page.getByLabel("Title")).toBeVisible();
  await expect(page.getByRole("combobox").filter({ has: page.locator("option") }).last()).toBeVisible();
  await expect(page.getByLabel("Due date and time")).toBeVisible();
  await expect(page.getByLabel("Questions")).toBeVisible();
  await expect(page.getByRole("button", { name: "Post assigned work" })).toBeVisible();
});
