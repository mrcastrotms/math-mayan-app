import { test, expect } from "@playwright/test";

test.describe("Teacher dashboard class sections", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("teacher_authorized", "true");
      sessionStorage.setItem("exam_active_view", "dashboard");
      localStorage.setItem("math_app_sections", JSON.stringify(["4A", "4B"]));
    });

    await page.route("**/googleapis.com/**", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({}),
        });
        return;
      }
      await route.continue();
    });
  });

  test("shows an accessible delete control and confirms removal", async ({ page }) => {
    await page.goto("/?view=dashboard");

    const section = page.getByText("4A", { exact: true }).first();
    await expect(section).toBeVisible();
    const deleteButton = page.getByRole("button", { name: "Delete section 4A" });
    await expect(deleteButton).toBeVisible();

    await deleteButton.click();
    await expect(page.getByRole("heading", { name: "Delete Section 4A?" })).toBeVisible();
    await page.getByRole("button", { name: "Delete Section", exact: true }).click();

    await expect(page.getByRole("button", { name: "Delete section 4A" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Delete section 4B" })).toBeVisible();
  });
});
